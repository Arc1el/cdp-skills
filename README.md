# cdp-skills

Claude Code 브라우저 자동화 스킬. Chrome DevTools Protocol의 Accessibility Tree를 번호 참조 시스템으로 변환해 LLM이 CSS 셀렉터 없이 브라우저를 제어한다.

```
[1] textbox "Email" value=""
[2] textbox "Password" value=""
[3] button "Sign in"
```

→ `"billing-on.com에 로그인해줘"` 한 마디면 Claude가 알아서 처리.

---

## 설치

### 1. 라이브러리 설치

```bash
npm install -g github:Arc1el/cdp-skills
```

설치 시 TypeScript 빌드가 자동으로 실행된다.

### 2. 스킬 등록

```bash
npx skills add github.com/Arc1el/cdp-skills
```

[vercel-labs/skills](https://github.com/vercel-labs/skills) CLI가 `SKILL.md`를 Claude Code 스킬 디렉터리에 등록한다.

**요구사항:** Node.js 18+, Google Chrome

---

## 사용법

설치 후 Claude Code에서 자연어로 요청하면 된다:

```
"https://example.com 로그인해줘"
"이 사이트에서 상품 목록 스크래핑해줘"
"회원가입 폼 자동으로 작성해줘"
"대시보드에서 이번 달 비용 데이터 긁어줘"
```

Claude가 `navigate → getTree → type/click` 루프를 자율적으로 실행한다.

---

## 작동 원리

전체 HTML 대신 Accessibility Tree만 추출해 LLM에 전달한다:

| 방식 | 페이지당 토큰 |
|------|-------------|
| 전체 HTML | ~10,000–50,000 |
| DOM 텍스트 | ~3,000–10,000 |
| **AX 트리 (cdp-skills)** | **~100–500** |

```
Chrome
  └─ Accessibility Tree
       ├─ [1] textbox "Email"
       ├─ [2] textbox "Password"
       └─ [3] button "Sign in"

Claude → type(1, "user@email.com")
       → type(2, "password")
       → click(3)
```

---

## 패키지 구조

```
cdp-skills/
├── skills/
│   └── cdp-browser/       ← npx skills로 등록되는 에이전트 스킬
│       ├── SKILL.md
│       └── references/api.md
├── dist/                  ← 설치 시 자동 빌드 (npm install -g 시 생성)
└── src/                   ← TypeScript 라이브러리 소스
```

---

## 개발자용 API

```javascript
const PLUGIN = require('child_process').execSync('npm root -g').toString().trim() + '/cdp-skills';
const { CdpSkills } = require(PLUGIN + '/dist/CdpSkills');

const skills = new CdpSkills();
await skills.launch();

const tree = await skills.navigate('https://example.com');
// [1] textbox "Email" value=""
// [2] button "Sign in"

await skills.type(1, 'user@example.com');
await skills.click(2);
await skills.close();
```

전체 API는 `skills/cdp-browser/references/api.md` 참고.

---

## 테스트

```bash
npm run test:unit       # 유닛 테스트 29개
npm run build           # TypeScript 빌드
```
