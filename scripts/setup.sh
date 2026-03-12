#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_SRC="$REPO_DIR/skills/cdp-browser"
SKILL_DEST="$HOME/.claude/skills/cdp-browser"

echo "=== cdp-skills setup ==="
echo "Install path: $REPO_DIR"

# 1. npm install
echo ""
echo "[1/3] Installing dependencies..."
cd "$REPO_DIR"
npm install

# 2. Claude Code skill 설치
echo ""
echo "[2/3] Installing Claude Code skill..."
mkdir -p "$SKILL_DEST/references"

# SKILL.md의 하드코딩된 경로를 실제 경로로 교체
sed "s|/Users/jayden/Documents/cdp-skills|$REPO_DIR|g" \
  "$SKILL_SRC/SKILL.md" > "$SKILL_DEST/SKILL.md"

cp "$SKILL_SRC/references/api.md" "$SKILL_DEST/references/api.md"

echo "Skill installed to: $SKILL_DEST"

# 3. 빌드
echo ""
echo "[3/3] Building..."
npm run build

echo ""
echo "=== Setup complete ==="
echo ""
echo "Usage in Claude Code:"
echo "  \"https://example.com 로그인해줘\""
echo "  \"이 사이트에서 데이터 스크래핑해줘\""
