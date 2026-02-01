/**
 * Google 서비스 계정 설정 — 개별 환경 변수에서 로드
 *
 * 필요한 환경 변수 (.env.local 또는 Vercel Environment Variables):
 *   GOOGLE_CLIENT_EMAIL   — 서비스 계정 이메일
 *   GOOGLE_PRIVATE_KEY   — PEM private key (줄바꿈은 \n 문자열로 넣어도 됨)
 *   GOOGLE_PROJECT_ID    — (선택) GCP 프로젝트 ID
 *   GOOGLE_SPREADSHEET_ID — (선택) 기본 사용 스프레드시트 ID
 *   GOOGLE_DRIVE_ROOT_FOLDER_ID — (선택) 기본 루트 폴더 ID
 */

/** 환경 변수에서 읽은 Google 서비스 계정 자격 증명 (JWT용) */
export interface GoogleCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

/** Google 연동에 필요한 설정 */
export interface GoogleConfig {
  credentials: GoogleCredentials;
  spreadsheetId: string | undefined;
  driveRootFolderId: string | undefined;
}

function getEnv(key: string): string | undefined {
  return process.env[key];
}

/** private_key는 env에 `\n` 문자열로 저장된 경우가 많으므로 실제 줄바꿈으로 치환 */
function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n").trim();
}

/**
 * 개별 환경 변수로부터 Google 설정을 로드한다.
 * 서비스 계정 인증에 필요한 변수가 없으면 예외를 던진다.
 */
export function loadGoogleConfig(): GoogleConfig {
  const clientEmail = getEnv("GOOGLE_CLIENT_EMAIL");
  const privateKeyRaw = getEnv("GOOGLE_PRIVATE_KEY");
  const projectId = getEnv("GOOGLE_PROJECT_ID");
  const spreadsheetId = getEnv("GOOGLE_SPREADSHEET_ID");
  const driveRootFolderId = getEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");

  if (!clientEmail?.trim()) {
    throw new Error(
      "GOOGLE_CLIENT_EMAIL is required. Set it in .env.local or Vercel Environment Variables."
    );
  }
  if (!privateKeyRaw?.trim()) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY is required. Set it in .env.local or Vercel Environment Variables."
    );
  }

  const credentials: GoogleCredentials = {
    client_email: clientEmail.trim(),
    private_key: normalizePrivateKey(privateKeyRaw),
    ...(projectId?.trim() && { project_id: projectId.trim() }),
  };

  return {
    credentials,
    spreadsheetId: spreadsheetId?.trim() || undefined,
    driveRootFolderId: driveRootFolderId?.trim() || undefined,
  };
}

/** 싱글톤 설정 인스턴스 (auth-client 등에서 사용). 필요 시 lazy 초기화. */
let _config: GoogleConfig | null = null;

/**
 * 로드된 Google 설정을 반환한다. 최초 호출 시 환경 변수에서 로드한다.
 */
export function getGoogleConfig(): GoogleConfig {
  if (!_config) {
    _config = loadGoogleConfig();
  }
  return _config;
}

/**
 * 테스트/재로드용: 캐시된 설정을 초기화한다.
 */
export function resetGoogleConfig(): void {
  _config = null;
}
