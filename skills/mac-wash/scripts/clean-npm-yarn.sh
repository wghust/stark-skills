#!/bin/bash
# Clean npm/yarn caches / 清理 npm/yarn 缓存
# Safe: Reinstalls on next use / 安全：下次使用时会重新安装

TOTAL=0

# npm cache
if command -v npm &>/dev/null; then
  NPM_BEFORE=$(du -sk ~/.npm 2>/dev/null | cut -f1 || echo 0)
  npm cache clean --force 2>/dev/null
  NPM_AFTER=$(du -sk ~/.npm 2>/dev/null | cut -f1 || echo 0)
  NPM_RECLAIMED=$(( (NPM_BEFORE - NPM_AFTER) / 1024 ))
  TOTAL=$((TOTAL + NPM_RECLAIMED))
  echo "  npm: ${NPM_RECLAIMED} MB"
fi

# yarn cache
if command -v yarn &>/dev/null; then
  YARN_BEFORE=$(du -sk ~/Library/Caches/Yarn 2>/dev/null | cut -f1 || echo 0)
  yarn cache clean 2>/dev/null
  YARN_AFTER=$(du -sk ~/Library/Caches/Yarn 2>/dev/null | cut -f1 || echo 0)
  YARN_RECLAIMED=$(( (YARN_BEFORE - YARN_AFTER) / 1024 ))
  TOTAL=$((TOTAL + YARN_RECLAIMED))
  echo "  yarn: ${YARN_RECLAIMED} MB"
fi

if [ $TOTAL -eq 0 ]; then
  echo "No package managers found / 未找到包管理器"
  exit 2
fi

echo "✓ Cleaned npm/yarn caches / 已清理 npm/yarn 缓存: ${TOTAL} MB"
exit 0
