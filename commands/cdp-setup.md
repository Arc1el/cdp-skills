---
description: CDP Skills 초기 설정 — npm 의존성 설치, TypeScript 빌드, Claude Code 스킬 경로 설정. 플러그인 설치 후 반드시 실행.
allowed-tools: Bash(bash:*)
---

CDP Skills 플러그인을 초기 설정한다.

## 실행 절차

### 1. 플러그인 루트 경로 확인

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/cdp-skills}"
echo "Plugin root: $PLUGIN_ROOT"
ls "$PLUGIN_ROOT"
```

### 2. 의존성 설치 및 빌드

```bash
cd "$PLUGIN_ROOT"
npm install
npm run build
```

### 3. Claude Code 스킬 경로 설정

설치된 경로를 SKILL.md에 반영한다:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/cdp-skills}"
SKILL_SRC="$PLUGIN_ROOT/skills/cdp-browser"
SKILL_DEST="$HOME/.claude/skills/cdp-browser"

mkdir -p "$SKILL_DEST/references"

sed "s|__PLUGIN_ROOT__|$PLUGIN_ROOT|g" \
  "$SKILL_SRC/SKILL.md" > "$SKILL_DEST/SKILL.md"

cp "$SKILL_SRC/references/api.md" "$SKILL_DEST/references/api.md"
echo "Skill installed to: $SKILL_DEST"
```

### 4. 완료 보고

설정 완료 후 아래 내용을 사용자에게 안내한다:

- 설치 경로
- 사용 방법 예시:
  - `"https://example.com 로그인해줘"`
  - `"이 사이트에서 데이터 스크래핑해줘"`
  - `"폼 자동으로 작성해줘"`
