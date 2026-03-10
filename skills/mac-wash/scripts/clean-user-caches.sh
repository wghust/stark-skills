#!/bin/bash
# Clean user caches / 清理用户缓存
# Safe: Removes app caches, preserves app data / 安全：删除应用缓存，保留应用数据

DIR=~/Library/Caches

if [ ! -d "$DIR" ]; then
  echo "Directory not found / 目录不存在: $DIR"
  exit 2
fi

BEFORE=$(du -sk "$DIR" 2>/dev/null | cut -f1)
rm -rf "$DIR"/* 2>/dev/null || { echo "Permission denied / 权限被拒绝"; exit 3; }
AFTER=$(du -sk "$DIR" 2>/dev/null | cut -f1)
RECLAIMED=$(( (BEFORE - AFTER) / 1024 ))

echo "✓ Cleaned user caches / 已清理用户缓存: ${RECLAIMED} MB"
exit 0
