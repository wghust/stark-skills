---
name: network-status
description: |
  Diagnose current network status: proxy, connectivity, speed, DNS, local interfaces, public IP, VPN. Zero dependencies, uses only built-in commands (ping, curl, ifconfig/ip, etc.). Outputs structured Markdown report.
  诊断当前网络状态：代理、连通性、网速、DNS、本机网络、公网 IP、VPN。零依赖，仅用内置命令。输出结构化 Markdown 报告。
triggers:
  - 网络状态
  - 网速
  - 代理
  - network status
  - proxy check
  - 网络诊断
  - 检查网络
  - network diagnostic
---

# network-status Skill

> **Language**: Respond in the same language as the user (中文提问则中文回答).

Zero-dependency network diagnosis. Runs read-only commands to collect proxy, connectivity, speed, DNS, local network, public IP, and VPN info. Produces a structured Markdown report.

---

## Execution Flow

### Step 0 · Detect Language

Detect user's language from input and use it for all output.

---

### Step 1 · Run Diagnostics (Read-Only)

Execute commands sequentially. Each module is independent; failure in one does not block others. Use 3–5 second timeout for external requests (ping, curl) to avoid long hangs.

---

#### 1A · Proxy 代理

```bash
# Environment variables
env | grep -i proxy

# macOS system proxy
networksetup -getwebproxy "Wi-Fi" 2>/dev/null || networksetup -getwebproxy "Ethernet" 2>/dev/null
scutil --proxy 2>/dev/null | head -30

# Linux
# env | grep -i proxy (same as above)
# systemctl show-environment 2>/dev/null | grep -i proxy
```

**Output**: 是否有代理、代理地址、NO_PROXY 排除列表；若 env 有 proxy 则注明「本报告中的 curl/ping 可能经代理」。

---

#### 1B · Connectivity 连通性

```bash
# Test common endpoints (use -W 3 for 3s timeout)
ping -c 3 -W 3 google.com 2>/dev/null || ping -c 3 google.com 2>/dev/null
ping -c 3 -W 3 github.com 2>/dev/null || ping -c 3 github.com 2>/dev/null
ping -c 3 -W 3 cloudflare.com 2>/dev/null || ping -c 3 cloudflare.com 2>/dev/null

# HTTP reachability (optional)
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 https://www.google.com 2>/dev/null
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 https://github.com 2>/dev/null
```

**Output**: 各站点 可访问 / 超时 / 失败；可补充国内镜像（如 mirrors.aliyun.com）若用户在内网/国内环境。

---

#### 1C · Speed 网速

```bash
# Ping latency (average RTT)
ping -c 5 -W 3 8.8.8.8 2>/dev/null | grep "round-trip\|rtt"
# macOS uses "round-trip"; Linux uses "rtt"

# Rough download speed (curl bytes/sec, convert to Mbps)
# Use small file: cloudflare cdn-cgi/trace ~200B, or a 1KB test file
curl -w "%{speed_download}\n" -o /dev/null -s --connect-timeout 5 https://cloudflare.com/cdn-cgi/trace 2>/dev/null
# speed_download is in bytes/sec; Mbps = bytes/sec * 8 / 1000000
```

**Output**: 延迟 (ms)、粗略下载速度 (Mbps)；注明「粗略估计，精确测速请用 speedtest.net」。

---

#### 1D · DNS

```bash
# macOS
scutil --dns 2>/dev/null | head -50

# DNS servers (both)
cat /etc/resolv.conf 2>/dev/null

# Resolution test with timing
dig google.com +short +stats 2>/dev/null || nslookup google.com 2>/dev/null
# dig shows "Query time: X msec" in +stats
```

**Output**: DNS 服务器列表、解析 google.com 耗时、解析结果（成功/失败）。

---

#### 1E · Local Network 本机网络

```bash
# macOS
ifconfig | grep -E "^(en|utun|ppp|bridge)" -A 5

# Linux
ip addr show 2>/dev/null || ifconfig 2>/dev/null

# Default route
netstat -rn 2>/dev/null | head -10
# Linux: ip route 2>/dev/null
```

**Output**: 活跃网卡、各接口 IP、默认网关。

---

#### 1F · Public IP 公网 IP

```bash
curl -s --connect-timeout 5 https://ipinfo.io 2>/dev/null
# or: curl -s --connect-timeout 5 https://ifconfig.me
```

**Output**: 公网 IP、地理位置（若有）；失败则标注「需外网或检测超时」。

---

#### 1G · VPN / Tunnel

```bash
# Check for typical VPN interfaces
ifconfig 2>/dev/null | grep -E "utun|ppp|tun" || ip addr 2>/dev/null | grep -E "tun|ppp"
netstat -rn 2>/dev/null | head -15
# If default route goes through utun*, likely VPN
```

**Output**: 是否存在 utun/ppp/tun 接口、默认路由是否经隧道；若有则标注「可能存在 VPN/隧道」。

---

#### 1H · Port Listen (Optional)

```bash
# macOS
netstat -an 2>/dev/null | grep LISTEN | head -20

# Linux
ss -tln 2>/dev/null | head -20
```

**Output**: 精简的监听端口列表（可省略常见端口如 22、80、443 的详细说明）。

---

### Step 2 · Format Report

Produce a Markdown report with the following structure. Use Chinese or English based on user language.

**Template (中文):**
```markdown
## 网络状态诊断报告

> 检测时间: [timestamp]
> 检测方式: [直连 / 经代理]（若有 HTTP_PROXY 等则注为「经代理」）

### 1. 代理 Proxy
- 状态: [已配置 / 未配置]
- HTTP_PROXY: [值或 未设置]
- HTTPS_PROXY: [值或 未设置]
- NO_PROXY: [值或 未设置]
- 系统代理 (macOS): [若适用]

### 2. 连通性 Connectivity
| 站点 | 状态 |
|------|------|
| google.com | 可访问 / 超时 / 失败 |
| github.com | ... |
| cloudflare.com | ... |

### 3. 网速 Speed
- Ping 延迟 (8.8.8.8): XX ms
- 粗略下载速度: X.XX Mbps（粗略估计，精确测速请用 speedtest.net）

### 4. DNS
- DNS 服务器: [从 resolv.conf 或 scutil]
- 解析 google.com: [耗时] ms，[成功/失败]

### 5. 本机网络 Local
- 网卡: [接口] [IP] [状态]
- 默认网关: [默认路由]

### 6. 公网 IP
- [IP] [地理位置或 获取失败]

### 7. VPN/隧道
- [存在 utun/ppp / 未检测到]
- [若存在] 默认路由经隧道，可能存在 VPN

### 8. 端口监听（可选）
- [精简列表]
```

---

## Platform Notes

| 平台 | 命令差异 |
|------|----------|
| **macOS** | ifconfig, networksetup, scutil, netstat |
| **Linux** | ip, ss, dig/nslookup, 无 networksetup/scutil，用 /etc/resolv.conf |

---

## Error Handling

| 情况 | 处理 |
|------|------|
| 某模块命令失败 | 该模块标注「检测失败」，其他模块照常输出 |
| 外网不可达 | 公网 IP、部分连通性、速度可能失败，标注「需外网」 |
| 代理环境下 curl | 注明「检测经代理」，结果反映代理后可达性 |
| Linux 无 dig | 用 nslookup，或无耗时则仅报解析成功/失败 |

---

## Example

**Input:** "检查一下网络状态"

**Actions:**
1. 运行 env | grep proxy, networksetup, scutil --proxy
2. ping google.com, github.com, cloudflare.com
3. ping -c 5 8.8.8.8；curl cloudflare.com/cdn-cgi/trace 测速
4. cat /etc/resolv.conf, dig google.com
5. ifconfig / ip addr
6. curl ipinfo.io
7. ifconfig | grep utun
8. 汇总为 Markdown 报告，语言与用户一致
