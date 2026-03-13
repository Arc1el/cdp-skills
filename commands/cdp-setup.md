---
description: CDP Skills 설치 상태 확인. npm global 설치 및 스킬 등록 여부를 점검.
allowed-tools: Bash(bash:*)
---

CDP Skills 설치 상태를 확인한다.

## 실행 절차

### 1. npm global 설치 확인

```bash
npm root -g
npm list -g cdp-skills 2>/dev/null || echo "NOT INSTALLED"
```

### 2. 미설치 시 안내

설치되어 있지 않으면 아래 명령어를 안내한다:

```bash
npm install -g cdp-skills
npx skills add github.com/Arc1el/cdp-skills
```

### 3. 완료 보고

설치가 확인되면 아래 내용을 안내한다:

- 라이브러리 위치: `$(npm root -g)/cdp-skills`
- 스킬은 `npx skills add github.com/Arc1el/cdp-skills`로 등록
- 사용 방법 예시:
  - `"https://example.com 로그인해줘"`
  - `"이 사이트에서 데이터 스크래핑해줘"`
  - `"폼 자동으로 작성해줘"`
