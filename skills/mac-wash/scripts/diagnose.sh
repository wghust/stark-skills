#!/bin/bash
# macOS Performance Diagnostics / macOS 性能诊断
# Outputs JSON with disk, memory, and process data / 输出包含磁盘、内存和进程数据的 JSON

set -e

# Disk space analysis / 磁盘空间分析
get_size() {
  du -sh "$1" 2>/dev/null | cut -f1 || echo "0B"
}

USER_CACHES=$(get_size ~/Library/Caches)
SYSTEM_LOGS=$(get_size ~/Library/Logs)
TRASH=$(get_size ~/.Trash)
CHROME=$(get_size ~/Library/Caches/Google/Chrome)
SAFARI=$(get_size ~/Library/Caches/com.apple.Safari)
FIREFOX=$(get_size ~/Library/Caches/Firefox)
XCODE=$(get_size ~/Library/Developer/Xcode/DerivedData)
NPM=$(get_size ~/.npm)
YARN=$(get_size ~/Library/Caches/Yarn)

# Memory analysis / 内存分析
MEM_INFO=$(vm_stat | awk '
  /Pages free/ {free=$3}
  /Pages active/ {active=$3}
  /Pages inactive/ {inactive=$3}
  /Pages wired/ {wired=$3}
  END {
    gsub(/\./,"",free); gsub(/\./,"",active); gsub(/\./,"",inactive); gsub(/\./,"",wired);
    total=(free+active+inactive+wired)*4096/1073741824;
    used=(active+inactive+wired)*4096/1073741824;
    printf "%.1f,%.1f", used, total
  }
')
SWAP_INFO=$(sysctl vm.swapusage | awk '{print $7}' | tr -d 'G')

# Process monitoring / 进程监控
PROCESSES=$(ps -A -o %mem,rss,comm | sort -nr | head -5 | awk '{
  mem_gb=$2/1048576;
  printf "{\"name\":\"%s\",\"mem_gb\":%.1f,\"cpu_pct\":0},", $3, mem_gb
}' | sed 's/,$//')

# Output JSON / 输出 JSON
cat <<EOF
{
  "disk": {
    "user_caches": "$USER_CACHES",
    "system_logs": "$SYSTEM_LOGS",
    "browser_caches": "$((${CHROME//[^0-9]/}+${SAFARI//[^0-9]/}+${FIREFOX//[^0-9]/}))M",
    "xcode": "$XCODE",
    "npm_yarn": "$((${NPM//[^0-9]/}+${YARN//[^0-9]/}))M",
    "trash": "$TRASH"
  },
  "memory": {
    "used_gb": ${MEM_INFO%,*},
    "total_gb": ${MEM_INFO#*,},
    "swap_gb": ${SWAP_INFO:-0},
    "pressure": "$( (( $(echo "$SWAP_INFO > 2" | bc -l 2>/dev/null || echo 0) )) && echo "high" || echo "low")"
  },
  "processes": [$PROCESSES]
}
EOF
