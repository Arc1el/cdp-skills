# cdp-skills

Claude Code 브라우저 자동화 플러그인. Chrome DevTools Protocol의 Accessibility Tree를 번호 참조 시스템으로 변환해 LLM이 CSS 셀렉터 없이 브라우저를 제어한다.

```
[1] textbox "Email" value=""
[2] textbox "Password" value=""
[3] button "Sign in"
```

→ `"billing-on.com에 로그인해줘"` 한 마디면 Claude가 알아서 처리.

---

## 설치

### 1. 마켓플레이스 등록

```
/plugin marketplace add https://github.com/Arc1el/cdp-skills
```

### 2. 플러그인 설치

```
/plugin install cdp-skills
```

### 3. 초기 설정

```
/cdp-setup
```

npm 의존성 설치, TypeScript 빌드, Claude Code 스킬 경로 설정을 자동으로 처리한다.

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

## 플러그인 구조

```
cdp-skills/
├── .claude-plugin/
│   ├── plugin.json        ← 플러그인 매니페스트
│   └── marketplace.json   ← 마켓플레이스 등록 정보
├── skills/
│   └── cdp-browser/       ← Claude Code 에이전트 스킬
│       ├── SKILL.md
│       └── references/api.md
├── commands/
│   └── cdp-setup.md       ← /cdp-setup 커맨드
└── src/                   ← TypeScript 라이브러리 (내부 구현)
```

---

## 개발자용 API

라이브러리를 직접 사용하려면 `/cdp-setup` 후:

```typescript
import { CdpSkills } from '~/.claude/plugins/cdp-skills/src/CdpSkills';

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
