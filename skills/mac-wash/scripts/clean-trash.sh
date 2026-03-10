#!/bin/bash
# Empty trash / 清空废纸篓
# Warning: Permanent deletion / 警告：永久删除

DIR=~/.Trash

if [ ! -d "$DIR" ]; then
  echo "Trash directory not found / 废纸篓目录不存在"
  exit 2
fi

BEFORE=$(du -sk "$DIR" 2>/dev/null | cut -f1)
rm -rf "$DIR"/* 2>/dev/null || { echo "Permission denied / 权限被拒绝"; exit 3; }
AFTER=$(du -sk "$DIR" 2>/dev/null | cut -f1)
RECLAIMED=$(( (BEFORE - AFTER) / 1024 ))

echo "✓ Emptied trash / 已清空废纸篓: ${RECLAIMED} MB"
exit 0
