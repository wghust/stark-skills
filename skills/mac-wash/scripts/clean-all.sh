#!/bin/bash
# Interactive cleanup menu / 交互式清理菜单
# Select multiple cleanup options / 选择多个清理选项

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== macOS Cleanup / macOS 清理 ==="
echo ""
echo "Available cleanup options / 可用的清理选项:"
echo "1) User Caches / 用户缓存"
echo "2) System Logs / 系统日志"
echo "3) Browser Caches / 浏览器缓存"
echo "4) Xcode Derived Data / Xcode 派生数据"
echo "5) npm/yarn Caches / npm/yarn 缓存"
echo "6) Empty Trash / 清空废纸篓"
echo ""
read -p "Enter numbers (space-separated, e.g., 1 3 6): " choices

TOTAL=0

for choice in $choices; do
  case $choice in
    1)
      bash "$SCRIPT_DIR/clean-user-caches.sh" && TOTAL=$((TOTAL + 1))
      ;;
    2)
      bash "$SCRIPT_DIR/clean-system-logs.sh" && TOTAL=$((TOTAL + 1))
      ;;
    3)
      bash "$SCRIPT_DIR/clean-browser-caches.sh" && TOTAL=$((TOTAL + 1))
      ;;
    4)
      bash "$SCRIPT_DIR/clean-xcode.sh" && TOTAL=$((TOTAL + 1))
      ;;
    5)
      bash "$SCRIPT_DIR/clean-npm-yarn.sh" && TOTAL=$((TOTAL + 1))
      ;;
    6)
      bash "$SCRIPT_DIR/clean-trash.sh" && TOTAL=$((TOTAL + 1))
      ;;
    *)
      echo "Invalid option: $choice"
      ;;
  esac
done

echo ""
echo "=== Cleanup complete / 清理完成 ==="
echo "Completed $TOTAL cleanup operations / 完成 $TOTAL 个清理操作"
