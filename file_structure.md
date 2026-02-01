# 파일 구조 (plan.md 기반 정렬)

**폴더 생성 시 참고**

- **루트 이름:** 아래 트리의 `LKJ-AAPP_v1/`는 프로젝트 루트. 실제 로컬/배포 폴더명에 맞게 사용하면 됨 (현재 repo 루트에 그대로 생성 가능).
- **Next.js 경로 규칙:** 괄호·대괄호 포함 폴더명 그대로 사용 — `(auth)`, `(public)`, `[id]`, `[...nextauth]` 등.
- **시크릿/자동 생성:** `.env.local`, `.env.development`, `.env.production`은 수동 생성 후 Git 제외. `.next-env.d.ts`는 `next`가 빌드 시 생성.
- **단계별 생성:** plan.md Phase 순서에 맞춰 필요한 폴더·파일만 먼저 만들어도 됨 (한 번에 전부 만들 필요 없음).

---

LKJ-AAPP_v1/
├── .env.local                  # [로컬] 시크릿 (API Keys 등) — Git 제외. plan: 개발용 Sheet ID·Drive Folder ID (Environment Isolation)
├── .env.development            # [개발] next dev 시 자동 로드
├── .env.production             # [배포] next build/start 시 자동 로드 (Vercel에서는 대시보드 환경변수 사용 권장)
├── .eslintrc.json              # [설정] Linting 규칙
├── .gitignore                  # [설정] Git 무시 목록 (반드시 .env*.local 포함)
├── .next-env.d.ts              # [Types] Next.js 자동 생성 타입
├── instrumentation.ts          # [Observability] 현재 단계에서는 복잡한 OpenTelemetry 미사용 (plan: Error Handling)
├── middleware.ts               # [Middleware] Auth Spec: 세션 유무만 Edge에서 1차 리다이렉트 (Guest/Protected/Onboarding)
├── next.config.js              # [설정] Next.js 구성. images.remotePatterns에 drive.google.com, lh3.googleusercontent.com (LCP/이미지 전략)
├── package.json                # [의존성] 라이브러리 목록 및 스크립트
├── postcss.config.js           # [CSS] PostCSS 설정
├── tailwind.config.ts          # [CSS] Tailwind 디자인 토큰 설정
├── tsconfig.json               # [Types] TypeScript 컴파일 설정
├── scripts/                    # [검증] plan: Testing. tsx로 실행, Google API 실제 연결 확인 (mock 미사용)
│   ├── test-google-conn.ts    # Drive·Sheets 연결 검증 (Phase 3-5). UI 작업 전 필수
│   └── verify-drive.ts        # (선택) Drive 단독 검증
└── src/
    ├── app/
    │   ├── favicon.ico                 # 🖼️ 정적 파비콘
    │   ├── globals.css                 # 🎨 전역 CSS (Tailwind Directives)
    │   ├── layout.tsx                  # 🌍 [Root Layout] HTML, Body, Providers
    │   ├── loading.tsx                 # ⏳ [Global Loading] 루트 레벨 서스펜스
    │   ├── not-found.tsx               # 🚫 [Global 404] 찾을 수 없는 페이지
    │   ├── error.tsx                   # ⚠️ [Global Error] 일반 런타임 에러
    │   ├── global-error.tsx            # ☠️ [Root Error] 최상위 레이아웃 에러 핸들링
    │   ├── sitemap.ts                  # 🗺️ [SEO] 사이트맵 XML 동적 생성
    │   ├── robots.ts                   # 🤖 [SEO] 로봇 텍스트 동적 생성
    │   │
    │   ├── (auth)/                     # 🔐 [Group] 인증 (URL 경로 없음)
    │   │   ├── layout.tsx              # 🖼️ 인증 전용 센터링 레이아웃
    │   │   ├── login/
    │   │   │   └── page.tsx            # 🔑 로그인 폼
    │   │   ├── access-request/
    │   │   │   └── page.tsx            # 📝 가입 요청 폼
    │   │   └── profile-setup/
    │   │       └── page.tsx            # ✨ 추가 정보 입력
    │   │
    │   │
    │   ├── (public)/                   # 🌐 [Group] 방문자용 공개 페이지
    │   │   ├── layout.tsx              # 🖼️ Public Navbar/Footer 레이아웃
    │   │   ├── page.tsx                # 🏠 [Home] 메인 랜딩 페이지 (/)
    │   │   ├── about/
    │   │   │   └── page.tsx            # 📄 연구실 소개
    │   │   ├── people/
    │   │   │   ├── page.tsx            # 👥 멤버 리스트
    │   │   │   └── [id]/               # 👤 멤버 상세 (Dynamic)
    │   │   │       ├── page.tsx        # 📄 상세 페이지
    │   │   │       ├── loading.tsx     # ⏳ 데이터 로딩 스피너
    │   │   │       └── error.tsx       # ⚠️ 데이터 페칭 에러
    │   │   ├── courses/
    │   │   │   ├── page.tsx            # 📚 강의 목록
    │   │   │   └── [courseId]/         # 📖 강의 상세 (Dynamic)
    │   │   │       ├── page.tsx
    │   │   │       └── student-works/
    │   │   │           ├── page.tsx    # 🎨 학생 작품 리스트
    │   │   │           └── [workId]/   # 🖼️ 작품 상세
    │   │   │               └── page.tsx
    │   │   ├── publications/
    │   │   │   └── page.tsx            # 📜 논문 목록
    │   │   └── projects/
    │   │       ├── page.tsx            # 🚀 프로젝트 갤러리
    │   │       └── [id]/               # 📍 프로젝트 상세 (Dynamic)
    │   │           ├── page.tsx        # 📄 프로젝트 상세 내용
    │   │           ├── loading.tsx     # ⏳ 프로젝트 로딩
    │   │           ├── not-found.tsx   # 🚫 존재하지 않는 프로젝트
    │   │           └── opengraph-image.tsx # 🖼️ [SEO] 동적 OG 이미지 생성
    │   │
    │   ├── dashboard/                  # 🎛️ [Protected] 대시보드
    │   │   ├── layout.tsx              # 🖼️ Dashboard 레이아웃. 프로필 미완료 시 redirect('/profile-setup') (Auth Spec)
    │   │   ├── page.tsx                # 📊 [Main] 위젯 오버뷰
    │   │   ├── loading.tsx             # ⏳ 대시보드 로딩
    │   │   ├── profile/
    │   │   │   └── page.tsx            # ⚙️ 내 정보 수정
    │   │   ├── teams/
    │   │   │   ├── page.tsx            # 🛡️ 팀 관리
    │   │   │   └── [id]/
    │   │   │       └── page.tsx        # 🛡️ 팀 상세
    │   │   ├── my-projects/
    │   │   │   └── page.tsx            # 📂 내 프로젝트
    │   │   ├── lab-calendar/
    │   │   │   └── page.tsx            # 📅 캘린더
    │   │   ├── notices/
    │   │   │   └── page.tsx            # 📢 공지사항
    │   │   └── manage/                         # 🛠️ 실무 관리 영역 (RBAC: admin, member 접근)
    │   │       ├── layout.tsx                  # [필수] RBAC: role이 admin 또는 member가 아니면 redirect('/dashboard')
    │   │       ├── projects/
    │   │       │   └── page.tsx                # 전체 프로젝트 리스트 (Table View) — admin·member
    │   │       │
    │   │       └── project/
    │   │           ├── new/                    # [RBAC] 접근 admin·member. 일반 프로젝트=admin만, Student Work=admin·member
    │   │           │   └── page.tsx            # ✨ [Wizard] step-1 타입 선택. member는 Student Work만 허용, 일반=admin만
    │   │           └── [id]/                   # 📍 프로젝트 ID 기준 라이프사이클 관리 (admin·member)
    │   │               ├── layout.tsx          # 프로젝트 관리용 탭 레이아웃
    │   │               ├── page.tsx            # ↪️ (Redirect to default tab)
    │   │               ├── draft/
    │   │               │   └── page.tsx        # [Draft] 기획서 작성
    │   │               ├── recruit/
    │   │               │   └── page.tsx        # [Recruit] 지원자 관리
    │   │               └── progress/
    │   │                   ├── layout.tsx      # 진행 중 프로젝트 레이아웃
    │   │                   └── page.tsx        # [Progress] 진행 현황/아카이브/파일 관리
    │   │
    │   └── api/                        # 📡 [API Routes] 백엔드 엔드포인트
    │       ├── auth/
    │       │   └── [...nextauth]/      # 🔐 NextAuth 핸들러
    │       │       └── route.ts        # GET, POST
    │       ├── user/
    │       │   ├── profile/
    │       │   │   └── route.ts        # PATCH (프로필 수정)
    │       │   └── validate/
    │       │       └── route.ts        # GET (이메일 중복확인)
    │       ├── projects/
    │       │   ├── route.ts            # GET(List) — admin·member, POST(Create) — 일반=admin만, Student Work=admin·member (RBAC)
    │       │   └── [id]/
    │       │       ├── route.ts        # GET(Detail), PATCH(Update), DELETE
    │       │       ├── recruit/
    │       │       │   └── route.ts    # POST(지원자 상태변경)
    │       │       ├── archive/
    │       │       │   └── route.ts    # POST(아카이빙) — archive-service 트랜잭션 **유일** 진입점. Drive 폴더+업로드+시트 갱신 일괄 처리
    │       │       └── sync-drive/
    │       │           └── route.ts    # POST(드라이브 싱크). api-response 형식, 세션·권한 검사 후 syncProjectDriveToSheets
    │       ├── courses/
    │       │   └── [id]/
    │       │       └── works/
    │       │           └── route.ts    # GET(작품목록)
    │       └── storage/                # ⚠️ 프로젝트/아카이브 자료는 사용 금지 → api/projects/[id]/archive 경유
    │           ├── upload/
    │           │   └── route.ts        # POST — 프로필 사진, 글 작성 임시 이미지 등 DB 관계 느슨한 자산 전용. Dispatcher 아님, 역할 분리 권장
    │           └── delete/
    │               └── route.ts        # DELETE(파일 삭제)
    │
    ├── components/                             # 🧩 UI Building Blocks
    │   ├── layout/
    │   │   ├── navbar.tsx                      # Public Navbar
    │   │   ├── footer.tsx
    │   │   └── sidebar.tsx                     # Dashboard Sidebar. RBAC: session.user.role로 메뉴 필터, 경로→허용 역할 설정 객체
    │   │
    │   ├── ui/                                 # Atomic Design Components (shadcn/ui)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── textarea.tsx
    │   │   ├── select.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx                      # Modal
    │   │   ├── toast.tsx                       # Notifications
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── progress.tsx
    │   │   ├── calendar.tsx
    │   │   ├── skeleton.tsx
    │   │   └── file-dropzone.tsx               # 프레젠테이션 전용. react-dropzone 래핑, multiple/accept/maxSize/onFilesSelected. 업로드 로직 없음 → use-file-upload
    │   │
    │   ├── home/
    │   │   ├── hero-section.tsx                # 메인 이미지에 priority 필수 (LCP 최적화, plan)
    │   │   ├── metrics-ticker.tsx
    │   │   └── featured-projects.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── header.tsx                      # "안녕하세요 OO님"
    │   │   ├── metric-cards.tsx                # KPI 요약
    │   │   ├── widgets/
    │   │   │   ├── calendar-widget.tsx
    │   │   │   └── gantt-widget.tsx
    │   │   ├── teams/
    │   │   │   ├── team-grid.tsx
    │   │   │   └── team-member-modal.tsx
    │   │   ├── archive/                        # 📦 [Archive System]
    │   │   │   ├── archive-list.tsx            # 아카이브 카드 그리드
    │   │   │   ├── create-archive-modal.tsx    # 생성 모달 (파일 업로드 포함)
    │   │   │   └── file-manager-view.tsx       # 구글 드라이브 파일 뷰어
    │   │   └── profile/
    │   │       ├── profile-view-card.tsx
    │   │       └── profile-edit-form.tsx       # React Hook Form 기반
    │   │
    │   ├── project-detail/                     # 공개 상세 페이지용
    │   │   ├── project-header.tsx
    │   │   ├── content-viewer.tsx              # Markdown/Image 뷰어
    │   │   ├── team-list.tsx
    │   │   └── related-courses.tsx
    │   │
    │   └── project-create/                     # ✨ [Wizard System]
    │       ├── wizard-context.tsx              # 단계별 상태 관리
    │       ├── steps/
    │       │   ├── step-1-type.tsx             # "Student Work" 체크박스 포함
    │       │   ├── step-2-basic.tsx
    │       │   ├── step-3-team.tsx
    │       │   └── step-4-drive.tsx            # 드라이브 연동 설정
    │       └── summary-review.tsx
    │
    ├── lib/                                    # ⚙️ Core Logic (여기가 핵심입니다!)
    │   ├── auth.ts                             # NextAuth 설정. jwt/session callback에서 Users 시트 role → session.user.role (RBAC)
    │   ├── constants.ts                        # 상수 (Project Types, Roles)
    │   ├── utils.ts                            # cn, date-formatter
    │   │
    │   ├── types/                              # TypeScript Definitions
    │   │   ├── google-schema.ts                # 시트 헤더·컬럼 상수 (drive_folder_id, files_json), DriveFileMeta 타입
    │   │   ├── project.ts
    │   │   ├── user.ts
    │   │   └── api-response.ts                # API 공통 응답: { success, data?, error?: { code, message } } (모든 API Route 필수)
    │   │
    │   ├── google/                             # 🌐 Google Integration Core
    │   │   ├── config.ts                       # 서비스 계정 환경변수 로드
    │   │   ├── auth-client.ts                  # JWT 인증 (싱글톤 패턴)
    │   │   │
    │   │   ├── drive/                          # ☁️ Drive Logic
    │   │   │   ├── index.ts                    # Entry Point
    │   │   │   ├── create-folder.ts            # 프로젝트용 폴더 생성
    │   │   │   ├── upload-file.ts              # Stream Upload (Buffer to Drive)
    │   │   │   ├── list-files.ts               # 폴더 내 파일 조회
    │   │   │   └── permissions.ts              # 파일 공개 권한 설정
    │   │   │
    │   │   └── sheets/                         # 📊 Sheets Logic
    │   │       ├── index.ts                    # Entry Point
    │   │       ├── fetch-rows.ts               # 데이터 조회. unstable_cache 래핑 권장 (Tags: projects, users), revalidateTag on write
    │   │       ├── append-row.ts               # 새 프로젝트/아카이브 추가
    │   │       ├── update-row.ts               # 특정 셀 수정
    │   │       └── mapper.ts                   # Raw Array <-> Object 변환기
    │   │
    │   ├── services/                           # 🧠 Business Logic (API가 호출)
    │   │   ├── project-service.ts              # 프로젝트 생성/수정/조회
    │   │   ├── archive-service.ts              # ✨ [Transaction] 프로젝트/아카이브 자료 **유일** 처리. Drive 폴더 조회/생성 → 스트림 업로드 → webViewLink/thumbnailLink → 시트 Row JSON 갱신. Generic API 사용 금지(고아 파일·폴더 관리 방지)
    │   │   ├── user-service.ts                 # 유저 프로필 관리
    │   │   └── notification-service.ts         # 슬랙/이메일 알림 (확장성 고려)
    │   │
    │   └── hooks/                              # Custom React Hooks
    │       ├── use-project-form.ts
    │       ├── use-file-upload.ts              # FileDropzone onFilesSelected → API 전송, 진행률, 성공/실패·토스트 (업로드 로직 유일 위치)
    │       └── use-archive-mutation.ts         # React Query Mutation
    │
    └── public/
        ├── fonts/
        └── images/

---
## 파일 업로드·아카이브 정책

### 1. 프로젝트/아카이브 자료 → archive-service 트랜잭션만 사용 (Generic API 금지)

- **문제**: 범용 업로드 API로 먼저 Drive에 넣고 나중에 시트에 연결하면, 시트 저장 실패 시 Drive에 주인 없는 파일만 쌓임(고아 파일). 폴더 구조도 root/temp에 넣었다가 나중에 옮기면 API 호출·복잡도만 증가.
- **해결**: **archive-service** 한 경로로만 처리.
  - **입력**: file, projectId, uploaderId
  - **동작**: (1) 해당 projectId Drive 폴더 조회·없으면 생성 → (2) 해당 폴더에 스트림 업로드 → (3) webViewLink·thumbnailLink 획득 → (4) Sheets 해당 프로젝트 Row에 JSON 메타데이터 즉시 갱신
  - **진입점**: `api/projects/[id]/archive` (POST)만 사용. 다른 업로드 API로 프로젝트/아카이브 자료 넣지 않음.

### 2. api/storage/upload의 역할

- **역할**: 프로필 사진, 글 작성 중 임시 이미지 등 **DB 관계가 느슨한 자산** 전용. “그냥 파일 받아서 드라이브 루트에 저장”하는 단순 처리기가 아님.
- **Dispatcher 설계 시**: Request에 `context`를 넣어 분기(profile → user-service, project → archive-service)하는 방식은 가능하나, **RESTful·유지보수 측면에서 라우트 분리 권장** (예: 프로필용 별도 엔드포인트).
- **금지**: 프로젝트/아카이브 자료를 이 라우트로 업로드하지 않음.

---

## plan.md 연동 요약

- **Auth·RBAC:** middleware(세션 유무), dashboard/layout(프로필 완료), manage/layout(admin·member 접근), manage/project/new(일반=admin만, Student Work=admin·member), sidebar(역할별 메뉴), auth.ts(jwt/session callback → role).
- **에러·API:** 모든 API Route는 lib/types/api-response.ts 공통 형식. 5xx→toast, 4xx→폼 에러, 자동 재시도 없음.
- **성능:** next/image + remotePatterns(Drive), hero-section priority, unstable_cache(Sheets) + revalidateTag on write.
- **검증:** scripts/test-google-conn.ts 등 tsx 스크립트로 실제 연결 확인. Google API mock 미사용.

---

## 폴더만 생성할 때 체크리스트

아래는 **폴더만** 먼저 만들 때 빠뜨리기 쉬운 경로만 정리한 것. 파일은 plan Phase에 따라 추가하면 됨.

- `scripts/`
- `src/app/(auth)/`, `login/`, `access-request/`, `profile-setup/`
- `src/app/(public)/`, `about/`, `people/`, `people/[id]/`, `courses/`, `courses/[courseId]/`, `courses/[courseId]/student-works/`, `courses/[courseId]/student-works/[workId]/`, `publications/`, `projects/`, `projects/[id]/`
- `src/app/dashboard/`, `profile/`, `teams/`, `teams/[id]/`, `my-projects/`, `lab-calendar/`, `notices/`, **`manage/`**, `manage/projects/`, **`manage/project/`**, `manage/project/new/`, **`manage/project/[id]/`**, `draft/`, `recruit/`, `progress/`
- `src/app/api/auth/`, `api/auth/[...nextauth]/`, `api/user/profile/`, `api/user/validate/`, `api/projects/`, `api/projects/[id]/`, `api/projects/[id]/recruit/`, `api/projects/[id]/archive/`, `api/projects/[id]/sync-drive/`, `api/courses/[id]/works/`, `api/storage/upload/`, `api/storage/delete/`
- `src/components/layout/`, `ui/`, `home/`, `dashboard/`, `dashboard/widgets/`, `dashboard/teams/`, `dashboard/archive/`, `dashboard/profile/`, `project-detail/`, `project-create/`, `project-create/steps/`
- `src/lib/types/`, `src/lib/google/`, `src/lib/google/drive/`, `src/lib/google/sheets/`, `src/lib/services/`, `src/lib/hooks/`
- `src/public/fonts/`, `src/public/images/`