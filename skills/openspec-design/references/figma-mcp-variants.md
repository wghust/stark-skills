# Figma MCP 常见实现对照

执行前必须在当前环境 **列出/读取 Figma 相关 MCP 的工具描述**（如 Cursor 的 MCP 工具 JSON），**只用实际存在的工具名与参数**，不要假设固定名称。

## Pattern A：多工具链（示例名）

部分实现提供解析、读文件/节点、导出等分立工具，名称可能类似：

| 能力 | 示例工具名（以你环境为准） |
|------|---------------------------|
| 解析 URL | `parse_figma_url` 等 |
| 文件/节点 | `get_file`、`get_node` 等 |
| 导出图 | `export_images` 等 |

按该 MCP 文档顺序调用；导出文件写入 `openspec/changes/<change-id>/design/`。

## Pattern B：Framelink 风格（两工具）

| 工具 | 作用 | 要点 |
|------|------|------|
| `get_figma_data` | 拉取节点/布局等结构化数据 | `fileKey` 必填；URL 的 `node-id=2496-1199` 规范化为 `2496:1199` 传入 `nodeId`（若需） |
| `download_figma_images` | 按节点导出 png/svg/gif | `fileKey`、`nodes[]`（含 `nodeId`、`fileName` 等）、`localPath` 为**相对仓库根**的目录，例如 `openspec/changes/<change-id>/design` |

**推荐调用顺序**：先 `get_figma_data`（可用 URL 中的 `nodeId` 缩小范围，或仅 `fileKey` 浏览结构），在返回树里定位要导出的 frame/组件/图片节点；再按 `download_figma_images` 的 schema 组装 `nodes`（若节点含 `imageRef`/`gifRef` 等填充字段，导出工具常要求一并传入）。不要凭空猜 `nodeId` 列表。

从 Figma 链接取 `fileKey`：`figma.com/design/<fileKey>/...` 或 `figma.com/file/<fileKey>/...`。

## URL 与 node-id

- 查询参数常为 `node-id=数字-数字`，多数 API 要 `数字:数字`。
- 无 `node-id` 时：先用 `get_figma_data` 仅 `fileKey` 探索结构，再选节点导出（若工具支持）。
