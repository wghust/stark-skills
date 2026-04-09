# scripts（占位符示例）

蒸馏**新生成**的 Skill 时，可将只读调用示例放在下游包的 `scripts/` 中，**不得**包含真实 Token 或密码。

以下仅为模板；路径前缀请按实例调整为 `/wiki/rest/api/...` 或 `/rest/api/...`。

## Direct REST（curl）

```bash
# 搜索（Cloud 常见：基址 host 为 xxx.atlassian.net，路径含 /wiki）
export CONFLUENCE_BASE="https://YOURSITE.atlassian.net/wiki"
export CONFLUENCE_USER="you@company.com"
export CONFLUENCE_TOKEN="YOUR_API_TOKEN"

curl -sS -u "${CONFLUENCE_USER}:${CONFLUENCE_TOKEN}" \
  -G "${CONFLUENCE_BASE}/rest/api/content/search" \
  --data-urlencode 'cql=type=page AND space=TEAM AND text ~ "alert"' \
  --data-urlencode 'limit=10'
```

## Membrane（只读）

```bash
export CONNECTION_ID="YOUR_MEMBRANE_CONNECTION_ID"

membrane request "$CONNECTION_ID" /rest/api/content/search \
  --method GET \
  --query "cql=type=page AND text ~ \"alert\"" \
  --query "limit=10"
```

具体子命令以 [Membrane Confluence 技能文档](https://skills.sh/membranedev/application-skills/confluence) 为准。
