# LKJ-AAPP 전체 구현 계획 — 큰 단계 (Overview)

전체 웹 페이지 구현 순서를 **큰 단계**로 나눈 문서이다.  
상세 실행 단계(Phase 0~6 등)는 [plan.md](plan.md), 구조·정책은 [file_structure.md](file_structure.md), 기술 명세는 [spec.md](spec.md)를 참고한다.  
Cursor Plans의 [plan.md](c:\Users\USER\.cursor\plans\plan.md) (Drive–Sheets Sync, Auth Spec 등) 내용을 이 큰 단계에 반영하였다.

---

## 단계 흐름 요약

```
Stage 1 (기반) → Stage 2 (인증·라우팅) → Stage 3 (RBAC) → Stage 4 (Google Core) → Stage 5 (데이터·API)
    → Stage 6 (대시보드·관리) → Stage 7 (공개·랜딩) → Stage 8 (업로드·아카이브·동기화) → Stage 9 (성능·검증)
```

- **Stage 1·2·3**은 서로 의존성이 있으므로 순서대로 진행하는 것이 안전하다.
- **Stage 4** 완료 후 `scripts/test-google-conn.ts` 실행으로 실제 연결 확인한 뒤 Stage 5~8 진행.
- **Stage 6·7**은 데이터·API가 갖춰진 뒤 병렬 또는 순차 진행 가능. **Stage 8**은 Drive/Sheets·archive-service가 준비된 뒤 진행.

---

## Stage 1: 기반 구축 (Foundation)

**목표:** 프로젝트 뼈대, 공통 타입·API 계약, Next.js·Tailwind·Shadcn 기본 설정.

- **프로젝트·설정:** Next.js App Router, TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js 설치·설정. [file_structure.md](file_structure.md) 루트 설정 파일(middleware, next.config, tailwind, tsconfig 등) 골격.
- **타입·스키마:** [spec.md](spec.md) §5·§8 참고. `lib/types/` — google-schema(DriveFileMeta, 시트 컬럼 상수 drive_folder_id, files_json), project, user, **api-response**(공통 응답 `{ success, data?, error? }`).
- **폴더 구조:** [file_structure.md](file_structure.md) 기준으로 app/(auth), (public), dashboard, api 및 components, lib, public 폴더 구조 확정(이미 생성된 상태라면 점검).
- **환경 변수:** .env.local 등 환경 분리, 개발/프로덕션 Sheet·Drive ID 분리(spec §11, Environment Isolation).

**완료 조건:** 앱이 빌드·실행되며, 공통 타입·api-response를 import할 수 있는 상태.

---

## Stage 2: 인증·라우팅 (Auth & Routing)

**목표:** NextAuth 연동, 세션 기반 1차 리다이렉트, 프로필 완료 검사.

- **NextAuth:** [spec.md](spec.md) §3, [plan.md](plan.md) Phase 1. auth/[...nextauth] route, lib/auth.ts 기본 설정. Provider는 Credentials/Google 등 요구사항에 맞게 선택.
- **Middleware:** [file_structure.md](file_structure.md) middleware 주석. Guest Only(/login, /access-request) — 로그인 시 /dashboard 리다이렉트. Onboarding(/profile-setup) — 미로그인 시 /login. Protected(/dashboard/*) — 미로그인 시 /login.
- **Server-Side:** dashboard/layout.tsx에서 프로필 완성 여부 조회 후 미완료 시 redirect('/profile-setup'). spec §3.
- **Auth 페이지:** (auth)/login, access-request, profile-setup 페이지·레이아웃. profile-setup 제출 성공 시 redirect('/dashboard').

**완료 조건:** 로그인/로그아웃·Guest/Protected/Onboarding 규칙이 spec·plan과 동일하게 동작.

---

## Stage 3: 역할·접근 제어 (RBAC)

**목표:** Users 시트 role → 세션, sidebar 역할별 메뉴, manage·프로젝트 생성 권한.

- **Source of Truth:** Google Sheet Users 시트에 role(admin, member, guest) 저장. [spec.md](spec.md) §4.
- **Session:** lib/auth.ts — jwt callback에서 로그인 시 Users 시트 role 조회 후 JWT에 포함. session callback에서 session.user.role 노출. 페이지 로드마다 Sheet 조회 없음.
- **UI:** components/layout/sidebar.tsx — 경로 → 허용 역할 배열 설정 객체로 메뉴 필터. manage·프로젝트 생성 경로는 admin·member 노출.
- **Route Protection:** app/dashboard/manage/layout.tsx — role이 admin 또는 member가 아니면 redirect('/dashboard').
- **프로젝트 생성 권한:** manage/project/new 진입은 admin·member. 일반 프로젝트 생성=admin만, Student Work=admin·member. POST /api/projects에서 body 타입별 검사(spec §4).

**완료 조건:** guest/member/admin별 접근·메뉴·프로젝트 생성 권한이 spec과 일치.

---

## Stage 4: Google 연동 기반 (Google Core)

**목표:** Drive·Sheets API 래퍼 구현, 실제 연결 검증.

- **설정·인증:** lib/google/config.ts(이미 있음), auth-client.ts(JWT·getAccessToken). [plan.md](plan.md) Phase 2-1.
- **Drive:** lib/google/drive/ — create-folder, list-files, upload-file, permissions. index.ts에서 listFiles 등 export. Folder Architecture(LKJ-AAPP/Projects/[id])·ID 캐싱 패턴 준수. [spec.md](spec.md) §5, [file_structure.md](file_structure.md) lib/google/drive.
- **Sheets:** lib/google/sheets/ — fetch-rows(unstable_cache 래핑 권장), append-row, update-row, mapper. google-schema 컬럼(drive_folder_id, files_json 등) 사용. index.ts export. [plan.md](plan.md) Phase 3.
- **검증:** scripts/test-google-conn.ts 작성 후 tsx로 실행. Drive·Sheets 실제 연결 확인 후 다음 단계 진행. [plan.md](plan.md) Phase 3-5, spec §11.

**완료 조건:** listFiles(폴더ID)·시트 Row 조회/갱신이 동작하고, test-google-conn.ts 실행 성공.

---

## Stage 5: 데이터·서비스·API 골격 (Data & API)

**목표:** 서비스 레이어·API Route 골격, api-response 일관, 캐시·재검증 전략.

- **서비스:** lib/services/ — project-service(생성/수정/조회·drive_folder_id 저장), user-service, archive-service(Drive 폴더 조회·업로드·시트 갱신 트랜잭션). [file_structure.md](file_structure.md) archive 정책.
- **캐시:** Sheets 조회는 unstable_cache 래핑(Tags: projects, users). 쓰기/업로드/동기화 성공 시 revalidateTag 호출. [spec.md](spec.md) §9.
- **API 골격:** api/auth, user/profile·validate, projects(GET/POST)·projects/[id](GET/PATCH/DELETE)·projects/[id]/recruit·archive·sync-drive, courses/[id]/works, storage/upload·delete. 모든 Route는 lib/types/api-response.ts 형식 준수. [spec.md](spec.md) §8.
- **Sync 서비스:** syncProjectDriveToSheets(projectId) 구현. [plan.md](plan.md) Phase 4, Cursor plan §4·§5.

**완료 조건:** 주요 API가 api-response 형식으로 응답하며, 프로젝트 생성 시 Drive 폴더 생성·시트 drive_folder_id 저장이 동작.

---

## Stage 6: 대시보드·관리 영역 (Dashboard & Manage)

**목표:** 대시보드 레이아웃·사이드바, manage 목록·프로젝트 상세·진행, 동기화 버튼.

- **레이아웃·공통:** app/dashboard/layout.tsx, loading.tsx. components/layout/sidebar.tsx(RBAC 반영). dashboard 공통 컴포넌트(header, metric-cards 등).
- **대시보드 페이지:** dashboard/page(위젯 오버뷰), profile, teams·teams/[id], my-projects, lab-calendar, notices. [file_structure.md](file_structure.md) app/dashboard 트리.
- **Manage 영역:** manage/layout.tsx(RBAC), manage/projects/page(전체 프로젝트 테이블). manage/project/new/page(위저드 step-1 타입 선택·일반/Student Work). manage/project/[id]/layout·page·draft·recruit·progress. [spec.md](spec.md) §4.
- **동기화 UI:** manage/project/[id]/progress/page — "Drive와 동기화" 버튼, POST /api/projects/[id]/sync-drive, 로딩·토스트·리페치. [plan.md](plan.md) Phase 6, Cursor plan §6.

**완료 조건:** 로그인 사용자가 대시보드·manage 목록·프로젝트 상세·진행 탭을 사용할 수 있고, progress에서 동기화 버튼으로 Drive→Sheets 동기화가 동작.

---

## Stage 7: 공개·랜딩 페이지 (Public & Landing)

**목표:** (public) 레이아웃, 랜딩, about·people·courses·publications·projects 갤러리·상세.

- **레이아웃:** app/(public)/layout.tsx(Navbar/Footer). components/layout/navbar, footer.
- **랜딩:** (public)/page — hero-section(메인 이미지 priority 필수, LCP), metrics-ticker, featured-projects. [spec.md](spec.md) §9.
- **공개 페이지:** about, people·people/[id], courses·courses/[courseId]·student-works·[workId], publications, projects·projects/[id]. loading·error·not-found·opengraph-image 등. [file_structure.md](file_structure.md) app/(public) 트리.
- **컴포넌트:** components/home, project-detail 등. Drive 이미지는 next/image·remotePatterns 사용. [spec.md](spec.md) §9.

**완료 조건:** 비로그인 사용자가 랜딩·about·people·courses·publications·projects를 탐색할 수 있고, LCP·이미지 규칙이 적용됨.

---

## Stage 8: 업로드·아카이브·동기화 완성 (Upload, Archive & Sync)

**목표:** FileDropzone·use-file-upload, 아카이브 생성·파일 뷰어, sync-drive·archive API 연동.

- **UI 컴포넌트:** components/ui/file-dropzone.tsx(프레젠테이션, multiple/accept/maxSize/onFilesSelected). lib/hooks/use-file-upload.ts(API 전송·진행률·토스트). [spec.md](spec.md) §7.
- **아카이브:** dashboard/archive — archive-list, create-archive-modal(FileDropzone+use-file-upload), file-manager-view. api/projects/[id]/archive(POST) → archive-service 트랜잭션. [file_structure.md](file_structure.md) 업로드·아카이브 정책.
- **동기화:** api/projects/[id]/sync-drive(POST) 인증·권한·syncProjectDriveToSheets·api-response. progress 페이지와 연동은 Stage 6에서 완료. 필요 시 revalidateTag 연동.
- **storage/upload·delete:** 프로필 사진 등 DB 관계 느슨한 자산 전용. 프로젝트/아카이브 자료는 archive 경유만. [file_structure.md](file_structure.md).

**완료 조건:** 아카이브 생성 모달에서 파일 선택·업로드 후 Drive·시트에 반영되고, progress에서 동기화 버튼으로 파일 목록이 갱신됨.

---

## Stage 9: 성능·에러·검증 (Performance, Error & QA)

**목표:** LCP·캐시 정리, 에러·로깅 일관, 검증 스크립트·환경 분리.

- **이미지·LCP:** next.config.js images.remotePatterns(drive.google.com, lh3.googleusercontent.com). hero-section priority. Drive URL은 next/image만 사용. [spec.md](spec.md) §9.
- **캐시:** Sheets 조회 unstable_cache·revalidateTag 정리. 쓰기 경로에서 태그 무효화 확인. [spec.md](spec.md) §9.
- **에러·로깅:** 모든 API가 api-response 형식. 5xx→toast, 4xx→폼 에러. 자동 재시도 없음. 구조화 로깅(JSON), Drive/Sheet 실패 시 event·projectId·error. instrumentation.ts는 복잡한 OpenTelemetry 미사용. [spec.md](spec.md) §10.
- **검증·환경:** scripts/test-google-conn.ts·verify-drive.ts. 개발/프로덕션 Sheet·Drive ID 분리. Google API mock 미사용. [spec.md](spec.md) §11.

**완료 조건:** Lighthouse·캐시 동작 점검, API·클라이언트 에러 처리 일관, 검증 스크립트로 실제 연결 확인 가능.

---

## 문서 참조

| 문서 | 용도 |
|------|------|
| [plan.md](plan.md) | 상세 단계(Phase 0~6), Folder Architecture, RBAC, Performance, Error, Testing 전략 |
| [file_structure.md](file_structure.md) | 폴더·파일 트리, 역할별 주석, 업로드·아카이브 정책 |
| [spec.md](spec.md) | 기술 명세 뼈대, 시스템 개요·Auth·RBAC·데이터·API·성능·에러·검증 |
| Cursor Plans [plan.md](c:\Users\USER\.cursor\plans\plan.md) | Drive–Sheets Sync Data Flow, Auth Spec, 스키마·Drive·Sheets·Sync 서비스·API·Progress UI 상세 |

위 Stage를 순서대로 진행하면 전체 웹 페이지 구현이 단계별로 완성된다. 각 Stage 내부 작업은 plan.md Phase·file_structure.md·spec.md를 참고하여 세분화하면 된다.
