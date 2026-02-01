# LKJ-AAPP 기술 명세 (Spec) — 뼈대

본 문서는 [plan.md](plan.md)와 [file_structure.md](file_structure.md)를 바탕으로 한 **기술 명세 뼈대**이다. 각 섹션은 추후 상세 내용을 채워 넣을 수 있도록 구성하였다.

---

## 1. 시스템 개요

- **프로젝트명:** LKJ-AAPP
- **목적:** (연구실/팀용) 이미지·영상·글 업로드 → Google Drive 저장 + Google Sheets 메타데이터 동기화
- **스택:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js
- **호스팅:** Vercel (Production)
- **데이터 저장소:** Google Sheets (DB·Drive 폴더 ID 캐시), Google Drive (파일 저장)
- **참고:** [file_structure.md](file_structure.md) 루트 구조, [plan.md](plan.md) 전제 조건

---

## 2. 폴더·파일 구조

- **기준 문서:** [file_structure.md](file_structure.md)
- **요약:**
  - 루트: 설정·환경변수·middleware·next.config·scripts
  - `src/app`: (auth), (public), dashboard, api
  - `src/components`: layout, ui, home, dashboard, project-detail, project-create
  - `src/lib`: types, google (config, auth-client, drive, sheets), services, hooks
- **환경 분리:** .env.local(개발 시크릿), .env.development / .env.production, 개발·프로덕션 Sheet/Drive ID 분리 (plan: Environment Isolation)

---

## 3. 인증·라우팅 (Auth Spec)

- **기준:** [plan.md](plan.md) Phase 1 — 인증·라우팅 (Auth Spec)
- **Middleware:** [middleware.ts](middleware.ts) — 세션 유무만 Edge에서 1차 리다이렉트
  - Guest Only: `/login`, `/access-request` — 로그인 시 `/dashboard` 리다이렉트
  - Onboarding: `/profile-setup` — 미로그인 시 `/login`, 로그인 시 통과
  - Protected: `/dashboard/*` — 미로그인 시 `/login`
- **Server-Side:** [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx) — 프로필 완성 여부 조회, 미완료 시 `redirect('/profile-setup')`
- **profile-setup 완료 후:** `redirect('/dashboard')` 또는 `router.push('/dashboard')`
- **상세:** plan.md Phase 1 단계표

---

## 4. 역할 기반 접근 제어 (RBAC)

- **기준:** [plan.md](plan.md) — Role-Based Access Control (RBAC) Architecture
- **Source of Truth:** Google Sheet Users 시트 (admin, member, guest)
- **Session:** NextAuth jwt/session callback → `session.user.role` (페이지 로드마다 Sheet 조회 없음)
- **UI:** [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx) — 경로 → 허용 역할 배열 설정 객체로 메뉴 필터
- **Route Protection:** [src/app/dashboard/manage/layout.tsx](src/app/dashboard/manage/layout.tsx) — role이 admin 또는 member가 아니면 `redirect('/dashboard')`
- **프로젝트 생성 권한:**
  - `/dashboard/manage/project/new` 진입: admin·member 모두
  - 일반 프로젝트 생성: admin만
  - Student Work(학생 작품) 생성: admin·member
- **API:** POST /api/projects — body 타입이 Student Work이면 admin·member, 일반이면 admin만 (member 403)
- **상세:** plan.md RBAC 섹션, file_structure.md manage/·api/projects 주석

---

## 5. 데이터 레이어 — Drive & Sheets

- **기준:** [plan.md](plan.md) — 폴더 구조 및 ID 관리 전략 (Folder Architecture)
- **Drive 고정 계층:**
  - Root: LKJ-AAPP (환경변수/최초 배포 시 ID 확보)
  - Users / [User_ID], Projects / [Project_ID], Public(선택)
- **ID 캐싱:** Sheets에 drive_folder_id 저장 → 경로 탐색 없이 해당 폴더로 업로드/조회
- **User 시트:** id, name, email, ..., drive_folder_id, role
- **Project 시트:** id, title, ..., drive_folder_id, files_json
- **프로젝트 생성 시:** Drive에 Projects/[새ID] 폴더 생성 → newFolderId를 시트 drive_folder_id에 저장
- **파일 업로드/동기화:** 시트에서 drive_folder_id 조회 후 해당 폴더로 직접 접근
- **구현 위치:** [file_structure.md](file_structure.md) lib/google (drive, sheets), lib/types/google-schema.ts, lib/services

---

## 6. 동기화 전략 (Sync Strategy)

- **방식:** User-Initiated Manual Sync (사용자 클릭 시 동기화). Vercel 타임아웃 방지.
- **범위:** 단일 프로젝트 [id]만. 전체 동기화 없음.
- **Data Flow:** progress/page.tsx 버튼 → POST /api/projects/[id]/sync-drive → Drive 폴더 스캔 → 해당 프로젝트 Row의 files_json 갱신
- **구현:** [plan.md](plan.md) Phase 4·5·6, file_structure.md api/projects/[id]/sync-drive, progress/page.tsx
- **상세:** plan.md Data Flow 시퀀스, Phase 4·5·6 단계표

---

## 7. UI·컴포넌트 전략

- **기준:** [plan.md](plan.md) — UI Component Strategy: FileDropzone
- **FileDropzone:** [src/components/ui/file-dropzone.tsx](src/components/ui/file-dropzone.tsx)
  - 프레젠테이션 전용, react-dropzone 래핑
  - Props: multiple, accept, maxSize, onFilesSelected
  - 업로드 로직 없음 (선택된 File[]만 부모에 전달)
- **업로드 로직:** [src/lib/hooks/use-file-upload.ts](src/lib/hooks/use-file-upload.ts) — API 전송, 진행률, 성공/실패·토스트
- **사용처:** 아카이브 생성 모달, 프로젝트 파일 업로드, 프로필 이미지 등
- **기타:** [file_structure.md](file_structure.md) components/ 트리

---

## 8. API 계약

- **공통 응답:** [src/lib/types/api-response.ts](src/lib/types/api-response.ts)
  - `{ success: boolean, data?: T, error?: { code: string, message: string } }`
  - 모든 API Route 필수 준수
- **주요 엔드포인트 요약:** (상세는 file_structure.md api/ 트리)
  - auth/[...nextauth], user/profile, user/validate
  - projects: GET(List), POST(Create — 일반=admin만, Student Work=admin·member), GET/PATCH/DELETE [id]
  - projects/[id]/recruit, archive, sync-drive
  - courses/[id]/works, storage/upload, storage/delete
- **에러:** 4xx/5xx 시 api-response 형식, 5xx→toast, 4xx→폼 에러, 자동 재시도 없음 (plan: Error Handling)

---

## 9. 성능·최적화

- **기준:** [plan.md](plan.md) — Performance & Optimization Strategy
- **이미지 (LCP):**
  - next/image 필수. Drive 원본 URL 직접 <img> 사용 금지
  - next.config.js images.remotePatterns: drive.google.com, lh3.googleusercontent.com
  - hero-section 메인 이미지 priority 필수
- **캐싱:**
  - Next.js unstable_cache로 Sheets 조회 래핑 (Tags: projects, users)
  - 쓰기/업로드/동기화 성공 시 revalidateTag('projects') 등 호출
  - Redis/Vercel KV 현재 미사용
- **상세:** plan.md Performance 섹션

---

## 10. 에러 처리·관찰성

- **기준:** [plan.md](plan.md) — Error Handling & Observability Strategy
- **로깅:** instrumentation.ts에 복잡한 OpenTelemetry 미사용. 구조화 로깅(JSON, console.error), Drive/Sheet 실패 시 event, projectId, error 컨텍스트
- **API 응답:** 위 8. 참고
- **클라이언트:** 5xx→toast, 4xx→React Hook Form 폼 에러, 자동 재시도 없음

---

## 11. 테스트·검증

- **기준:** [plan.md](plan.md) — Testing & Verification Strategy
- **Google API:** mock 미사용. 실제 연결·응답 기준 검증
- **환경 분리:** 개발/프로덕션 Sheet·Drive ID 분리
- **검증 스크립트:** scripts/test-google-conn.ts, scripts/verify-drive.ts — tsx로 실행, UI 작업 전 Cloud 연결 확인 필수
- **상세:** plan.md Testing 섹션, Phase 3-5

---

## 12. 구현 단계 (Phase 요약)

- **기준:** [plan.md](plan.md) — Phase 0~6 및 실행 순서 요약
- **순서:** Phase 0(타입·스키마) → Phase 1(Auth) → Phase 2(Drive) → Phase 3(Sheets) → Phase 4(Sync 서비스) → Phase 5(Sync API) → Phase 6(Progress UI)
- **병렬:** Phase 0·1, Phase 2·3 각각 병렬 가능
- **검증:** Phase 2·3 완료 후 scripts/test-google-conn.ts 실행으로 실제 연결 확인 후 UI(Phase 4~6) 진행
- **상세:** plan.md 각 Phase 단계표 및 완료 조건

---

## 13. 업로드·아카이브 정책 (참고)

- **기준:** [file_structure.md](file_structure.md) — 파일 업로드·아카이브 정책
- **프로젝트/아카이브 자료:** archive-service 트랜잭션만 사용. 진입점 api/projects/[id]/archive (POST). Generic 업로드 API로 프로젝트/아카이브 자료 업로드 금지
- **api/storage/upload:** 프로필 사진, 임시 이미지 등 DB 관계 느슨한 자산 전용

---

## 문서 연동

| 문서 | 용도 |
|------|------|
| [plan.md](plan.md) | 단계별 구현 계획, Auth/RBAC/성능/에러/테스트 전략, Phase 단계표 |
| [file_structure.md](file_structure.md) | 폴더·파일 트리, 역할별 주석, 업로드 정책 |
| **spec.md** (본 문서) | 기술 명세 뼈대, 위 문서 참조 및 요약. 상세는 각 섹션 확장 |

각 섹션에 상세 요구사항·인터페이스·예외 케이스를 채우면 완전한 기술 명세로 활용할 수 있다.
