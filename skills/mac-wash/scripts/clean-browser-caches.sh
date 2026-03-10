#!/bin/bash
# Clean browser caches / 清理浏览器缓存
# Safe: Browsers will rebuild caches / 安全：浏览器会重建缓存

TOTAL=0

# Chrome
if [ -d ~/Library/Caches/Google/Chrome ]; then
  BEFORE=$(du -sk ~/Library/Caches/Google/Chrome 2>/dev/null | cut -f1)
  rm -rf ~/Library/Caches/Google/Chrome/* 2>/dev/null
  AFTER=$(du -sk ~/Library/Caches/Google/Chrome 2>/dev/null | cut -f1)
  CHROME=$(( (BEFORE - AFTER) / 1024 ))
  TOTAL=$((TOTAL + CHROME))
  echo "  Chrome: ${CHROME} MB"
fi

# Safari
if [ -d ~/Library/Caches/com.apple.Safari ]; then
  BEFORE=$(du -sk ~/Library/Caches/com.apple.Safari 2>/dev/null | cut -f1)
  rm -rf ~/Library/Caches/com.apple.Safari/* 2>/dev/null
  AFTER=$(du -sk ~/Library/Caches/com.apple.Safari 2>/dev/null | cut -f1)
  SAFARI=$(( (BEFORE - AFTER) / 1024 ))
  TOTAL=$((TOTAL + SAFARI))
  echo "  Safari: ${SAFARI} MB"
fi

# Firefox
if [ -d ~/Library/Caches/Firefox ]; then
  BEFORE=$(du -sk ~/Library/Caches/Firefox 2>/dev/null | cut -f1)
  rm -rf ~/Library/Caches/Firefox/* 2>/dev/null
  AFTER=$(du -sk ~/Library/Caches/Firefox 2>/dev/null | cut -f1)
  FIREFOX=$(( (BEFORE - AFTER) / 1024 ))
  TOTAL=$((TOTAL + FIREFOX))
  echo "  Firefox: ${FIREFOX} MB"
fi

echo "✓ Cleaned browser caches / 已清理浏览器缓存: ${TOTAL} MB"
exit 0
