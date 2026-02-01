# Stage 2: 인증·라우팅 (Auth & Routing) — 실행 계획

[plan-overview.md](plan-overview.md) Stage 2를 실행하기 위한 상세 계획이다.  
NextAuth Google OAuth 연동, Mock User 기반 role·프로필 완료 검사, Middleware 리다이렉트, Auth 페이지·폼을 반영하였다.

**참조:** [plan.md](plan.md) Phase 1, [spec.md](spec.md) §3, [file_structure.md](file_structure.md).

---

## 1. NextAuth 및 Google Provider

### 1-1. 로그인 방식

- **Provider:** Google OAuth 단독 사용. Credentials 미사용.
- **이유:** 데이터 저장소가 Google Sheets이므로 Google 계정 로그인이 자연스럽고, 비밀번호를 시트에 저장하는 위험을 피할 수 있음.
- **구현:** [src/lib/auth.ts](src/lib/auth.ts)에 `GoogleProvider` 추가, `authOptions.providers`에 등록.

### 1-2. Mock User 및 role 조회

- **범위:** Stage 2에서는 **Mock User List**(메모리 배열) 사용. Stage 4(Sheets 연동) 완료 후 실제 Sheets API 함수로 교체.
- **파일:** [src/lib/auth-mock.ts](src/lib/auth-mock.ts).
- **동작:** 이메일 기준으로 role 반환. 예: `admin@test.com` → `admin`, 그 외 허용 이메일 → `member` 또는 `guest`, 목록에 없음 → `guest`(또는 미할당).
- **인터페이스:** `getUserRoleByEmail(email: string): Promise<'admin' | 'member' | 'guest'>` 등. jwt callback에서 호출.

### 1-3. 로그인 후 이동(callbackUrl)

- **기본값:** 로그인 성공 시 `/dashboard`로 이동.
- **returnUrl 지원:** 사용자가 공유 링크(예: `/dashboard/manage/project/123`)로 접근했다가 로그인 페이지로 튕긴 경우, 로그인 성공 후 **해당 페이지**로 복귀.
- **구현:** NextAuth `callbacks.redirect`에서 `url` 파라미터(callbackUrl) 사용. 또는 로그인 버튼/페이지에서 `signIn('google', { callbackUrl: searchParams.get('callbackUrl') ?? '/dashboard' })` 전달.

---

## 2. Middleware (보호 정책)

- **파일:** [middleware.ts](middleware.ts) (루트). Stage 1 stub 제거 후 아래 규칙 적용.
- **세션 확인:** Edge에서 `getToken()`(NextAuth)으로 JWT 확인. 매 요청마다 Sheets 조회하지 않음.

### 2-1. Guest Only

- **경로:** `/login`, `/access-request`.
- **규칙:** 이미 로그인한 사용자(세션 있음)가 접근하면 `/dashboard`로 리다이렉트.

### 2-2. Protected

- **경로:** `/dashboard/:path*`, `/profile-setup`.
- **규칙:** 로그인하지 않은 사용자가 접근하면 `/login?callbackUrl=<현재 URL 인코딩>`으로 리다이렉트.

### 2-3. Onboarding

- **경로:** `/profile-setup`.
- **규칙:** 로그인은 했으나 프로필 미완료 사용자는 **Middleware가 아닌** [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx)에서 검사 후 `redirect('/profile-setup')` 처리. (프로필 완료 여부는 JWT `profileComplete` 등으로 판단.)

### 2-4. matcher

- **유지:** NextAuth 권장 matcher(정적·이미지·api/auth 제외) 유지. `/login`, `/access-request`, `/dashboard`, `/profile-setup` 등이 포함되도록 구성.

---

## 3. 프로필 완료 검사 (Onboarding Logic)

### 3-1. "완료" 기준

- **정의:** Mock User(또는 향후 Users 시트)에 해당 이메일이 **존재**하고, **role이 할당된** 상태.
- **조회 시점:** 로그인 시 **1회만** — jwt callback에서 Mock 조회 후 `token.role`, `token.profileComplete`(또는 `profileComplete`) 플래그를 JWT에 저장. 이후 매 페이지 이동마다 시트를 조회하지 않음(Quota 절약).

### 3-2. jwt / session callback

- **jwt callback:** Google 로그인 성공 후 `auth-mock.getUserRoleByEmail(email)` 호출.  
  - 목록에 있음 → `token.role = role`, `token.profileComplete = true`(또는 role 존재 시 완료로 간주).  
  - 목록에 없음(신규) → `token.role = 'guest'`, `token.profileComplete = false`.
- **session callback:** `session.user.role = token.role`, `session.user.profileComplete = token.profileComplete` 노출. (필요 시 `profileComplete`는 클라이언트/서버에서만 사용.)

### 3-3. 미완료 시 리다이렉트

- **위치:** [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx) (서버 레이아웃).
- **동작:** `getServerSession(authOptions)`로 세션 조회 후, `profileComplete === false`(또는 role 미할당)이면 `redirect('/profile-setup')`. 토스트는 선택 사항(리다이렉트만으로 충분).

---

## 4. Auth 페이지·폼

### 4-1. Login

- **파일:** [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx).
- **UI:** "Google로 계속하기" 버튼 하나.
- **동작:** `signIn('google', { callbackUrl: callbackUrl ?? '/dashboard' })`. `callbackUrl`은 `searchParams`에서 읽기.

### 4-2. Access Request (가입 요청)

- **파일:** [src/app/(auth)/access-request/page.tsx](src/app/(auth)/access-request/page.tsx).
- **역할:** Google 로그인은 되었으나 관리자가 승인(시트에 추가)하지 않은 유저가 보는 화면. Mock에 없거나 role이 guest인 경우 접근 가능.
- **UI:** 이름, 소속, 신청 사유 입력 폼.
- **동작 (Stage 2):** 제출 시 `console.log`로 payload 출력 + "요청되었습니다" 토스트. 실제 저장(API·Sheets)은 Stage 5에서 구현.

### 4-3. Profile Setup

- **파일:** [src/app/(auth)/profile-setup/page.tsx](src/app/(auth)/profile-setup/page.tsx).
- **필드:** 이름(실명), 소속(학과/부서), 연락처(선택).
- **동작 (Stage 2):** 제출 시 Mock 업데이트 또는 세션 갱신용 `update()` 호출 후 `router.push('/dashboard')`. 실제 시트 반영은 Stage 4·5에서.

---

## 5. 세션·환경 변수·로그아웃

### 5-1. Role 사용

- **필수:** `session.user.role`을 JWT·session callback에서 노출. Stage 3(RBAC)에서 sidebar·manage 접근 제어에 사용.

### 5-2. 로그아웃

- **위치:** 대시보드 사이드바 하단. [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx) (Stage 2에서 뼈대만 두거나, dashboard 레이아웃 내 로그아웃 버튼 배치).
- **동작:** `signOut({ callbackUrl: '/' })` 또는 `signOut()` 후 클라이언트에서 `/` 또는 `/login`으로 이동.

### 5-3. 환경 변수

- **파일:** `.env.local` (Git 제외), `.env.example` 업데이트.
- **항목:**
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google Cloud Console에서 OAuth 클라이언트 발급 후 설정).

---

## 6. 실행 순서 요약

1. **auth-mock.ts** — Mock User 목록·`getUserRoleByEmail` 구현.
2. **lib/auth.ts** — GoogleProvider 추가, jwt/session callback에서 Mock 조회·role·profileComplete 주입, redirect callback에서 callbackUrl 반영.
3. **middleware.ts** — Guest Only(/login, /access-request)·Protected(/dashboard/*, /profile-setup) 리다이렉트, callbackUrl 쿼리 유지.
4. **dashboard/layout.tsx** — 프로필 미완료 시 `redirect('/profile-setup')`.
5. **(auth)/login** — Google 버튼, callbackUrl 전달.
6. **(auth)/access-request** — 폼(이름, 소속, 신청 사유), 제출 시 로그·토스트.
7. **(auth)/profile-setup** — 폼(이름, 소속, 연락처), 제출 시 `update()` + `router.push('/dashboard')`.
8. **로그아웃** — dashboard 레이아웃 또는 sidebar 뼈대에 로그아웃 버튼.
9. **.env.example** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 주석 설명 추가.

---

## 7. 완료 조건 (검증 시나리오)

- **비로그인 → /dashboard 접근:** `/login?callbackUrl=...` 리다이렉트 확인.
- **이미 로그인 → /login 또는 /access-request 접근:** `/dashboard` 리다이렉트 확인.
- **Mock에 없는 Google 계정 로그인:** 로그인 후 `/access-request` 또는 `/profile-setup`으로 이동 확인(role/프로필 완료 정책에 따름).
- **Mock에 있는 관리자 계정(예: admin@test.com) 로그인:** `/dashboard` 정상 진입, `session.user.role === 'admin'` 확인.
- **로그아웃:** 버튼 클릭 시 세션 해제 및 로그인 페이지 또는 홈으로 이동 확인.
- **callbackUrl:** 보호된 페이지 URL로 접근 → 로그인 → 해당 페이지로 복귀되는지 확인.

---

## 8. 문서 참조

| 문서 | 참고 내용 |
|------|------------|
| [plan-overview.md](plan-overview.md) | Stage 2 목표·완료 조건 |
| [plan.md](plan.md) | Phase 1 인증·라우팅 단계표 |
| [spec.md](spec.md) | §3 인증·라우팅 (Auth Spec) |
| [file_structure.md](file_structure.md) | middleware, (auth), dashboard 레이아웃 |

이 순서대로 진행하면 Stage 2 인증·라우팅이 완료된다.
