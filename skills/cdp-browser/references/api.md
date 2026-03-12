# cdp-browser API Reference

## CdpSkills Constructor

```typescript
new CdpSkills(options?: {
  host?: string;    // default: 'localhost'
  port?: number;    // default: 9222
  target?: string;  // specific tab target
  timeout?: number; // default: 30000ms
})
```

## Methods

| Method | Description |
|--------|-------------|
| `launch(opts?)` | Chrome 실행 + connect() 자동 호출 |
| `connect()` | 이미 실행 중인 Chrome에 CDP 연결 |
| `disconnect()` | CDP 연결 해제 |
| `close()` | disconnect + Chrome 프로세스 종료 |
| `navigate(url)` | 페이지 이동 + loadEventFired 대기 → 트리 문자열 반환 |
| `getTree()` | 현재 페이지 AX 트리 문자열 반환 + ref 맵 재구성 |
| `click(ref)` | ref 번호 요소 클릭 |
| `type(ref, text)` | ref 번호 요소에 텍스트 입력 (기존 값 대체) |
| `focus(ref)` | ref 번호 요소에 포커스 |
| `getRefMap()` | 현재 ref 맵 반환 (Map<number, InteractiveNode>) |
| `isConnected` | 연결 상태 boolean |

## ChromeLauncher Options

```typescript
launch({
  port?: number;          // default: 9222
  userDataDir?: string;   // default: '/tmp/chrome-cdp-debug'
  executablePath?: string; // 직접 경로 지정
  headless?: boolean;     // default: false
  extraArgs?: string[];   // 추가 Chrome 플래그
})
```

## InteractiveNode

```typescript
interface InteractiveNode {
  ref: number;            // [1], [2], ... 참조 번호
  role: string;           // button, textbox, link, heading, checkbox, ...
  name: string;           // 레이블 (보통 표시 텍스트)
  value: string;          // 현재 입력값 (textbox 등)
  description: string;    // 추가 설명
  backendDOMNodeId: number;
  checked?: boolean;      // checkbox/radio
  selected?: boolean;     // option
  expanded?: boolean;     // combobox
  disabled?: boolean;
  required?: boolean;
  level?: number;         // heading level
}
```

## Filtered Roles (getTree에 포함됨)

`button, link, textbox, searchbox, combobox, listbox, option, checkbox, radio, switch, menuitem, tab, spinbutton, slider, heading, img(alt 있는 경우)`

## Error Types

```typescript
CdpConnectionError   // 연결 실패 or 브라우저 종료
CdpRefNotFoundError  // ref 번호 없음 (getTree() 먼저 호출 필요)
CdpInteractionError  // click/type 실패
CdpNavigationError   // navigate 실패 or timeout
```

## Tree Output Format

```
[1] heading "Sign in to your account"
[2] textbox "Email address" value=""
[3] textbox "Password" value=""
[4] checkbox "Remember me" checked=false
[5] link "Forgot your password?"
[6] button "Sign in"
```
