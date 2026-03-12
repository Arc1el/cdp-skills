# cdp-skills

Chrome DevTools Protocol(CDP) Accessibility Tree 기반 브라우저 자동화 라이브러리 + Claude Code 에이전트 스킬.

전체 DOM 대신 AX 트리의 **번호 참조**만 사용해 LLM 토큰 비용을 대폭 절감한다.

```
[1] heading "Sign in"
[2] textbox "Email" value=""
[3] textbox "Password" value=""
[4] button "Sign in"
```

→ `type(2, "user@email.com")`, `click(4)` — CSS 셀렉터 없음, XPath 없음.

---

## 설치

```bash
git clone https://github.com/Arc1el/cdp-skills.git
cd cdp-skills
bash scripts/setup.sh
```

`setup.sh`가 한 번에 처리:
1. `npm install` — 의존성 설치
2. Claude Code 스킬을 `~/.claude/skills/cdp-browser/`에 설치 (경로 자동 설정)
3. TypeScript 빌드

**요구사항:** Node.js 18+, Google Chrome

---

## 빠른 시작

```typescript
import { CdpSkills } from './src/CdpSkills';

const skills = new CdpSkills();
await skills.launch();  // Chrome 자동 실행

const tree = await skills.navigate('https://example.com/login');
console.log(tree);
// [1] textbox "Email" value=""
// [2] textbox "Password" value=""
// [3] button "Sign in"

await skills.type(1, 'user@example.com');
await skills.type(2, 'password123');
await skills.click(3);

await new Promise(r => setTimeout(r, 2000));
const afterTree = await skills.getTree();
console.log(afterTree); // 로그인 후 페이지 트리

await skills.close();
```

---

## API

### `CdpSkills`

```typescript
const skills = new CdpSkills({
  port?: number;     // Chrome 디버그 포트 (default: 9222)
  host?: string;     // default: 'localhost'
  timeout?: number;  // 네비게이션 타임아웃 ms (default: 30000)
});
```

| 메서드 | 설명 |
|--------|------|
| `launch(opts?)` | Chrome 실행 + CDP 연결 |
| `connect()` | 실행 중인 Chrome에 연결 |
| `navigate(url)` | 페이지 이동 → AX 트리 문자열 반환 |
| `getTree()` | 현재 페이지 AX 트리 반환 + ref 맵 재구성 |
| `click(ref)` | ref 번호 요소 클릭 |
| `type(ref, text)` | ref 번호 요소에 텍스트 입력 |
| `focus(ref)` | ref 번호 요소에 포커스 |
| `getRefMap()` | `Map<number, InteractiveNode>` 반환 |
| `isConnected` | 연결 상태 |
| `disconnect()` | CDP 연결 해제 |
| `close()` | 연결 해제 + Chrome 종료 |

### `ChromeLauncher`

Chrome 없이도 직접 실행 가능:

```typescript
import { ChromeLauncher } from './src/launcher/ChromeLauncher';

const launcher = new ChromeLauncher({
  port: 9222,
  headless: true,              // 백그라운드 실행
  userDataDir: '/tmp/chrome',
});
await launcher.launch();
// ... 작업 ...
await launcher.kill();
```

---

## 프로젝트 구조

```
src/
├── CdpSkills.ts               # Public API facade
├── index.ts                   # Exports
├── launcher/
│   └── ChromeLauncher.ts      # Chrome 프로세스 관리
├── connection/
│   └── CdpConnection.ts       # chrome-remote-interface 래퍼 + disconnect 감지
├── accessibility/
│   ├── AXTreeFetcher.ts       # Accessibility.getFullAXTree() 호출
│   ├── AXTreeFilter.ts        # interactive/visible 노드 필터링
│   ├── AXTreeFormatter.ts     # "[1] button "Sign In"" 포맷 생성
│   └── types.ts               # RawAXNode, InteractiveNode, RefMap
├── interaction/
│   ├── Clicker.ts             # DOM.getBoxModel → 마우스 이벤트 (JS fallback)
│   ├── Typer.ts               # nativeInputValueSetter + input/change 이벤트
│   ├── Focuser.ts             # Runtime.callFunctionOn focus
│   └── Navigator.ts           # Page.navigate + loadEventFired
├── refs/
│   └── RefRegistry.ts         # ref번호 → InteractiveNode 인메모리 맵
└── errors/
    └── CdpError.ts            # 타입화된 에러 계층
tests/
├── unit/                      # AXTreeFilter, AXTreeFormatter, RefRegistry
└── integration/               # 실제 Chrome 대상 e2e (CHROME_DEBUG_PORT 필요)
scripts/
└── test-login.ts              # 실제 사이트 검증 스크립트 (환경변수로 인증정보 주입)
```

---

## 테스트

```bash
# 유닛 테스트 (29개)
npm run test:unit

# 통합 테스트 (Chrome 실행 중 필요)
CHROME_DEBUG_PORT=9222 npm run test:integration

# 빌드
npm run build
```

---

## Claude Code 에이전트 스킬

`~/.claude/skills/cdp-browser/` 스킬이 포함되어 있어 Claude Code에서 바로 사용 가능.

트리거 예시:
- "billing-on.com에 로그인해줘"
- "이 사이트에서 상품 목록 스크래핑해줘"
- "폼 자동 작성해줘"

Claude가 자율적으로 `navigate → getTree → type/click` 루프를 실행한다.

---

## 왜 AX 트리인가?

| 방식 | 페이지당 토큰 |
|------|-------------|
| 전체 HTML | ~10,000–50,000 |
| DOM 텍스트만 | ~3,000–10,000 |
| **AX 트리 (cdp-skills)** | **~100–500** |

LLM이 페이지를 이해하는 데 필요한 최소한의 정보만 전달한다.

---

## 의존성

- **runtime**: `chrome-remote-interface`
- **dev**: `typescript`, `jest`, `ts-jest`, `@types/*`
