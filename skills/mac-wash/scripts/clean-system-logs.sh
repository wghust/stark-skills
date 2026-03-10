#!/bin/bash
# Clean system logs / 清理系统日志
# Safe: Removes old logs, system recreates as needed / 安全：删除旧日志，系统会按需重建

DIR=~/Library/Logs

if [ ! -d "$DIR" ]; then
  echo "Directory not found / 目录不存在: $DIR"
  exit 2
fi

BEFORE=$(du -sk "$DIR" 2>/dev/null | cut -f1)
rm -rf "$DIR"/* 2>/dev/null || { echo "Permission denied / 权限被拒绝"; exit 3; }
AFTER=$(du -sk "$DIR" 2>/dev/null | cut -f1)
RECLAIMED=$(( (BEFORE - AFTER) / 1024 ))

echo "✓ Cleaned system logs / 已清理系统日志: ${RECLAIMED} MB"
exit 0
