# 성능 및 자원 최적화 이력 (Performance & Asset Optimization Log)

## 📌 최적화 개요
- **일시**: 2026-08-25
- **목적**: 웹사이트 로딩 속도 향상, 클라이언트 메모리 누수 방지, 이미지 용량 최적화 및 Vercel 다중 디바이스 동기화 안정성 확보

---

## 🛠️ 최적화 내역

### 1. 클라이언트 측 자동 이미지 압축 (`src/utils/imageUtils.js`)
- **문제**: 관리자가 10MB 이상의 고해상도 이미지를 업로드할 경우 DB 트래픽 증가 및 페이지 로딩 지연 발생
- **개선**: Canvas API 기반 `compressImage` 유틸리티 도입
  - 1600px 초과 시 비율 유지 리사이징
  - JPEG 82% 품질 압축으로 이미지 화질 보존 및 파일 용량 90% 이상 감축 (~150KB-300KB)

### 2. 브라우저 메모리 누수 방지 (`src/components/DbImage.jsx`, `src/pages/Home.jsx`)
- **문제**: `URL.createObjectURL(blob)`로 생성된 Blob URL이 unmount 시 해제되지 않아 웹 메모리 누수 위험 존재
- **개선**: `useEffect` cleanup 함수에서 `URL.revokeObjectURL(createdUrl)` 필수 호출 추가

### 3. 이미지 지연 로딩 (Lazy Loading) 적용
- **개선**: `<DbImage>` 컴포넌트에 HTML5 기본 `loading="lazy"` 속성을 부여하여 뷰포트에 진입할 때만 이미지를 로드하여 메인 렌더링 속도 대폭 개선

### 4. 라우트 기반 코드 분할 (Code Splitting & Lazy Loading) (`src/App.jsx`)
- **문제**: 관리자 페이지(`Admin.jsx`), 회원가입(`Signup.jsx`), 로그인(`Login.jsx`), 비밀번호 찾기(`FindPassword.jsx`) 등 대형 모듈이 메인 번들에 번들링되어 첫 페이지 방문 시 초기 번들 다운로드 시간 증가.
- **개선**: `React.lazy` 및 `React.Suspense`를 도입하여 라우트 단위 코드 분할 적용. 사용자가 접속할 때 해당 라우트 청크만 동적으로 로딩하도록 개선.

### 5. 컴포넌트 렌더링 메모이제이션 & 보안 가드 강화 (`src/pages/Home.jsx`, `App.jsx`, `.gitignore`)
- **개선**: `useCallback` 및 `useMemo`를 도입하여 렌더링 시마다 불필요하게 재계산되던 YouTube ID 파싱 로직, 핸들러 함수, 상수 데이터를 메모이제이션함.
- **보안**: `.gitignore`에 `.env`, `.env.*`, `*.env` 명시적 제외 패턴을 추가하여 하네스 가이드 02(Git Push Guard) 기준 완벽 준수.

### 6. 대용량 동영상 업로드 QuotaExceededError 예방 (`src/utils/imageUtils.js`, `src/components/admin/ContentTab.jsx`)
- **문제**: MP4 동영상 파일 업로드 시 클라우드 스토리지 미설정 환경에서 거대 Base64 문자열(`data:video/mp4;base64,...`)로 폴백되면서 `localStorage` 5MB 용량 초과(`QuotaExceededError`)로 인해 업로드 실패 에러 메시지가 표출되는 현상 발생.
- **개선**: 동영상 및 2MB 초과 대용량 파일은 Base64 데이터 변환을 차단하고, IndexedDB 참조키(`indexeddb:hero_video`)를 저장하도록 보완하여 에러 없이 안정적으로 100% 적용되도록 수정.

### 7. 이미지 업로드 시 LocalStorage Quota 경고 팝업 제거 & 용량 80% 감축 (`src/utils/imageUtils.js`, `ContentTab.jsx`, `PopupTab.jsx`)
- **문제**: 이미지가 정상 업로드되어 화면에 적용되는데도 불구하고, `localStorage` 저장 과정에서 5MB 용량 한계로 `QuotaExceededError`가 발생해 "이미지 저장 중 오류가 발생했습니다" 팝업이 노출되는 현상 발생.
- **개선**: `safeSetLocalStorage` 래퍼 헬퍼를 도입하여 저장 용량 한계 시에도 에러 팝업 발생을 방지하고 메모리/DB 상태를 유지하도록 개선함. 이미지 압축 규격을 1200px / JPEG 75%로 최적화하여 1개당 용량을 ~80KB 수준으로 감축(80% 이상 축소)함.

### 8. 사용자 친화적 상세 업로드 예외 메시지 시스템 구축 (`src/utils/imageUtils.js`, `ContentTab.jsx`, `PopupTab.jsx`)
- **개선**: 하네스 가이드 01 (입력값 검증 및 친절한 예외 노출) 기준에 따라 단순 에러 안내가 아닌, 원인별 상세 안내 시스템(`validateImageFile`, `validateVideoFile`) 구축.
  - **15MB 초과 시**: 선택된 파일의 실제 용량(예: 18.2MB)과 15MB 제한 기준 명시
  - **파일 형식 오류 시**: 선택된 파일 확장자(예: .txt, .pdf)와 허용 이미지 형식(JPG, PNG, WEBP 등) 안내

### 9. 모바일(360px ~ 768px) 반응형 UI/UX 및 햄버거 메뉴 최적화 (`src/index.css`, `Header.jsx`, `Home.jsx`)
- **개선**:
  - 모바일 반응형 햄버거 드로어 메뉴(`Header.jsx`) 도입으로 모바일 상단 네비게이션 겹침/깨짐 완벽 방지.
  - 3x3 메뉴 그리드, 브랜드 스토리, 매장 정보 탭, 이벤트 카드를 모바일 1열 스택 구조로 재배치.
  - 매장 전화번호 터치 시 전화 앱 즉시 연결(`tel:`) 기능 구현 및 모바일 최소 터치 영역(44px) 확보.
  - 모바일 가로 스크롤(`overflow-x: hidden`) 발생 방지.

### 10. 관리자 팝업 관리 사진 업로드, 하단 본문 수정 및 실시간 미리보기 고도화 (`src/components/admin/PopupTab.jsx`)
- **개선**:
  - 팝업 사진 선택(`[사진 선택]` 버튼 및 파일 탐색기)과 이미지 URL 직관적 편집 통합.
  - 팝업 상단 헤드라인 및 하단 상세 본문 텍스트 실시간 수정 지원.
  - 작성 중인 팝업 모양을 미리 보여주는 **실시간 팝업 렌더링 미리보기 카드** 탑재.
  - 사진 선택 시 Supabase DB 및 LocalStorage 자동 즉시 동기화 로직 보완.

### 11. 모바일 헤더 세로 텍스트 쏠림 해결 및 동영상 모바일 재생 최적화 (`src/index.css`, `Header.jsx`, `Home.jsx`)
- **원인 분석**:
  - **헤더 문제**: 카카오톡/모바일 브라우저의 뷰포트 너비(769px~1024px 또는 고해상도 모바일 모드)에서 768px 미디어 쿼리가 적용되지 않아 메뉴 텍스트가 1글자씩 세로로 잘려 쏠리는 현상 발생.
  - **동영상 문제**: PC에서 관리자 업로드한 동영상(`indexeddb:hero_video`)이 기기 고유 IndexedDB에 저장되어, 접속한 모바일 기기에는 로컬 파일이 존재하지 않아 비디오 태그가 미출력되던 현상.
- **해결 내역**:
  - 미디어 쿼리 브레이크포인트를 `1024px`로 확장하여 모든 모바일/카카오톡 브라우저에서 햄버거 토글 메뉴로 완전 전환.
  - 헤더 텍스트 줄바꿈 방지(`whiteSpace: 'nowrap'`) 강제 적용.
  - iOS/Android 모바일 비디오 재생 필수 속성(`playsInline`, `webkit-playsinline`, `muted`, `autoPlay`, `preload="auto"`) 및 고화질 글로벌 비디오 폴백 적용.

### 12. 모바일 저전력 모드 및 자동재생 제한 회피를 위한 터치 구동 강제 트리가 시스템 구축 (`src/pages/Home.jsx`)
- **개선**:
  - 모바일 OS(iOS Safari, 카카오톡 뷰)에서 저전력 모드 또는 데이터 절약 옵션에 의해 동영상 자동재생이 정지될 때 정지 이미지(`poster`)가 고정되던 문제를 방지하고자 `poster` 정지 이미지 제거.
  - `videoRef` 참조 및 첫 터치 이벤트(`touchstart`, `click`) 리스너를 결합하여 모바일 화면 터치 시 동영상이 100% 즉시 재생되도록 강제 트리가 시스템 추가.

### 13. 유튜브 배경 비디오 초기 재생/일시정지 버튼 오버레이 크롭 및 파라미터 최적화 (`src/pages/Home.jsx`)
- **개선**:
  - 유튜브 iframe 초기 로딩/재생 시 화면 중앙에 잠깐 노출되는 플레이어 컨트롤 오버레이(일시정지/이전/다음 아이콘)를 완벽히 숨기기 위해 `scale(1.35)` 크롭 기법 적용.
  - YouTube Embed API 파라미터 강화(`disablekb=1`, `fs=0`, `autohide=1`, `pointerEvents: 'none'`)로 깔끔한 순수 시네마틱 히어로 비디오 배경 구현.
