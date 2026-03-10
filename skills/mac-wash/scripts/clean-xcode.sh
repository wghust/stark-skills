#!/bin/bash
# Clean Xcode derived data / 清理 Xcode 派生数据
# Safe: Xcode rebuilds on next use / 安全：Xcode 会在下次使用时重建

DIR=~/Library/Developer/Xcode/DerivedData

if [ ! -d "$DIR" ]; then
  echo "Xcode not installed / Xcode 未安装"
  exit 2
fi

BEFORE=$(du -sk "$DIR" 2>/dev/null | cut -f1)
rm -rf "$DIR"/* 2>/dev/null || { echo "Permission denied / 权限被拒绝"; exit 3; }
AFTER=$(du -sk "$DIR" 2>/dev/null | cut -f1)
RECLAIMED=$(( (BEFORE - AFTER) / 1024 ))

echo "✓ Cleaned Xcode derived data / 已清理 Xcode 派生数据: ${RECLAIMED} MB"
exit 0
