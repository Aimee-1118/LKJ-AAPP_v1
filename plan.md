# 구현 계획 — 단계별 실행 가이드

전체 로직을 **한 번에 수행하기 쉬운 단계**로 쪼갠다. 각 단계는 독립적으로 완료·검증 가능하다.

---

## 폴더 구조 및 ID 관리 전략 (Folder Architecture)

### 1. 고정 계층 구조 (Fixed Hierarchy)

최상위 루트 폴더는 환경 변수 또는 최초 배포 시 생성 후 ID를 확보하고, 그 아래를 목적별로 분류한다.

- **Root:** `LKJ-AAPP` — 시스템 시작 시 또는 최초 배포 시 한 번 생성 후 ID 확보 (예: `GOOGLE_DRIVE_ROOT_FOLDER_ID`).
- **Users** — `LKJ-AAPP/Users/[User_ID]` (프로필 이미지 등).
- **Projects** — `LKJ-AAPP/Projects/[Project_ID]` (프로젝트 관련 모든 첨부 파일).
- **Public** — `LKJ-AAPP/Public` (로고, 공통 에셋 등, 선택 사항).

### 2. "ID 캐싱" 패턴 (핵심 로직)

Sheets는 DB 역할과 함께 **Drive 폴더 ID(바로가기) 저장소** 역할을 한다. 경로 탐색 없이 시트에서 읽은 `drive_folder_id`로 바로 해당 폴더에 접근한다.

- **User 시트 컬럼:** `id`, `name`, `email`, ..., `drive_folder_id`
- **Project 시트 컬럼:** `id`, `title`, ..., `drive_folder_id`, `files_json` (또는 `file_list`)

**프로젝트 생성 시:**

1. 사용자가 "새 프로젝트" 생성 (POST /api/projects).
2. 백엔드가 Drive에 `LKJ-AAPP/Projects/[새로운ID]` 폴더 생성.
3. Drive API가 반환한 `newFolderId`를 Project 시트의 `drive_folder_id` 컬럼에 저장.

**파일 업로드 시:**

1. 시트에서 해당 프로젝트의 `drive_folder_id` 조회.
2. 경로 탐색 없이 해당 ID 폴더로 바로 파일 업로드 스트림 전송.
3. 결과: 빠른 처리 + Drive API Quota 절약.

**동기화(Sync) 시:** 이미 저장된 `drive_folder_id`로 `listFiles(folderId)`만 호출하면 되므로 동일 패턴 유지.

---

## UI Component Strategy: FileDropzone

**원칙:** 재사용 가능한 **프레젠테이션 컴포넌트**로, `react-dropzone`을 감싼다. 업로드 API 호출은 컴포넌트 안에 두지 않는다.

### 컴포넌트: [src/components/ui/file-dropzone.tsx](src/components/ui/file-dropzone.tsx)

- **역할:** 파일 선택 + 드래그/드롭 상태 시각 처리만 담당.
- **Props (필수):**
  - `multiple: boolean` — 다중 선택 여부.
  - `accept` — 허용 파일 타입 (예: `{ 'image/*': ['.png', '.jpg'], 'application/pdf': ['.pdf'] }` 또는 MIME/확장자).
  - `maxSize: number` — 파일 크기 제한(바이트), 초과 시 검증 실패.
  - `onFilesSelected: (files: File[]) => void` — 선택/검증 통과 시 콜백.
- **Decoupling:** API 호출, `fetch`, 업로드 진행률 등은 **이 컴포넌트 안에 두지 않음**. 선택된 `File[]`만 부모에게 전달.

### 로직 위치: [src/lib/hooks/use-file-upload.ts](src/lib/hooks/use-file-upload.ts)

- **역할:** `onFilesSelected`로 받은 파일을 API로 전송, 진행률(Progress) 관리, 성공/실패 처리.
- **사용처:** 아카이브 생성 모달, 프로젝트 파일 업로드, 프로필 이미지 등에서 FileDropzone + use-file-upload 조합으로 사용.

**검증:** FileDropzone는 `onFilesSelected` 호출만 하고, use-file-upload에서 실제 업로드·에러·토스트를 처리하는지 확인.

---

## Role-Based Access Control (RBAC) Architecture

**Source of Truth:** 사용자 역할(admin, member, guest)은 **Google Sheet의 Users 시트**에 저장한다.

### Session 전략

- **NextAuth jwt callback:** 로그인 시 Sheet(Users 시트)에서 해당 사용자의 role을 조회해 JWT에 넣는다. 매 요청마다 Sheet를 조회하지 않는다.
- **NextAuth session callback:** `token.role`을 `session.user.role`로 노출한다. 클라이언트·서버에서 `session.user.role`만 사용.
- **규칙:** 페이지 로드마다 Sheet에서 role을 가져오지 않는다. 세션에 담긴 role만 사용한다.

### Security Layers

**1. UI — [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx)**

- 메뉴 항목을 `session.user.role`로 필터링한다.
- **설정 객체:** 경로(또는 메뉴 키) → 허용 역할 배열 매핑. 예: `{ '/dashboard/manage': ['admin', 'member'], '/dashboard/manage/project/new': ['admin', 'member'], '/dashboard/my-projects': ['admin', 'member'] }`.
- manage 영역과 **프로젝트 생성(새 프로젝트)** 경로는 admin·member 모두 접근·노출. 생성 **타입**에 따라 권한 분리(아래 3 참고).

**2. Route Protection — [src/app/dashboard/manage/layout.tsx](src/app/dashboard/manage/layout.tsx) (필수)**

- **서버 레이아웃**에서 **강제 검사**를 구현한다.
- `getServerSession()`으로 세션을 가져온 뒤, `session?.user?.role`이 **admin 또는 member가 아니면** 즉시 `redirect('/dashboard')` 한다. (예: `!['admin','member'].includes(session?.user?.role)`)
- `/dashboard/manage/*` 전체(프로젝트 리스트, 프로젝트 상세·진행 등)는 **admin과 member** 모두 접근 가능하다.

**3. 프로젝트 생성 — 일반은 admin만, Student Work는 admin·member (필수)**

- **경로:** `/dashboard/manage/project/new` 및 **POST /api/projects** (생성 요청). 위저드 진입은 **admin·member** 모두 가능(별도 redirect 없음).
- **타입별 권한:**  
  - **일반 프로젝트** 생성: **admin만** 허용.  
  - **Student Work(학생 작품)** 생성: **admin·member** 모두 허용.
- **UI:** 위저드 step-1(타입 선택)에서 member인 경우 "Student Work"만 선택 가능하도록 하거나, 일반 프로젝트를 선택하면 "일반 프로젝트 생성은 관리자만 가능합니다" 안내 후 진행 불가.
- **POST /api/projects:** 요청 body에 타입(예: `isStudentWork` 또는 `type: 'student-work'`)이 있으면, Student Work일 때 admin·member 모두 허용. 일반 프로젝트 생성이면 admin만 허용하고 member는 403.

**검증:** guest는 `/dashboard/manage` 접근 시 리다이렉트. member는 manage·프로젝트 목록·상세·**프로젝트 생성 페이지** 접근 가능. member는 Student Work만 생성 가능, 일반 프로젝트 생성 시도 시 403 또는 UI에서 차단. admin은 일반·Student Work 모두 생성 가능.

---

## Performance & Optimization Strategy

### 1. LCP 및 이미지 최적화 (Image Strategy)

**문제:** Google Drive 원본 링크(`drive.google.com/uc?...`)는 CDN이 아니어서 느리다. `<img>`에 그대로 쓰면 LCP 점수가 크게 떨어진다.

**솔루션: `next/image` 사용 (필수)**

- Next.js 서버(Vercel)가 Google Drive 이미지를 한 번 가져온다.
- 서버에서 WebP/AVIF 변환 및 사이즈 최적화 후, Vercel Edge Network(CDN)에 캐싱해 제공한다.

**구현:**

- **소스:** Drive 이미지 URL을 `next/image`의 `src`로 사용.
- **설정:** [next.config.js](next.config.js)의 `images.remotePatterns`에 `drive.google.com`, `lh3.googleusercontent.com` 추가.
- **LCP 대책:** [hero-section](src/components/home/hero-section.tsx)의 메인 이미지에 반드시 `priority` 속성을 부여해 프리로드(Preload)를 강제한다.

**검증:** Lighthouse LCP 개선, Drive URL이 next/image로 서빙되는지 확인.

---

### 2. 데이터 캐싱 전략 (Serverless Caching)

**제약:** Vercel 함수는 stateless라 인메모리 캐시는 인스턴스 간 공유되지 않는다. **현재 단계에서는 외부 Redis를 쓰지 않는다.** (프로젝트 규모에서 Vercel KV/Redis는 over-engineering일 수 있음.)

**솔루션: Next.js Data Cache (`unstable_cache`)**

- **캐시 저장소:** Next.js Data Cache (파일 시스템 기반, Vercel 배포 시 영구 스토리지로 동작). 람다 간 공유된다.
- **용도:** Google Sheets API 호출을 `unstable_cache`로 감싼다. Tags 예: `['projects']`, `['users']`.

**전략: On-Demand Revalidation (수요 기반 재검증)**

- **읽기:** 데이터는 `unstable_cache`에서 조회. 기본적으로 무기한 캐싱(`revalidate: false` 또는 `Infinity`).
- **쓰기:** 관리자 대시보드에서 수정/업로드/동기화 발생 시, 해당 API Route 또는 서비스에서 `revalidateTag('projects')`(또는 `'users'`)를 호출해 해당 캐시만 즉시 파기한다.
- **결과:** 평소 읽기 요청 시 Google Sheets API 호출이 0에 수렴해 속도가 빠르고, 수정 사항은 쓰기 직후 재검증으로 즉시 반영된다.

**규칙:** Sheets 조회 로직(예: fetch-rows, project-service의 목록 조회)은 `unstable_cache`로 래핑하고, 쓰기/업로드/동기화가 일어나는 API에서는 성공 후 `revalidateTag(...)` 호출.

**검증:** 목록 페이지 반복 접근 시 Sheets API 호출이 캐시 히트로 줄어드는지, 관리자 수정 후 새로고침 시 반영되는지 확인.

---

## Error Handling & Observability Strategy

### 1. Logging

- **instrumentation.ts:** 현재 단계에서는 **복잡한 OpenTelemetry 설정을 사용하지 않는다.** (나중에 필요 시 도입.)
- **구조화 로깅:** Vercel Runtime Logs에서 파싱·검색이 쉽도록 **JSON 형태**로 로그를 남긴다. 예: `console.error(JSON.stringify({ event, projectId, error: String(e) }))`.
- **대상:** Drive 업로드 실패, Sheet 동기화 실패 등 **중요 실패**에 한해 컨텍스트(`event`, `projectId`, `error`)를 포함해 로그한다.

### 2. API Response Standard

- **모든 API Route**는 [lib/types/api-response.ts](src/lib/types/api-response.ts)에 정의된 **공통 JSON 구조**를 반환해야 한다.

  - `{ success: boolean, data?: T, error?: { code: string, message: string } }`

- 성공 시 `success: true` + `data`. 실패 시 `success: false` + `error` (code, message). 클라이언트는 이 구조로 성공/실패와 메시지를 일관되게 처리한다.

### 3. Client-Side Handling

- **5xx 또는 일반 서버 오류:** shadcn/ui **toast**로 사용자에게 알린다. 재시도는 사용자 액션(버튼 클릭 등)으로만 수행.
- **4xx 검증 오류:** **React Hook Form**의 `setError` / 필드별 `errors`로 폼 내부에 표시한다. 토스트와 혼용하지 않는다.
- **No Automatic Retry:** Google API Quota 보호를 위해 **5xx 발생 시 자동 재시도는 하지 않는다.** 사용자가 직접 다시 시도하도록 한다.

**검증:** API가 api-response 형식을 따르는지, 클라이언트에서 4xx는 폼 에러·5xx는 토스트로 처리하는지, 자동 재시도가 없는지 확인.

---

## Testing & Verification Strategy

- **No Mocks for Google APIs:** `googleapis`를 목(mock)으로 대체하지 않는다. 가짜 응답으로 테스트하면 프로덕션에서 실패로 이어진다. 실제 연결·응답을 기준으로 검증한다.
- **Environment Isolation:** 개발(.env.local)과 프로덕션에서 **서로 다른** Google Sheet ID, Drive Folder ID를 사용한다. 개발용 시트/폴더와 운영용을 분리해 데이터 오염과 실수를 방지한다.
- **Verification Scripts:** 복잡한 Jest/통합 테스트 설정 대신, **scripts/** 아래 독립 스크립트를 둔다. 예: `scripts/verify-drive.ts`, `scripts/test-google-conn.ts`. **tsx**로 실행해 Drive·Sheets 실제 연결을 확인한다. UI 작업으로 넘어가기 전에 이 스크립트를 실행해 Cloud 연결이 되는지 반드시 확인한다.

**검증:** `tsx scripts/test-google-conn.ts` 실행 시 Drive·Sheets API 호출이 성공하는지 확인.

---

## Phase 0: 타입·스키마 (Sync/Drive/Sheets 공통 기반)

**목표:** Sync·Drive·Sheets에서 쓸 타입과 시트 컬럼 정의를 한 곳에 모은다.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 0-1 | `DriveFileMeta` 타입 정의 (id, name, mimeType, webViewLink) | [src/lib/types/google-schema.ts](src/lib/types/google-schema.ts) | 타입 import 시 에러 없음 |
| 0-2 | 프로젝트 시트 컬럼 상수 정의 (id, drive_folder_id, files_json 등 — Folder Architecture와 동일) | 동일 파일 | 상수 export 확인 |
| 0-3 | Project 타입에 driveFolderId, filesJson 필드 추가 (시트 drive_folder_id ↔ driveFolderId 매핑) | [src/lib/types/project.ts](src/lib/types/project.ts) | 프로젝트 Row 구조와 일치하는지 확인 |

**완료 조건:** Sync/Drive/Sheets 코드에서 위 타입·상수를 import해 쓸 수 있는 상태.

---

## Phase 1: 인증·라우팅 (Auth Spec)

**목표:** middleware는 세션 유무만 보고 리다이렉트, 프로필 완성 여부는 서버 레이아웃에서 처리한다.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 1-1 | Guest Only: `/login`, `/access-request` — 세션 있으면 `/dashboard`로 redirect | [middleware.ts](middleware.ts) | 로그인 후 login 접근 시 dashboard로 이동 |
| 1-2 | Protected: `/dashboard/*` — 세션 없으면 `/login`으로 redirect | 동일 | 미로그인 시 dashboard 접근 시 login으로 이동 |
| 1-3 | Onboarding: `/profile-setup` — 세션 없으면 `/login`, 있으면 통과 | 동일 | 로그인 후 profile-setup 접근 가능 |
| 1-4 | dashboard/layout.tsx에서 프로필 완성 여부 조회 후 미완료 시 redirect('/profile-setup') | [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx) | 프로필 미완료 사용자가 dashboard 접근 시 profile-setup으로 이동 |
| 1-5 | profile-setup 제출 성공 시 redirect('/dashboard') 또는 router.push('/dashboard') | [src/app/(auth)/profile-setup/page.tsx](src/app/(auth)/profile-setup/page.tsx) | 제출 후 dashboard로 이동 |

**완료 조건:** Guest/Onboarding/Protected 규칙이 plan 문서와 동일하게 동작.

---

## Phase 2: Google Drive — 폴더 내 파일 목록 (Google Core Services — Drive)

**목표:** 프로젝트 Drive 폴더 ID로 직계 자식 파일만 조회하는 함수를 만든다.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 2-1 | Drive API 인증 클라이언트 (JWT, getAccessToken) | [src/lib/google/auth-client.ts](src/lib/google/auth-client.ts) | 토큰 발급 성공 (로컬에서 호출 테스트) |
| 2-2 | listFiles(folderId): files.list, q: "'folderId' in parents", pageSize 제한(예: 200) | [src/lib/google/drive/list-files.ts](src/lib/google/drive/list-files.ts) | 테스트 폴더 ID로 호출 시 DriveFileMeta[] 반환 |
| 2-3 | drive/index.ts에서 listFiles re-export | [src/lib/google/drive/index.ts](src/lib/google/drive/index.ts) | `import { listFiles } from '@/lib/google/drive'` 동작 |

**완료 조건:** `listFiles(실제_폴더_ID)` 호출 시 파일 배열이 반환됨.

---

## Phase 3: Google Sheets — Row 조회·단일 셀 갱신 (Google Core Services — Sheets)

**목표:** 프로젝트 시트에서 id로 Row를 찾고, 특정 컬럼(파일 목록)만 갱신할 수 있게 한다.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 3-1 | fetch-rows: 시트 데이터 조회 (헤더 + 데이터 행), 캐싱은 선택 | [src/lib/google/sheets/fetch-rows.ts](src/lib/google/sheets/fetch-rows.ts) | 시트 ID·시트명으로 행 배열 반환 |
| 3-2 | mapper: Raw 행 배열 ↔ Project(또는 Row 객체) 변환, google-schema 컬럼 사용 | [src/lib/google/sheets/mapper.ts](src/lib/google/sheets/mapper.ts) | rowToProject / projectToRow 등 round-trip 일치 |
| 3-3 | update-row(또는 updateCell): spreadsheetId, sheetName, row 식별자(id), 컬럼명, 값 | [src/lib/google/sheets/update-row.ts](src/lib/google/sheets/update-row.ts) | 특정 프로젝트 Row의 filesJson 셀만 갱신됨 |
| 3-4 | sheets/index.ts에서 fetchRows, updateRow, mapper export | [src/lib/google/sheets/index.ts](src/lib/google/sheets/index.ts) | API·서비스에서 import 가능 |
| 3-5 | **검증:** Drive·Sheets 래퍼 구현 후 실제 Cloud 연결 확인. [scripts/test-google-conn.ts](scripts/test-google-conn.ts) 생성 후 `tsx scripts/test-google-conn.ts` 실행. 성공 시에만 UI(Phase 4~6) 진행 | [scripts/test-google-conn.ts](scripts/test-google-conn.ts) | tsx 실행 시 Drive·Sheets API 호출 성공 |

**완료 조건:** 프로젝트 id로 Row 조회 후, 해당 Row의 filesJson 셀만 업데이트 가능. **그리고** `scripts/test-google-conn.ts` 실행으로 실제 연결이 확인된 상태.

---

## Phase 4: Sync 서비스 레이어

**목표:** "Drive 폴더 스캔 → 해당 프로젝트 Row 파일 정보 갱신"을 한 함수로 묶는다.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 4-1 | syncProjectDriveToSheets(projectId): Sheets에서 Row·driveFolderId 조회 | [src/lib/services/project-service.ts](src/lib/services/project-service.ts) 또는 sync-service.ts | projectId 없음/ driveFolderId 없음 시 명확한 에러 |
| 4-2 | listFiles(driveFolderId) 호출 후 update-row로 filesJson 갱신, fileCount 반환 | 동일 | 동기화 후 시트에 파일 목록 반영, fileCount 일치 |

**완료 조건:** 서비스만 단독 호출(스크립트 또는 테스트)해도 Drive→Sheets 동기화가 완료됨.

---

## Phase 5: Sync API Route

**목표:** POST /api/projects/[id]/sync-drive에서 인증·권한 후 서비스 호출, 일관된 응답 형식.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 5-1 | POST만 허용, getServerSession() 없으면 401 | [src/app/api/projects/[id]/sync-drive/route.ts](src/app/api/projects/[id]/sync-drive/route.ts) | 미로그인 POST 시 401 |
| 5-2 | 해당 프로젝트 편집 권한 확인 (없으면 403) | 동일 | 권한 없는 사용자 POST 시 403 |
| 5-3 | syncProjectDriveToSheets(params.id) 호출, 200 + { success, fileCount } | 동일 | 성공 시 200 + JSON |
| 5-4 | 에러 시 400/403/500, api-response 형식으로 반환 | 동일 | driveFolderId 없음 400, Drive/Sheets 오류 500 |

**완료 조건:** 브라우저/Postman으로 POST 시 인증·권한·동기화 결과가 올바르게 반환됨.

---

## Phase 6: Progress 페이지 — 동기화 버튼·UI

**목표:** progress 페이지에서 버튼 클릭 시 API 호출, 로딩·성공·실패 피드백.

| 단계 | 작업 | 산출물 | 검증 |
|------|------|--------|------|
| 6-1 | "Drive와 동기화" 버튼, 클릭 시 POST /api/projects/[id]/sync-drive | [src/app/dashboard/manage/project/[id]/progress/page.tsx](src/app/dashboard/manage/project/[id]/progress/page.tsx) | 클릭 시 요청 전송 |
| 6-2 | 요청 중 버튼 비활성화 + 로딩 표시(스피너 또는 텍스트) | 동일 | 중복 클릭 방지, 로딩 표시 확인 |
| 6-3 | 성공 시 토스트 + "갱신된 파일 N개", 페이지 데이터 리페치(revalidate 또는 refetch) | 동일 | 토스트 노출, 파일 목록 UI 갱신 |
| 6-4 | 실패 시 토스트 에러 메시지, 401이면 로그인 페이지 이동, 403이면 권한 없음 메시지 | 동일 | 401/403/500 각각 동작 확인 |

**완료 조건:** Progress 페이지에서 버튼 한 번으로 Drive→Sheets 동기화가 되고, UI에 결과가 반영됨.

---

## 실행 순서 요약

```
Phase 0 (타입) → Phase 1 (Auth) → Phase 2 (Drive) → Phase 3 (Sheets) → Phase 4 (서비스) → Phase 5 (API) → Phase 6 (UI)
```

- **Phase 0·1**은 다른 Phase와 병렬로 진행 가능 (타입은 2·3·4에서, Auth는 전역에서 사용).
- **Phase 2·3**은 서로 독립적이므로 병렬 가능. 둘 다 끝난 뒤 Phase 4.
- **Phase 4** 완료 후 Phase 5·6은 순서대로 진행하면 된다.

**참고:** "프로젝트 생성 시 Drive에 `Projects/[Project_ID]` 폴더 생성 후 `drive_folder_id` 시트 저장"은 별도 플로우(새 프로젝트 위저드·POST /api/projects)에서 구현한다. 위 Folder Architecture의 "ID 캐싱" 패턴에 따라, 폴더 생성 API(`create-folder`)는 루트 ID(`GOOGLE_DRIVE_ROOT_FOLDER_ID`) 아래에 `Projects/[id]`를 만들고 반환된 ID를 시트에 기록하면 된다.

각 Phase 내 단계는 위 표 순서대로 진행하는 것을 권장한다.
