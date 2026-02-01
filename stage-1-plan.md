# Stage 1: 기반 구축 (Foundation) — 실행 계획

[plan-overview.md](plan-overview.md) Stage 1을 실행하기 위한 상세 계획이다.  
기술 스택·NextAuth 범위·UI·타입·API 검증에 대한 결정(Q1~22 답변)을 반영하였다.

**참조:** [file_structure.md](file_structure.md), [spec.md](spec.md) §5·§8·§11.

---

## 1. 기술 스택 및 환경 설정

### 1-1. Next.js·패키지 매니저

- **Next.js:** 15.x, App Router만 사용. React 19 기반.
- **패키지 매니저:** pnpm.
- **설치:** `pnpm create next-app@latest` 또는 기존 프로젝트에 Next.js 15·React 19·TypeScript·Tailwind·ESLint·App Router·src/ 적용. `@/*` path alias 설정.

### 1-2. TypeScript

- **strict:** `tsconfig.json`에서 `strict: true` 유지.
- **Path alias:** import 경로 단축을 위해 아래처럼 세분화.
  - `@/*` — 루트(src 기준)
  - `@/components/*` — src/components
  - `@/lib/*` — src/lib
  - `@/types/*` — src/lib/types (또는 types/ 별도 루트 시)
- **구현:** tsconfig.json `compilerOptions.paths`에 `"@/*": ["./src/*"]`, `"@/components/*": ["./src/components/*"]`, `"@/lib/*": ["./src/lib/*"]`, `"@/types/*": ["./src/lib/types/*"]` 추가.

### 1-3. ESLint·Prettier

- **ESLint:** Stage 1에서 설정 완료. Next.js 기본 ESLint 설정 유지·보완.
- **Prettier:** 설치 후 포맷 규칙 설정. ESLint와 충돌 방지(eslint-config-prettier 등).
- **검증:** `pnpm lint`, `pnpm format`(또는 format 스크립트) 실행 가능한 상태.

---

## 2. NextAuth 및 인증 (Stub)

### 2-1. lib/auth.ts

- **범위:** Stage 1에서는 NextAuth **설정 골격**만. 실제 Provider(Google/Credentials) 연동은 Stage 2.
- **포함:** `NextAuth()` 호출, `session: { strategy: 'jwt' }`, `pages` 또는 `providers` 빈 배열/주석, `callbacks` 골격(jwt, session — 나중에 role 주입용 자리만 확보).
- **파일:** [src/lib/auth.ts](src/lib/auth.ts).

### 2-2. SessionProvider 래핑

- **위치:** 루트 레이아웃 또는 layout 그룹에서 클라이언트용 Provider 래핑.
- **구현:** `SessionProvider`로 children 감싸기. `"use client"` 컴포넌트로 Provider 래퍼 하나 만든 뒤 [src/app/layout.tsx](src/app/layout.tsx)에서 사용.
- **세션 방식:** JWT + role in token (Stage 2에서 Users 시트 role 주입).

### 2-3. 환경 변수 템플릿

- **파일:** .env.local (Git 제외). Stage 1에서 **템플릿**만 작성.
- **항목:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET` 등 NextAuth 필수 변수. 주석으로 설명 추가. Google/Sheets/Drive 변수는 Stage 4용으로 주석만 남겨 둬도 됨.

### 2-4. Middleware

- **범위:** Stage 1에서는 **Stub** — 모든 요청에 `NextResponse.next()`만 반환. Auth 리다이렉트는 Stage 2에서 구현.
- **파일:** [middleware.ts](middleware.ts) (루트). `matcher`는 NextAuth 권장 범위 유지.

---

## 3. UI 및 공통 컴포넌트

### 3-1. Shadcn UI

- **범위:** [file_structure.md](file_structure.md) components/ui에 언급된 컴포넌트를 Stage 1에서 **전부** 설치.
- **목록:** button, input, textarea, select, card, dialog, toast, avatar, badge, progress, calendar, skeleton, file-dropzone(또는 file-dropzone은 react-dropzone 의존성만 추가 후 Stage 8에서 구현해도 됨 — 명세서 기준으로는 Stage 1에 “설치”만 하거나, 나중에 추가 가능).
- **설치:** `pnpm dlx shadcn@latest init` 후 `pnpm dlx shadcn@latest add button input textarea select card dialog toast avatar badge progress calendar skeleton` 등. file-dropzone은 커스텀이라 shadcn add가 없으면 스텁 파일만 만들어 두기.

### 3-2. 테마

- **기본:** 라이트 테마로 시작.
- **next-themes:** 설치 후 설정만 해 두기. `ThemeProvider`로 레이아웃 감싸기. 다크 모드 토글 UI는 Stage 1 필수 아님.

### 3-3. 앱 뼈대

- **app/page.tsx:** (public)/page로 리다이렉트하거나, 랜딩 구조를 잡기. `redirect('/')`가 (public)과 겹치지 않도록 (public)/page.tsx가 `/`를 담당한다면 app/page.tsx는 (public) 레이아웃 하위로 가져가거나, app/page.tsx에서 (public)과 동일한 레이아웃·콘텐츠를 쓰도록 구성.
- **loading.tsx:** 루트·필요한 레이아웃에 기본 스켈레톤 또는 스피너만 포함. 전체 UX 흐름용.
- **error.tsx, global-error.tsx:** 기본 에러 메시지·재시도 버튼만 포함. `"use client"` 유지.
- **not-found.tsx:** 404 메시지·홈 링크 정도.

---

## 4. 데이터 스키마 및 API 계약

### 4-1. 타입 정의 (전체 필드)

- **원칙:** 나중에 필드 추가 시 서비스 전반 수정이 발생하므로, **전체 필드를 한 번에** 정의.
- **google-schema.ts:** [spec.md](spec.md) §5, [file_structure.md](file_structure.md) lib/types.
  - `DriveFileMeta` (id, name, mimeType, webViewLink 등).
  - 시트 컬럼 상수: User 시트(id, name, email, ..., drive_folder_id, role), Project 시트(id, title, ..., drive_folder_id, files_json) 등 명세·Folder Architecture에 맞게 정의.
- **project.ts:** Project 타입 전체 필드 (id, title, driveFolderId, filesJson 등). 시트 drive_folder_id ↔ driveFolderId 매핑 명시.
- **user.ts:** User 타입 전체 필드 (id, name, email, role, drive_folder_id 등).
- **파일 위치:** [src/lib/types/](src/lib/types/).

### 4-2. API 응답 형식

- **구조:** `{ success: boolean, data?: T, error?: { code: string, message: string }, timestamp?: string }`. 디버깅을 위해 **timestamp** 추가 권장.
- **파일:** [src/lib/types/api-response.ts](src/lib/types/api-response.ts). 헬퍼 함수(예: `apiSuccess(data, status)`, `apiError(code, message, status)`) export 시 구현 시 일관 적용 가능.

### 4-3. 검증용 더미 API

- **목적:** 공통 응답 형식이 잘 작동하는지 테스트.
- **엔드포인트:** GET /api/health 또는 GET /api/auth/me 중 하나(또는 둘 다).
  - **GET /api/health:** `{ success: true, data: { status: 'ok' }, timestamp: new Date().toISOString() }` 반환.
  - **GET /api/auth/me:** 세션 없으면 `{ success: false, error: { code: 'UNAUTHORIZED', message: '...' }, timestamp: ... }`, 있으면 `{ success: true, data: session.user, timestamp: ... }` (Stage 2에서 세션 연동 후 활용).
- **구현:** [src/app/api/health/route.ts](src/app/api/health/route.ts) 또는 [src/app/api/auth/me/route.ts](src/app/api/auth/me/route.ts). api-response 타입·헬퍼 사용.

---

## 5. 폴더 구조 점검

- **기준:** [file_structure.md](file_structure.md). 이미 생성된 폴더 구조와 일치하는지 점검.
- **확인:** app/(auth), (public), dashboard, api 및 components, lib, public 등. 누락된 디렉터리만 보완.

---

## 6. 기타 설정

### 6-1. instrumentation.ts

- **범위:** 복잡한 OpenTelemetry 미사용(spec §10). Stage 1에서는 **비워 두거나** 최소 export만 두기.

### 6-2. next.config

- **Stage 1:** images.remotePatterns(drive.google.com, lh3.googleusercontent.com)는 Stage 9에서 적용해도 됨. Stage 1에서는 기본 next.config만 있으면 됨.

### 6-3. .env 파일

- **.env.local:** NextAuth·(선택) Google 템플릿. Git 제외.
- **.env.development / .env.production:** 필요 시 템플릿만. 실제 값은 Stage 4·11에서 채움.

---

## 7. 실행 순서 요약

1. Next.js 15·pnpm·TypeScript(strict)·path alias 설정.
2. ESLint·Prettier 설정.
3. lib/auth.ts 골격, SessionProvider 래핑, .env.local 템플릿, middleware stub.
4. Shadcn UI 전 컴포넌트 설치, next-themes 설정.
5. app/page, loading, error, not-found 뼈대.
6. lib/types 전체(google-schema, project, user, api-response) 정의.
7. GET /api/health(또는 /api/auth/me) 더미 API 구현.
8. 폴더 구조 점검, instrumentation 등 나머지 설정.

---

## 8. 완료 조건

- `pnpm install`, `pnpm dev` 실행 시 앱이 기동된다.
- `pnpm lint`(및 format) 통과.
- `@/lib/types`(또는 `@/types`)에서 google-schema, project, user, api-response를 import할 수 있다.
- GET /api/health(또는 /api/auth/me) 호출 시 공통 응답 형식( success, data 또는 error, timestamp )으로 응답한다.
- NextAuth SessionProvider가 레이아웃에 적용되어 있으며, middleware는 stub으로 모든 요청을 통과시킨다.

---

## 9. 문서 참조

| 문서 | 참고 내용 |
|------|------------|
| [plan-overview.md](plan-overview.md) | Stage 1 목표·완료 조건 |
| [file_structure.md](file_structure.md) | 루트 설정·app·components·lib 트리 |
| [spec.md](spec.md) | §5 데이터 레이어, §8 API 계약, §11 환경·검증 |

이 순서대로 진행하면 Stage 1 기반 구축이 완료된다.
