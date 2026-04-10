# ICO 格式与浏览器要点（create-favicon）

## ICO 是什么

`favicon.ico` 使用的 **ICO** 是 **容器格式**（Windows icon），不是单张裸 PNG 改扩展名。一个文件可包含多幅不同尺寸的图像；浏览器会按场景选用合适条目。

权威概述可参考：

- [ICO (file format) — Wikipedia](https://en.wikipedia.org/wiki/ICO_(file_format))
- [Kaitai Struct — ICO](https://formats.kaitai.io/ico/index.html)

## 文件布局（概念）

1. **ICONDIR**（6 字节）  
   - `Reserved` = 0  
   - `Type` = 1（图标，非光标）  
   - `Count` = 嵌入图像数量（本 skill 产出为 **3**）

2. **`Count` 条 ICONDIRENTRY**（每条 16 字节）  
   记录宽、高、色深相关字段、**图像数据字节数**、在文件中的 **偏移**。

3. **图像数据区**  
   每条数据为 **完整 PNG**（推荐，带 `PNG` 文件头）或传统 **BMP DIB**（不含 `BITMAPFILEHEADER`）。  
   自 Windows Vista 起 ICO 内嵌 **PNG** 被广泛支持；本仓库 CLI **三档均使用嵌入 PNG（RGBA）**，利于透明与体积。

宽/高字段为 **1–255**；若为 **256** 则宽或高字段写 **0**（本 skill 的 32、48、180 均直接写数值）。

## MIME 类型

- IANA：`image/vnd.microsoft.icon`  
- 历史上常见：`image/x-icon`  
部署时以服务器配置为准；两者在实践中都可遇到。

## 本 skill 的三档尺寸

| 边长   | 常见用途（简述） |
|--------|------------------|
| 32×32  | 标签栏、部分桌面/列表图标 |
| 48×48  | 部分系统 UI、较大列表 |
| 180×180 | 常与 **Apple Touch Icon** 同尺寸；此处按需求 **嵌入 ICO**，便于单文件多分辨率 |

## Apple Touch Icon 与 `favicon.ico` 的关系

- 许多站点会额外提供 **`/apple-touch-icon.png`（180×180）** 供 iOS 主屏幕等场景。  
- **将 180×180 放进 `favicon.ico` 在格式上合法**，但 **不应** 假设 iOS 会优先或唯一使用该 ICO 内大图；需要精致主屏幕图标时，仍建议按平台文档提供独立 PNG 与 `<link rel="apple-touch-icon" …>`。

## 粗校验思路

- 文件头：`00 00 01 00`，随后 `03 00` 表示 3 张图（小端）。  
- 按目录项偏移找到三段子图，每段应以 PNG 魔数 `89 50 4E 47 0D 0A 1A 0A` 开头。  
- 解码 PNG 后确认像素尺寸分别为 **32、48、180**（实现细节见工具 README）。
