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
