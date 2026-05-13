#!/usr/bin/env python3
"""Scan local agent skills and generate a playful power profile."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


DOMAIN_KEYWORDS: dict[str, tuple[str, ...]] = {
    "video": ("video", "clip", "剪辑", "字幕", "media", "ffmpeg", "shorts"),
    "image-design": (
        "image",
        "favicon",
        "figma",
        "design",
        "diagram",
        "visual",
        "图片",
        "图像",
        "小红书",
        "ui/ux",
    ),
    "frontend": ("react", "next.js", "nextjs", "frontend", "webapp", "browser", "页面", "组件"),
    "backend-devops": (
        "deploy",
        "azure",
        "ci/cd",
        "cicd",
        "pipeline",
        "cloud",
        "api",
        "debug",
        "infra",
        "后端",
        "部署",
    ),
    "docs-writing": (
        "document",
        "docx",
        "presentation",
        "ppt",
        "spreadsheet",
        "xlsx",
        "report",
        "writing",
        "pdf",
        "文档",
        "报告",
    ),
    "research-analysis": (
        "research",
        "analysis",
        "seo",
        "audit",
        "market",
        "competitive",
        "调研",
        "分析",
        "竞品",
    ),
    "automation-tools": (
        "automation",
        "browser-use",
        "computer",
        "chrome",
        "mac",
        "network",
        "toolkit",
        "自动化",
    ),
    "git-collab": ("git", "github", "gitlab", "pull request", "merge request", "issue", "branch", "commit", "release"),
    "knowledge-memory": (
        "confluence",
        "distill",
        "memory",
        "knowledge",
        "wiki",
        "governor",
        "知识",
    ),
    "business-product": ("prd", "pm", "product", "planner", "strategy", "growth", "ceo", "产品", "规划"),
}

TITLES = {
    "video": "剪辑大师",
    "image-design": "视觉召唤师",
    "frontend": "前端魔导士",
    "backend-devops": "云端术式师",
    "docs-writing": "文档贤者",
    "research-analysis": "情报占星师",
    "automation-tools": "自动化机关师",
    "git-collab": "版本审判官",
    "knowledge-memory": "知识图书馆长",
    "business-product": "产品军师",
    "misc": "异能收藏家",
}

TITLES_EN = {
    "video": "Timeline Master",
    "image-design": "Visual Summoner",
    "frontend": "Frontend Mage",
    "backend-devops": "Cloud Ritualist",
    "docs-writing": "Document Sage",
    "research-analysis": "Intelligence Astrologer",
    "automation-tools": "Automation Artificer",
    "git-collab": "Version Arbiter",
    "knowledge-memory": "Knowledge Librarian",
    "business-product": "Product Strategist",
    "misc": "Arcane Collector",
    "fullstack": "Full-Stack Alchemist",
}

RANK_LABELS_EN = {
    "SSS": "Domain Sovereign",
    "SS": "Omni Hero",
    "S": "Master Tier",
    "A": "Specialist Tier",
    "B": "Apprentice Tier",
    "C": "Starter Adventurer",
}

DOMAIN_LABELS = {
    "video": "视频剪辑",
    "image-design": "图像设计",
    "frontend": "前端界面",
    "backend-devops": "后端部署",
    "docs-writing": "文档报告",
    "research-analysis": "研究分析",
    "automation-tools": "自动化",
    "git-collab": "协作版本",
    "knowledge-memory": "知识记忆",
    "business-product": "产品商业",
    "misc": "异能杂项",
}

DOMAIN_LABELS_EN = {
    "video": "Video Editing",
    "image-design": "Image & Design",
    "frontend": "Frontend UI",
    "backend-devops": "Backend & DevOps",
    "docs-writing": "Docs & Reports",
    "research-analysis": "Research & Analysis",
    "automation-tools": "Automation",
    "git-collab": "Git & Collaboration",
    "knowledge-memory": "Knowledge & Memory",
    "business-product": "Business & Product",
    "misc": "Miscellaneous",
}

PROVIDER_MARKERS = {
    "workspace": ("/skills",),
    "cursor": ("/.cursor/skills",),
    "claude": ("/.claude/skills",),
    "codex": ("/.codex/skills",),
    "agents": ("/.agents/skills",),
}


def normalize_language(language: str) -> str:
    return "zh" if language == "auto" else language


def domain_label(domain: str, language: str) -> str:
    labels = DOMAIN_LABELS_EN if language == "en" else DOMAIN_LABELS
    return labels.get(domain, domain)


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, flags=re.S)
    if not match:
        return {}
    data: dict[str, str] = {}
    current_key: str | None = None
    current_lines: list[str] = []
    for raw in match.group(1).splitlines():
        if re.match(r"^[A-Za-z_][\w-]*:\s*", raw):
            if current_key is not None:
                data[current_key] = "\n".join(current_lines).strip().strip("'\"")
            key, value = raw.split(":", 1)
            current_key = key.strip()
            value = value.strip()
            current_lines = [] if value in {"|", ">"} else [value]
        elif current_key is not None:
            current_lines.append(raw.strip())
    if current_key is not None:
        data[current_key] = "\n".join(current_lines).strip().strip("'\"")
    return data


def default_roots(workspace: Path | None) -> list[Path]:
    home = Path.home()
    roots: list[Path] = []
    if workspace:
        roots.extend(
            [
                workspace / "skills",
                workspace / ".cursor" / "skills",
                workspace / ".claude" / "skills",
                workspace / ".codex" / "skills",
                workspace / ".agents" / "skills",
            ]
        )
    roots.extend(
        [
            home / ".cursor" / "skills",
            home / ".claude" / "skills",
            home / ".codex" / "skills",
            home / ".agents" / "skills",
        ]
    )
    deduped: list[Path] = []
    seen: set[str] = set()
    for root in roots:
        key = str(root.expanduser())
        if key not in seen:
            seen.add(key)
            deduped.append(root)
    return deduped


def keyword_matches(text: str, keyword: str) -> bool:
    key = keyword.lower()
    if re.search(r"[\u4e00-\u9fff]", key):
        return key in text
    if not re.fullmatch(r"[a-z0-9][a-z0-9.+/-]*", key):
        return key in text
    return re.search(rf"(?<![a-z0-9]){re.escape(key)}(?![a-z0-9])", text) is not None


def classify(blob: str) -> list[str]:
    text = blob.lower()
    scored: list[tuple[int, str]] = []
    for domain, keywords in DOMAIN_KEYWORDS.items():
        hits = sum(1 for keyword in keywords if keyword_matches(text, keyword))
        if hits:
            scored.append((hits, domain))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [domain for _, domain in scored[:2]] or ["misc"]


def scan(root: Path) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    if not root.exists():
        return items
    paths = [root] if root.name == "SKILL.md" and root.is_file() else sorted(root.rglob("SKILL.md"))
    for path in paths:
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            items.append({"path": str(path), "error": str(exc), "domains": ["misc"]})
            continue
        frontmatter = parse_frontmatter(text)
        headings = " ".join(re.findall(r"^#{1,3}\s+(.+)$", text, flags=re.M)[:8])
        package_dir = path.parent
        blob = " ".join(
            [
                package_dir.name,
                frontmatter.get("name", ""),
                frontmatter.get("description", ""),
                headings,
            ]
        )
        items.append(
            {
                "path": str(path),
                "package": str(package_dir),
                "name": frontmatter.get("name", package_dir.name),
                "version": frontmatter.get("version", ""),
                "description": frontmatter.get("description", ""),
                "domains": classify(blob),
                "has_scripts": (package_dir / "scripts").exists(),
                "has_references": (package_dir / "references").exists(),
                "has_assets": (package_dir / "assets").exists(),
                "description_length": len(frontmatter.get("description", "")),
            }
        )
    return items


def provider_for_root(root: Path, workspace: Path | None) -> str:
    expanded = root.expanduser()
    root_text = str(expanded)
    if workspace:
        workspace_skills = workspace.expanduser() / "skills"
        try:
            if expanded.resolve() == workspace_skills.resolve():
                return "workspace"
        except OSError:
            if root_text == str(workspace_skills):
                return "workspace"
    for provider, markers in PROVIDER_MARKERS.items():
        if provider == "workspace":
            continue
        if any(marker in root_text for marker in markers):
            return provider
    return "custom"


def filter_roots(roots: list[Path], providers: set[str] | None, workspace: Path | None) -> list[Path]:
    if not providers:
        return roots
    return [root for root in roots if provider_for_root(root, workspace) in providers]


def dedupe_items(items: list[dict[str, Any]], mode: str) -> tuple[list[dict[str, Any]], int]:
    if mode == "none":
        return items, 0
    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in items:
        if mode == "name":
            key = item.get("name", "").strip().lower() or item.get("path", "")
        elif mode == "package":
            key = item.get("package", "")
        else:
            path = Path(item.get("path", ""))
            try:
                key = str(path.expanduser().resolve())
            except OSError:
                key = str(path.expanduser())
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped, len(items) - len(deduped)


def score(items: list[dict[str, Any]]) -> dict[str, Any]:
    domain_counts: Counter[str] = Counter()
    for item in items:
        for domain in item.get("domains", ["misc"]):
            domain_counts[domain] += 1

    total = len(items)
    known_domains = [d for d in domain_counts if d != "misc"]
    coverage = min(100, round(len(known_domains) / 10 * 100))
    known_counts = Counter({domain: count for domain, count in domain_counts.items() if domain != "misc"})
    top_count = (known_counts or domain_counts).most_common(1)[0][1] if domain_counts else 0
    rich = sum(1 for item in items if item.get("description_length", 0) >= 120)
    depth = 0 if total == 0 else min(100, round((top_count / max(1, total) * 45) + (rich / total * 55)))
    concentration = 0 if total == 0 else top_count / total
    balance = 0 if total == 0 else min(100, max(20, round((1 - concentration) * 125)))
    operational_items = sum(
        1
        for item in items
        if item.get("has_scripts") or item.get("has_references") or item.get("has_assets")
    )
    operability = 0 if total == 0 else round(operational_items / total * 100)
    omnipotence = round(coverage * 0.35 + depth * 0.25 + balance * 0.20 + operability * 0.20)

    if omnipotence >= 90:
        rank = "SSS"
        rank_label = "全域支配者"
    elif omnipotence >= 85:
        rank = "SS"
        rank_label = "万能勇者"
    elif omnipotence >= 75:
        rank = "S"
        rank_label = "大师阶"
    elif omnipotence >= 60:
        rank = "A"
        rank_label = "专精阶"
    elif omnipotence >= 40:
        rank = "B"
        rank_label = "见习阶"
    else:
        rank = "C"
        rank_label = "初始村冒险者"

    top_domain = (known_counts or domain_counts).most_common(1)[0][0] if domain_counts else "misc"
    title_key = "fullstack" if omnipotence >= 82 and len(known_domains) >= 7 else top_domain
    title = "全栈炼金术士" if title_key == "fullstack" else TITLES.get(top_domain, "异能收藏家")

    return {
        "total_skills": total,
        "domain_counts": dict(domain_counts.most_common()),
        "top_domain": top_domain,
        "title_key": title_key,
        "title": title,
        "rank": rank,
        "rank_label": rank_label,
        "scores": {
            "omnipotence": omnipotence,
            "coverage": coverage,
            "depth": depth,
            "balance": balance,
            "operability": operability,
        },
    }


def localized_title(profile: dict[str, Any], language: str) -> str:
    if language == "en":
        return TITLES_EN.get(profile.get("title_key", profile.get("top_domain", "misc")), TITLES_EN["misc"])
    return profile.get("title", TITLES["misc"])


def localized_rank_label(profile: dict[str, Any], language: str) -> str:
    if language == "en":
        return RANK_LABELS_EN.get(profile.get("rank", "C"), "Starter Adventurer")
    return profile.get("rank_label", "初始村冒险者")


def build_report(
    items: list[dict[str, Any]],
    scanned_roots: list[Path],
    attempted_roots: list[Path],
    missing_roots: list[Path],
    count_mode: str,
    duplicates_removed: int,
    provider_filter: list[str],
    language: str,
) -> dict[str, Any]:
    profile = score(items)
    profile["title"] = localized_title(profile, language)
    profile["rank_label"] = localized_rank_label(profile, language)
    examples: dict[str, list[dict[str, str]]] = defaultdict(list)
    for item in items:
        for domain in item.get("domains", ["misc"]):
            if len(examples[domain]) < 5:
                examples[domain].append(
                    {
                        "name": item.get("name", ""),
                        "path": item.get("path", ""),
                    }
                )
    return {
        "attempted_roots": [str(root) for root in attempted_roots],
        "scanned_roots": [str(root) for root in scanned_roots],
        "missing_roots": [str(root) for root in missing_roots],
        "count_mode": count_mode,
        "duplicates_removed": duplicates_removed,
        "provider_filter": provider_filter,
        "language": language,
        "profile": profile,
        "examples": dict(examples),
        "skills": items,
    }


def empty_markdown(report: dict[str, Any], *, language: str = "zh") -> str:
    if language == "en":
        lines = [
            "**No measurable SKILL.md files found**",
            "",
            "No title, strengths, score interpretation, or image brief was generated because this scan found no readable skill files.",
            "",
            "**Attempted roots**:",
        ]
        for root in report.get("attempted_roots", []):
            lines.append(f"- {root}")
        if report.get("missing_roots"):
            lines.extend(["", "**Missing or inaccessible roots**:"])
            for root in report["missing_roots"]:
                lines.append(f"- {root}")
        return "\n".join(lines)

    lines = [
        "**未发现可测评的 SKILL.md**",
        "",
        "没有生成战力称号或强项判断，因为本次扫描没有找到任何可读的 skill 文件。",
        "",
        "**尝试扫描的根目录**:",
    ]
    for root in report.get("attempted_roots", []):
        lines.append(f"- {root}")
    if report.get("missing_roots"):
        lines.extend(["", "**不存在或不可访问的根目录**:"])
        for root in report["missing_roots"]:
            lines.append(f"- {root}")
    return "\n".join(lines)


def markdown(
    report: dict[str, Any],
    *,
    tone: str = "dramatic",
    depth: str = "standard",
    language: str = "zh",
) -> str:
    if report["profile"]["total_skills"] == 0:
        return empty_markdown(report, language=language)
    profile = report["profile"]
    scores = profile["scores"]
    narrative = narrative_sections(report, tone=tone, language=language)
    title = localized_title(profile, language)
    rank_label = localized_rank_label(profile, language)
    title_label = "Title" if language == "en" else ("封号" if tone != "normal" else "画像")
    if depth == "brief":
        top_domains = ", ".join(
            f"{domain_label(domain, language)}: {count}"
            for domain, count in list(profile["domain_counts"].items())[:5]
        )
        if language == "en":
            return "\n".join(
                [
                    f"**{title_label}**: {title} ({profile['rank']} · {rank_label})",
                    f"**Power Panel**: {scores['omnipotence']}/100; Coverage {scores['coverage']}, Depth {scores['depth']}, Balance {scores['balance']}, Operability {scores['operability']}.",
                    f"**Skill Tree**: {top_domains}",
                    f"**Evidence Mode**: {profile['total_skills']} skills, count mode `{report.get('count_mode', 'none')}`.",
                    f"**Weakness**: {narrative['weaknesses'][0]}",
                    f"**Upgrade Path**: {narrative['routes'][0]['summary']}",
                    f"**Conclusion**: {narrative['conclusion']}",
                ]
            )
        return "\n".join(
            [
                f"**{title_label}**: {title} ({profile['rank']} · {rank_label})",
                f"**战力面板**: {scores['omnipotence']}/100；覆盖 {scores['coverage']}，深度 {scores['depth']}，均衡 {scores['balance']}，可操作性 {scores['operability']}。",
                f"**技能树分布**: {top_domains}",
                f"**证据口径**: {profile['total_skills']} 个 skill，计数模式 `{report.get('count_mode', 'none')}`。",
                f"**短板**: {narrative['weaknesses'][0]}",
                f"**补强**: {narrative['routes'][0]['summary']}",
                f"**结论**: {narrative['conclusion']}",
            ]
        )
    if language == "en":
        lines = [
            f"**{title_label}**: {title} ({profile['rank']} · {rank_label})",
            "",
            f"**Power Panel**: Omnipotence {scores['omnipotence']}/100; Coverage {scores['coverage']}, Depth {scores['depth']}, Balance {scores['balance']}, Operability {scores['operability']}.",
            "",
            f"**Evidence Mode**: {profile['total_skills']} skills; count mode `{report.get('count_mode', 'none')}`; duplicates removed {report.get('duplicates_removed', 0)}.",
            "",
            "**Skill Tree Distribution**:",
        ]
        for domain, count in profile["domain_counts"].items():
            lines.append(f"- {domain_label(domain, language)}: {count}")
        lines.extend(["", "**Representative Skills**:"])
        for domain, examples in report["examples"].items():
            names = ", ".join(f"{item['name']} ({item['path']})" for item in examples[:3])
            lines.append(f"- {domain_label(domain, language)}: {names}")
        lines.extend(["", "**Strengths**:"])
        lines.extend(f"- {item}" for item in narrative["strengths"])
        lines.extend(["", "**Weaknesses**:"])
        lines.extend(f"- {item}" for item in narrative["weaknesses"])
        lines.extend(["", "**Upgrade Paths**:"])
        lines.extend(f"- {item['title']}: {item['summary']}" for item in narrative["routes"])
        lines.extend(["", "**Current Conclusion**:", narrative["conclusion"]])
        lines.extend(["", "**Scanned Roots**:"])
        for root in report["scanned_roots"]:
            lines.append(f"- {root}")
        if depth == "deep":
            misc_count = profile["domain_counts"].get("misc", 0)
            repeated_names = duplicate_names(report.get("skills", []))
            lines.extend(["", "**Deep Audit Addendum**:"])
            lines.append(f"- Misc/unclassified count: {misc_count}")
            lines.append(f"- Duplicate skill names: {', '.join(repeated_names[:8]) if repeated_names else 'none found'}")
            if report.get("missing_roots"):
                lines.append(f"- Missing roots: {', '.join(report['missing_roots'])}")
        return "\n".join(lines)

    lines = [
        f"**{title_label}**: {title} ({profile['rank']} · {rank_label})",
        "",
        f"**战力面板**: 无所不能指数 {scores['omnipotence']}/100；覆盖 {scores['coverage']}，深度 {scores['depth']}，均衡 {scores['balance']}，可操作性 {scores['operability']}。",
        "",
        f"**证据口径**: {profile['total_skills']} 个 skill；计数模式 `{report.get('count_mode', 'none')}`；去重移除 {report.get('duplicates_removed', 0)} 个。",
        "",
        "**技能树分布**:",
    ]
    for domain, count in profile["domain_counts"].items():
        lines.append(f"- {domain_label(domain, language)}: {count}")
    lines.extend(["", "**代表技能**:"])
    for domain, examples in report["examples"].items():
        names = ", ".join(f"{item['name']} ({item['path']})" for item in examples[:3])
        lines.append(f"- {domain_label(domain, language)}: {names}")
    lines.extend(["", "**你的强项**:"])
    lines.extend(f"- {item}" for item in narrative["strengths"])
    lines.extend(["", "**短板**:"])
    lines.extend(f"- {item}" for item in narrative["weaknesses"])
    lines.extend(["", "**补强路线**:"])
    lines.extend(f"- {item['title']}: {item['summary']}" for item in narrative["routes"])
    lines.extend(["", "**当前结论**:", narrative["conclusion"]])
    lines.extend(["", "**扫描根**:"])
    for root in report["scanned_roots"]:
        lines.append(f"- {root}")
    if depth == "deep":
        misc_count = profile["domain_counts"].get("misc", 0)
        repeated_names = duplicate_names(report.get("skills", []))
        lines.extend(["", "**深度审计补充**:"])
        lines.append(f"- misc 未分类计数: {misc_count}")
        lines.append(f"- 重名 skill 线索: {', '.join(repeated_names[:8]) if repeated_names else '未发现'}")
        if report.get("missing_roots"):
            lines.append(f"- 未扫描到的根目录: {', '.join(report['missing_roots'])}")
    return "\n".join(lines)


def sample_names(examples: dict[str, list[dict[str, str]]], domain: str, limit: int = 3) -> list[str]:
    return [item.get("name", "") for item in examples.get(domain, [])[:limit] if item.get("name")]


def duplicate_names(items: list[dict[str, Any]]) -> list[str]:
    counts = Counter(item.get("name", "") for item in items if item.get("name"))
    return [name for name, count in counts.items() if count > 1]


def visual_subject(profile: dict[str, Any], *, language: str = "zh") -> str:
    title = localized_title(profile, language)
    top_domain = profile.get("top_domain", "misc")
    if language == "en":
        domain = domain_label(top_domain, language)
        actions = {
            "docs-writing": "opening report scrolls in a magical archive",
            "research-analysis": "reading star charts and intelligence maps",
            "image-design": "summoning luminous pixels and design runes",
            "frontend": "constructing glowing interfaces and component sigils",
            "backend-devops": "forging cloud deployments and pipeline cores",
            "automation-tools": "commanding automation mechanisms and terminal panels",
            "git-collab": "judging branch ledgers and version scrolls",
            "knowledge-memory": "organizing a knowledge library and memory index",
            "business-product": "studying a product strategy map and roadmap board",
            "video": "controlling timelines and subtitle light trails",
        }
        return f"the {title}, anchored in the {domain} branch, {actions.get(top_domain, 'inspecting a multi-domain skill tree')}"

    domain = DOMAIN_LABELS.get(top_domain, "技能树")
    if top_domain == "docs-writing":
        action = "在魔法书馆中翻开报告卷轴"
    elif top_domain == "research-analysis":
        action = "观测星盘与情报地图"
    elif top_domain == "image-design":
        action = "召唤发光像素与设计符文"
    elif top_domain == "frontend":
        action = "构筑发光界面与组件法阵"
    elif top_domain == "backend-devops":
        action = "锻造云端部署与流水线核心"
    elif top_domain == "automation-tools":
        action = "操控自动化机关与终端面板"
    elif top_domain == "git-collab":
        action = "审判分支与版本卷宗"
    elif top_domain == "knowledge-memory":
        action = "整理知识书库与记忆索引"
    elif top_domain == "business-product":
        action = "推演产品沙盘与路线图"
    elif top_domain == "video":
        action = "掌控时间线与字幕光带"
    else:
        action = "检视多系技能树"
    return f"“{title}”围绕{domain}主脉，{action}"


def narrative_sections(report: dict[str, Any], *, tone: str = "dramatic", language: str = "zh") -> dict[str, Any]:
    profile = report["profile"]
    scores = profile["scores"]
    if profile["total_skills"] == 0:
        if language == "en":
            return {
                "strengths": [],
                "weaknesses": ["No readable SKILL.md files were found, so the capability distribution cannot be evaluated."],
                "routes": [
                    {
                        "title": "Establish a Scan Baseline",
                        "summary": "Confirm that the skill root exists and contains at least one SKILL.md with frontmatter.",
                        "items": ["Check paths", "Confirm permissions", "Run the scan again"],
                    }
                ],
                "conclusion": "There is not enough evidence to generate a skill power profile.",
            }
        return {
            "strengths": [],
            "weaknesses": ["没有发现可读的 SKILL.md，无法判断能力分布。"],
            "routes": [
                {
                    "title": "先建立扫描基线",
                    "summary": "确认 skill 根目录存在，并至少包含一个带 frontmatter 的 SKILL.md。",
                    "items": ["检查路径", "确认权限", "重新运行扫描"],
                }
            ],
            "conclusion": "本次没有足够证据生成战力画像。",
        }
    examples = report.get("examples", {})
    counts = profile["domain_counts"]
    docs = sample_names(examples, "docs-writing")
    research = sample_names(examples, "research-analysis")
    frontend = sample_names(examples, "frontend")
    product = sample_names(examples, "business-product")
    video_count = counts.get("video", 0)
    title = localized_title(profile, language)

    if language == "en":
        if tone == "full-chuunibyou":
            strengths = [
                f"The multi-branch skill tree is lit: Docs & Reports has {counts.get('docs-writing', 0)} matches and Research & Analysis has {counts.get('research-analysis', 0)}. This is not a lone peak; it is a constellation of usable rituals.",
                f"{', '.join((docs + research)[:4]) or 'Core docs and research skills'} are the brightest evidence anchors for reports, diagnostics, and review work.",
                f"{', '.join((frontend + product)[:4]) or 'Frontend and product skills'} connect interface building, product planning, and delivery flow into the same power circuit.",
            ]
            weaknesses = [
                f"The real seal is operability: {scores['operability']}/100. Too many skills still read like scrolls instead of executable instruments with scripts/, references/, or assets/.",
                f"The video branch is still faint: only {video_count} video-related match(es), not enough to claim the Timeline Master crown.",
            ]
            routes = [
                {
                    "title": "Unlock Omni Hero",
                    "summary": "Forge high-frequency skills into executable rituals, moving them from guidance to delivery.",
                    "items": ["Add scripts for docs/research skills", "Batch processing and template generation", "Grow assets/ and scripts/ coverage"],
                },
                {
                    "title": "Ignite Timeline Master",
                    "summary": "Add video editing, subtitles, clipping, cover generation, and batch transcoding skills.",
                    "items": ["Video editing and subtitles", "Cover/intro/outro generation", "Batch transcoding and format adaptation"],
                },
                {
                    "title": "Ascend to Full-Stack Alchemist",
                    "summary": "Connect backend/devops and automation into a deployment, monitoring, and CI repair loop.",
                    "items": ["Backend service skills", "CI/CD setup and repair", "Monitoring, alerts, and logs"],
                },
            ]
        else:
            strengths = [
                f"The arsenal is broad rather than single-purpose: Docs & Reports has {counts.get('docs-writing', 0)} matches and Research & Analysis has {counts.get('research-analysis', 0)}.",
                f"{', '.join((docs + research)[:4]) or 'Core docs and research skills'} provide the strongest evidence for reporting, diagnostics, and review capability.",
                f"{', '.join((frontend + product)[:4]) or 'Frontend and product skills'} add coverage across UI, product planning, and delivery workflows.",
            ]
            weaknesses = [
                f"Operability is the main constraint: {scores['operability']}/100. Many skills are still instruction-heavy and do not include enough scripts/, references/, or assets/.",
                f"The video branch is thin: only {video_count} video-related match(es), not enough to claim Timeline Master.",
            ]
            routes = [
                {
                    "title": "Aim for Omni Hero",
                    "summary": "Add automation scripts to high-frequency skills so they can execute, not only guide.",
                    "items": ["Add scripts for docs/research skills", "Batch processing and template generation", "Grow assets/ and scripts/ coverage"],
                },
                {
                    "title": "Earn Timeline Master",
                    "summary": "Add video editing, subtitles, clipping, cover generation, and batch transcoding skills.",
                    "items": ["Video editing and subtitles", "Cover/intro/outro generation", "Batch transcoding and format adaptation"],
                },
                {
                    "title": "Advance to Full-Stack Alchemist",
                    "summary": "Strengthen backend/devops and automation so deployment, monitoring, and CI repair form a closed loop.",
                    "items": ["Backend service skills", "CI/CD setup and repair", "Monitoring, alerts, and logs"],
                },
            ]

        if scores["depth"] < 60:
            weaknesses.append(f"Depth is {scores['depth']}/100, which means coverage is broad but several domains still need stronger scripts, examples, and task closure.")
        if scores["omnipotence"] >= 85:
            conclusion = f"You are the {title}, nearly a full-domain skill tree. The next step is to deepen executable workflows."
        elif scores["omnipotence"] >= 60:
            conclusion = f"You are the {title}: strong and recognizable, but still specialist-leaning. To climb higher, add scripts, examples, and deduped real depth."
        else:
            conclusion = f"You are currently the {title}. The foundation is visible, but the arsenal needs more verifiable, executable skills."
        if tone == "full-chuunibyou":
            conclusion = f"{conclusion} The title may burn bright, but the evidence still comes from local SKILL.md metadata."
        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "routes": routes,
            "conclusion": conclusion,
        }

    if tone == "normal":
        strengths = [
            f"技能覆盖较广，文档/报告与研究分析分别有 {counts.get('docs-writing', 0)} / {counts.get('research-analysis', 0)} 个匹配项。",
            f"{'、'.join((docs + research)[:4]) or '核心文档与研究技能'} 是当前最能支撑结论的代表技能。",
            f"{'、'.join((frontend + product)[:4]) or '前端与产品技能'} 体现了界面、产品和规划侧的覆盖。",
        ]
    elif tone == "full-chuunibyou":
        strengths = [
            f"多系技能树已经点亮：文档/报告 {counts.get('docs-writing', 0)} 个、研究分析 {counts.get('research-analysis', 0)} 个，主脉不是孤峰，而是一整片术式星图。",
            f"{'、'.join((docs + research)[:4]) or '核心文档与研究技能'} 是当前最亮的证据锚点，支撑报告、诊断、评审这些高频战场。",
            f"{'、'.join((frontend + product)[:4]) or '前端与产品技能'} 把界面构筑、产品规划与交付路线接入同一套技能回路。",
        ]
    else:
        strengths = [
            f"你不是单点爆发型，而是多系法术书持有者；文档/报告与研究分析各有 {counts.get('docs-writing', 0)} / {counts.get('research-analysis', 0)} 个技能支撑。",
            f"{'、'.join((docs + research)[:4]) or '核心文档与研究技能'} 等技能让你的文档、报告、诊断、评审能力很强。",
            f"{'、'.join((frontend + product)[:4]) or '前端与产品技能'} 补齐了界面、产品、规划与组织级交付能力。",
        ]

    if tone == "full-chuunibyou":
        weaknesses = [
            f"真正的封印点在可操作性：当前 {scores['operability']}/100，仍有不少 skill 停留在卷轴说明，还没有铸成 scripts/、references/、assets/ 这些可执行器具。",
            f"视频剪辑支线仍是暗淡星脉，目前 video 相关仅 {video_count} 个，还不足以加冕剪辑大师。",
        ]
    else:
        weaknesses = [
            f"主要卡在可操作性：当前可操作性 {scores['operability']}/100，很多 skill 更偏说明/流程型，带 scripts/、references/、assets/ 的比例还不够高。",
            f"视频剪辑线较薄，目前 video 相关仅 {video_count} 个，还不足以稳定封为剪辑大师。",
        ]
    if scores["depth"] < 60:
        weaknesses.append(f"深度为 {scores['depth']}/100，说明覆盖很广，但多个领域还需要更厚的脚本、样例和任务闭环。")

    if tone == "full-chuunibyou":
        routes = [
            {
                "title": "解锁 万能勇者",
                "summary": "把高频 skill 锻造成可执行术式，让“会指导”升级为“能落地”。",
                "items": ["为文档/分析技能增加自动化脚本", "批量处理、模板生成、一键导出", "扩展 assets/ 与 scripts/ 覆盖率"],
            },
            {
                "title": "点亮 剪辑大师",
                "summary": "补齐视频剪辑、字幕、切片、封面生成和批量转码支线。",
                "items": ["视频剪辑与字幕生成", "封面/片头片尾批量生成", "批量转码与格式适配"],
            },
            {
                "title": "晋升 全栈炼金术士",
                "summary": "把 backend/devops 与自动化链路串成部署、监控、CI 修复闭环。",
                "items": ["完善后端服务/微服务技能树", "CI/CD 流水线搭建与修复", "监控、告警、日志链路打通"],
            },
        ]
    else:
        routes = [
            {
                "title": "想冲 万能勇者",
                "summary": "给高频 skill 增加自动化脚本，让它们从“会指导”升级成“会执行”。",
                "items": ["为文档/分析技能增加自动化脚本", "批量处理、模板生成、一键导出", "扩展 assets/ 与 scripts/ 覆盖率"],
            },
            {
                "title": "想拿 剪辑大师",
                "summary": "补齐视频剪辑、字幕、切片、封面生成和批量转码类 skills。",
                "items": ["视频剪辑与字幕生成", "封面/片头片尾批量生成", "批量转码与格式适配"],
            },
            {
                "title": "想进阶 全栈炼金术士",
                "summary": "增强 backend/devops 与自动化工具链，把部署、监控、CI 修复串起来。",
                "items": ["完善后端服务/微服务技能树", "CI/CD 流水线搭建与修复", "监控、告警、日志链路打通"],
            },
        ]

    if scores["omnipotence"] >= 85:
        conclusion = f"你是 {profile['title']}，已经接近全域型技能树；下一步主要是补厚执行闭环。"
    elif scores["omnipotence"] >= 60:
        conclusion = f"你是 {profile['title']}，优势明确但仍偏专精；要冲更高阶，需要补强脚本、样例和去重后的真实深度。"
    else:
        conclusion = f"你当前是 {profile['title']}，可用基础已经出现，但还需要更多可验证、可执行的 skill 形成稳定能力面。"
    if tone == "full-chuunibyou":
        conclusion = f"{conclusion} 当前判定仍以本地 SKILL.md 元数据为准，称号可以燃，证据不能飘。"
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "routes": routes,
        "conclusion": conclusion,
    }


def image_brief(report: dict[str, Any], *, tone: str = "dramatic", language: str = "zh") -> str:
    if report["profile"]["total_skills"] == 0:
        roots = "、".join(report.get("attempted_roots", [])) or "未记录"
        if language == "en":
            roots = ", ".join(report.get("attempted_roots", [])) or "not recorded"
            return f"No readable SKILL.md files were found, so no share-card image brief can be generated. Attempted roots: {roots}."
        return f"未发现可读的 SKILL.md，无法生成战力卡图片 brief。尝试扫描的根目录：{roots}。"
    profile = report["profile"]
    scores = profile["scores"]
    narrative = narrative_sections(report, tone=tone, language=language)
    subject = visual_subject(profile, language=language)
    title = localized_title(profile, language)
    rank_label = localized_rank_label(profile, language)
    domains = [(domain_label(d, language), c) for d, c in profile["domain_counts"].items() if d != "misc"][:10]
    examples = report.get("examples", {})
    top_domain = profile.get("top_domain", "misc")
    top_examples = examples.get(top_domain, [])[:3]
    if len(top_examples) < 3:
        for domain_examples in examples.values():
            for item in domain_examples:
                if item not in top_examples:
                    top_examples.append(item)
                if len(top_examples) >= 3:
                    break
            if len(top_examples) >= 3:
                break
    names = [item.get("name", "") for item in top_examples if item.get("name")]
    if language == "en":
        domain_line = ", ".join(f"{label} {count}" for label, count in domains)
        skill_line = ", ".join(names[:4]) or "No representative skills"
        strengths = "; ".join(narrative["strengths"])
        weaknesses = "; ".join(narrative["weaknesses"])
        routes = "; ".join(
            f"{route['title']}: {route['summary']} ({', '.join(route['items'])})"
            for route in narrative["routes"]
        )
        return "\n".join(
            [
                'Create a vertical, social-shareable skill power card image titled "Local AI Skills Omnipotence Assessment".',
                f"Visual style: dark fantasy game UI plus cyber-magic library. Make it look like a refined RPG character status card: black-gold parchment texture, ornate gold borders, divided panels, badges, skill-tree tiles, magic-circle and terminal-interface lighting. Top-left shows the title and one-line verdict; the left hero visual is {subject}; top-right is the power panel; middle is the skill tree distribution; bottom sections are Strengths / Weaknesses / Upgrade Paths / Current Conclusion.",
                "Aspect ratio 3:4 or 4:5, high resolution, clear English typography, strong hierarchy, complete but not crowded. Prioritize readable text over decoration.",
                f"Core title: {title}; rank: {profile['rank']} · {rank_label}; omnipotence score: {scores['omnipotence']}/100.",
                f"Four scores: Coverage {scores['coverage']}, Depth {scores['depth']}, Balance {scores['balance']}, Operability {scores['operability']}.",
                f"Total skills: {profile['total_skills']}; skill tree branches: {domain_line}.",
                f"Representative skill names: {skill_line}.",
                f"Strengths copy: {strengths}",
                f"Weaknesses copy: {weaknesses}",
                f"Three upgrade path cards: {routes}",
                f"Current conclusion: {narrative['conclusion']}",
                f'Layout requirements: top headline "Title: {title}"; right power panel shows {scores["omnipotence"]}/100 and a {profile["rank"]} {rank_label} badge; skill tree distribution uses 10 small cards or horizontal icon cards; Strengths and Weaknesses use two columns; Upgrade Paths use three route cards; bottom shows Current Conclusion.',
                "Visual direction: premium, sharp, dramatic but mature; dark background, blue-purple energy light, gold rank badge, clear information hierarchy, small abstract skill-tree/magic-circle/terminal-interface elements.",
                "Text must include: Title, Power Panel, Skill Tree Distribution, Strengths, Weaknesses, Upgrade Paths, Current Conclusion. Do not include long local paths, dense tiny text, or fabricated extra data.",
            ]
        )

    domain_line = "、".join(f"{label} {count}" for label, count in domains)
    skill_line = "、".join(names[:4]) or "无代表技能"
    strengths = "；".join(narrative["strengths"])
    weaknesses = "；".join(narrative["weaknesses"])
    routes = "；".join(
        f"{route['title']}：{route['summary']}（{'、'.join(route['items'])}）"
        for route in narrative["routes"]
    )
    return "\n".join(
        [
            "请生成一张适合社交传播的竖版战力卡图片，主题是“本地 AI Skills 无所不能程度鉴定”。",
            f"参考风格：暗黑奇幻游戏 UI + 赛博魔法书馆。整体像一张精致 RPG 角色状态卡：黑金羊皮纸质感、金色雕花边框、分区卡牌、徽章、技能树小卡片、魔法阵/终端界面光效。左上是封号与一句评价，左侧主视觉是{subject}；右上是战力面板；中段是技能树分布；下段是“你的强项 / 短板 / 补强路线 / 当前结论”。",
            "画面比例 3:4 或 4:5，高清，中文排版清晰，信息完整但不拥挤。请优先保证文字真实可读，而不是装饰。",
            f"核心封号：{title}；阶位：{profile['rank']} · {rank_label}；无所不能指数：{scores['omnipotence']}/100。",
            f"四维评分：覆盖 {scores['coverage']}，深度 {scores['depth']}，均衡 {scores['balance']}，可操作性 {scores['operability']}。",
            f"技能总数：{profile['total_skills']}；技能树主脉：{domain_line}。",
            f"代表术式/技能名：{skill_line}。",
            f"你的强项文案：{strengths}",
            f"短板文案：{weaknesses}",
            f"补强路线三张卡：{routes}",
            f"当前结论：{narrative['conclusion']}",
            f"版式要求：顶部大标题“封号：{title}”；右侧战力面板显示 {scores['omnipotence']}/100 和 {profile['rank']} {rank_label} 徽章；技能树分布用 10 张小卡片或横向图标卡展示；你的强项和短板用左右双栏；补强路线用三张升级路线卡；底部放当前结论。",
            "视觉方向：高级、锐利、有中二感但不幼稚；深色背景，蓝紫能量光，金色阶位徽章，清晰的信息层级，少量抽象技能树/魔法阵/终端界面元素。",
            "文字必须包含：封号、战力面板、技能树分布、你的强项、短板、补强路线、当前结论。不要出现长路径、不要出现密集小字、不要伪造额外数据。",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, default=Path.cwd())
    parser.add_argument("--root", action="append", type=Path, help="Additional or explicit root to scan.")
    parser.add_argument("--format", choices=["markdown", "json", "image-brief"], default="markdown")
    parser.add_argument(
        "--language",
        choices=["auto", "zh", "en"],
        default="auto",
        help="Output language. auto defaults to Chinese for CLI compatibility; use en for English reports and image briefs.",
    )
    parser.add_argument(
        "--provider",
        action="append",
        choices=["workspace", "cursor", "claude", "codex", "agents"],
        help="Filter default or explicit roots by provider. May be repeated.",
    )
    parser.add_argument("--tone", choices=["normal", "dramatic", "full-chuunibyou"], default="dramatic")
    parser.add_argument("--depth", choices=["brief", "standard", "deep"], default="standard")
    parser.add_argument(
        "--dedupe",
        choices=["none", "name", "package", "realpath"],
        default="none",
        help="Count installed copies by default, or dedupe before scoring.",
    )
    args = parser.parse_args()
    language = normalize_language(args.language)

    roots = filter_roots(args.root or default_roots(args.workspace), set(args.provider or []), args.workspace)
    attempted_roots = [root.expanduser() for root in roots]
    existing_roots = [root for root in attempted_roots if root.exists()]
    missing_roots = [root for root in attempted_roots if not root.exists()]
    items: list[dict[str, Any]] = []
    for root in existing_roots:
        items.extend(scan(root))
    items, duplicates_removed = dedupe_items(items, args.dedupe)
    report = build_report(
        items,
        existing_roots,
        attempted_roots,
        missing_roots,
        args.dedupe,
        duplicates_removed,
        args.provider or [],
        language,
    )

    if args.format == "json":
        print(json.dumps(report, ensure_ascii=False, indent=2))
    elif args.format == "image-brief":
        print(image_brief(report, tone=args.tone, language=language))
    else:
        print(markdown(report, tone=args.tone, depth=args.depth, language=language))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
