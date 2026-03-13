---
name: cdp-browser
description: Browser automation skill using CDP (Chrome DevTools Protocol) Accessibility Tree. Use this skill whenever the user wants to automate a browser, scrape a website, fill out a form, log in, click buttons, navigate pages, or do anything Playwright/Selenium would do — even if they don't mention "CDP" or "accessibility tree". Trigger on: "로그인해줘", "웹사이트에서 ~해줘", "자동화", "스크래핑", "폼 작성", "브라우저 자동화", "automate", "scrape", "browse", "fill form", "click", "navigate to", or any task involving controlling a real browser.
---

# CDP Browser Automation Skill

This skill uses the **cdp-skills** library (installed globally via `npm install -g cdp-skills`) to automate Chrome via the Accessibility Tree. Instead of parsing full HTML (expensive tokens), it uses a numbered reference system:

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

```javascript
const PLUGIN = require('child_process').execSync('npm root -g').toString().trim() + '/cdp-skills';
const { CdpSkills } = require(PLUGIN + '/dist/CdpSkills');

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

**파일 없이 `node -e`로 직접 실행** (임시 파일 불필요):

```bash
node -e "
const PLUGIN = require('child_process').execSync('npm root -g').toString().trim() + '/cdp-skills';
const { CdpSkills } = require(PLUGIN + '/dist/CdpSkills');

async function main() {
  const skills = new CdpSkills();
  await skills.launch({ headless: true }); // headless: false for visible browser

  try {
    // 1. Navigate
    let tree = await skills.navigate('https://target-site.com');
    console.log('페이지 트리:\n', tree);

    // 2. Parse refs from map
    const map = skills.getRefMap();
    let emailRef = null, pwRef = null, submitRef = null;

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
"
```

### Advanced: JS Evaluation (DOM 직접 접근)
```bash
node -e "
const PLUGIN = require('child_process').execSync('npm root -g').toString().trim() + '/cdp-skills';
const { CdpSkills } = require(PLUGIN + '/dist/CdpSkills');

async function main() {
  const skills = new CdpSkills();
  await skills.launch({ headless: true });
  try {
    await skills.navigate('https://target-site.com');
    await new Promise(r => setTimeout(r, 2000));

    // DOM 직접 평가
    const client = skills.connection.getClient();
    const result = await client.Runtime.evaluate({
      expression: \`(() => {
        return document.title;
      })()\`,
      returnByValue: true
    });
    console.log(result.result.value);
  } finally {
    await skills.close();
  }
}
main().catch(console.error);
"
```

---

## Finding the Right Refs

After `getTree()` or `navigate()`, parse `getRefMap()` to find elements:

```javascript
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
```javascript
// Navigate → find id/pw/submit → type × 2 → click → wait → verify
```

### Form Fill
```javascript
// Navigate → getRefMap → for each field: type(ref, value) → click submit
```

### Scraping (read-only)
```javascript
const tree = await skills.getTree();
// tree is a plain string — parse it or pass directly to LLM
// headless: true for scraping tasks
```

### Multi-step Navigation
```javascript
let tree = await skills.navigate('https://site.com');
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

## Completion (REQUIRED)

After the task is fully complete and results have been reported to the user, **always run this cleanup command** to prevent the stop hook from blocking:

```bash
find ~ -path "*/.omc/state/sessions/*/skill-active-state.json" -exec grep -l '"cdp-browser"' {} \; 2>/dev/null | xargs rm -f 2>/dev/null; echo "skill state cleared"
```

This removes the `skill-active-state.json` that oh-my-claudecode writes when a skill is invoked. Without this step, the stop hook will block completion 3 times before auto-clearing.

---

## Full API Reference

See `references/api.md` for complete type definitions and all options.
