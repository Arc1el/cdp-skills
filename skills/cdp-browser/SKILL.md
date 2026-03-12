---
name: cdp-browser
description: Browser automation skill using CDP (Chrome DevTools Protocol) Accessibility Tree. Use this skill whenever the user wants to automate a browser, scrape a website, fill out a form, log in, click buttons, navigate pages, or do anything Playwright/Selenium would do — even if they don't mention "CDP" or "accessibility tree". Trigger on: "로그인해줘", "웹사이트에서 ~해줘", "자동화", "스크래핑", "폼 작성", "브라우저 자동화", "automate", "scrape", "browse", "fill form", "click", "navigate to", or any task involving controlling a real browser.
---

# CDP Browser Automation Skill

This skill uses the **cdp-skills** library (`/Users/jayden/Documents/cdp-skills`) to automate Chrome via the Accessibility Tree. Instead of parsing full HTML (expensive tokens), it uses a numbered reference system:

```
[1] heading "Sign in"
[2] textbox "Email" value=""
[3] textbox "Password" value=""
[4] button "Sign in"
[5] link "Forgot password?"
```

Claude then calls `click(4)`, `type(2, "email")` — no CSS selectors, no XPath.

---

## Core API

```typescript
import { CdpSkills } from '/Users/jayden/Documents/cdp-skills/src/CdpSkills';

const skills = new CdpSkills({ port: 9222 });
await skills.launch();           // Chrome 자동 실행 + CDP 연결
await skills.connect();          // 이미 실행 중인 Chrome에 연결 (launch 대신)

const tree = await skills.navigate('https://example.com'); // 이동 + 트리 반환
const tree = await skills.getTree();  // 현재 페이지 트리
await skills.click(ref);              // ref 번호 클릭
await skills.type(ref, text);         // ref 번호에 텍스트 입력
await skills.focus(ref);              // ref 번호에 포커스
const map = skills.getRefMap();       // ref → InteractiveNode 전체 맵

await skills.disconnect();
await skills.close();            // disconnect + Chrome 종료
```

---

## Workflow

For every browser automation task, follow this loop:

```
1. launch() or connect()
2. navigate(url) → get tree
3. READ the tree → identify relevant refs
4. Perform actions (type, click, focus)
5. Wait if needed (setTimeout), then getTree() again
6. Repeat until goal is achieved
7. close()
```

Always wrap in `try/finally` so Chrome closes even on error.

---

## Script Pattern

Write a **complete TypeScript script** and run with `npx ts-node`:

```typescript
import { CdpSkills } from '/Users/jayden/Documents/cdp-skills/src/CdpSkills';

async function main() {
  const skills = new CdpSkills();
  await skills.launch({ headless: false }); // headless: true for background

  try {
    // 1. Navigate
    let tree = await skills.navigate('https://target-site.com');
    console.log('페이지 트리:\n', tree);

    // 2. Parse refs from map
    const map = skills.getRefMap();
    // Find refs by role/name
    let emailRef: number | null = null;
    let pwRef: number | null = null;
    let submitRef: number | null = null;

    for (const [ref, node] of map) {
      const name = node.name.toLowerCase();
      if (node.role === 'textbox' && (name.includes('email') || name.includes('id') || name.includes('user'))) emailRef = ref;
      if (node.role === 'textbox' && name.includes('pass')) pwRef = ref;
      if (node.role === 'button' && (name.includes('login') || name.includes('로그인') || name.includes('sign'))) submitRef = ref;
    }

    // 3. Interact
    if (emailRef) await skills.type(emailRef, 'user@example.com');
    if (pwRef) await skills.type(pwRef, 'password');
    if (submitRef) await skills.click(submitRef);

    // 4. Wait for navigation
    await new Promise(r => setTimeout(r, 3000));

    // 5. Verify result
    const afterTree = await skills.getTree();
    console.log('결과:\n', afterTree);

  } finally {
    await skills.close();
  }
}

main().catch(console.error);
```

Run with:
```bash
cd /Users/jayden/Documents/cdp-skills
npx ts-node <script-path>.ts
```

---

## Finding the Right Refs

After `getTree()` or `navigate()`, parse `getRefMap()` to find elements:

```typescript
const map = skills.getRefMap();

// Strategy 1: by role
const buttons = [...map.values()].filter(n => n.role === 'button');
const inputs  = [...map.values()].filter(n => n.role === 'textbox' || n.role === 'searchbox');

// Strategy 2: by name keyword
const loginBtn = [...map.values()].find(n => n.name.toLowerCase().includes('login'));

// Strategy 3: print all to inspect
for (const [ref, node] of map) {
  console.log(`[${ref}] ${node.role} "${node.name}" value="${node.value}"`);
}
```

---

## Common Patterns

### Login
```typescript
// Navigate → find id/pw/submit → type × 2 → click → wait → verify
```

### Form Fill
```typescript
// Navigate → getRefMap → for each field: type(ref, value) → click submit
```

### Scraping (read-only)
```typescript
const tree = await skills.getTree();
// tree is a plain string — parse it or pass directly to LLM
// headless: true for scraping tasks
```

### Multi-step Navigation
```typescript
let tree = await skills.navigate('https://site.com');
// ... interact ...
await skills.click(ref);
await new Promise(r => setTimeout(r, 2000));
tree = await skills.getTree(); // fresh tree after navigation
```

---

## Tips

- **트리가 비어있으면**: 페이지 로딩이 안 됐을 수 있음 → `setTimeout` 후 `getTree()` 재호출
- **React/Vue 사이트**: `type()`이 이미 nativeInputValueSetter + input/change 이벤트를 발생시킴
- **로그인 후 트리가 안 바뀌면**: 비밀번호 오류이거나 navigation 대기 시간이 부족한 것
- **ref는 getTree() 호출마다 재생성됨**: 클릭 후 getTree() 다시 호출하면 ref 번호 바뀜
- **headless 모드**: 화면 없이 실행하려면 `launch({ headless: true })`

---

## Full API Reference

See `references/api.md` for complete type definitions and all options.
