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
    title = "全栈炼金术士" if omnipotence >= 82 and len(known_domains) >= 7 else TITLES.get(top_domain, "异能收藏家")

    return {
        "total_skills": total,
        "domain_counts": dict(domain_counts.most_common()),
        "top_domain": top_domain,
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


def build_report(items: list[dict[str, Any]], roots: list[Path]) -> dict[str, Any]:
    profile = score(items)
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
        "scanned_roots": [str(root) for root in roots],
        "profile": profile,
        "examples": dict(examples),
        "skills": items,
    }


def markdown(report: dict[str, Any]) -> str:
    profile = report["profile"]
    scores = profile["scores"]
    narrative = narrative_sections(report)
    lines = [
        f"**封号**: {profile['title']} ({profile['rank']} · {profile['rank_label']})",
        "",
        f"**战力面板**: 无所不能指数 {scores['omnipotence']}/100；覆盖 {scores['coverage']}，深度 {scores['depth']}，均衡 {scores['balance']}，可操作性 {scores['operability']}。",
        "",
        "**技能树分布**:",
    ]
    for domain, count in profile["domain_counts"].items():
        lines.append(f"- {domain}: {count}")
    lines.extend(["", "**代表技能**:"])
    for domain, examples in report["examples"].items():
        names = ", ".join(f"{item['name']} ({item['path']})" for item in examples[:3])
        lines.append(f"- {domain}: {names}")
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
    return "\n".join(lines)


def sample_names(examples: dict[str, list[dict[str, str]]], domain: str, limit: int = 3) -> list[str]:
    return [item.get("name", "") for item in examples.get(domain, [])[:limit] if item.get("name")]


def narrative_sections(report: dict[str, Any]) -> dict[str, Any]:
    profile = report["profile"]
    scores = profile["scores"]
    examples = report.get("examples", {})
    counts = profile["domain_counts"]
    docs = sample_names(examples, "docs-writing")
    research = sample_names(examples, "research-analysis")
    frontend = sample_names(examples, "frontend")
    product = sample_names(examples, "business-product")
    video_count = counts.get("video", 0)

    strengths = [
        f"你不是单点爆发型，而是多系法术书持有者；文档/报告与研究分析各有 {counts.get('docs-writing', 0)} / {counts.get('research-analysis', 0)} 个技能支撑。",
        f"{'、'.join((docs + research)[:4]) or '核心文档与研究技能'} 等技能让你的文档、报告、诊断、评审能力很强。",
        f"{'、'.join((frontend + product)[:4]) or '前端与产品技能'} 补齐了界面、产品、规划与组织级交付能力。",
    ]

    weaknesses = [
        f"主要卡在可操作性：当前可操作性 {scores['operability']}/100，很多 skill 更偏说明/流程型，带 scripts/、references/、assets/ 的比例还不够高。",
        f"视频剪辑线较薄，目前 video 相关仅 {video_count} 个，还不足以稳定封为剪辑大师。",
    ]
    if scores["depth"] < 60:
        weaknesses.append(f"深度为 {scores['depth']}/100，说明覆盖很广，但多个领域还需要更厚的脚本、样例和任务闭环。")

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

    conclusion = f"你是 {profile['title']}，兼具情报占星师副职业；离全域支配者不远，但需要更多真正能落地执行的技能器具。"
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "routes": routes,
        "conclusion": conclusion,
    }


def image_brief(report: dict[str, Any]) -> str:
    profile = report["profile"]
    scores = profile["scores"]
    narrative = narrative_sections(report)
    domains = [(DOMAIN_LABELS.get(d, d), c) for d, c in profile["domain_counts"].items() if d != "misc"][:10]
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
            "参考风格：暗黑奇幻游戏 UI + 赛博魔法书馆。整体像一张精致 RPG 角色状态卡：黑金羊皮纸质感、金色雕花边框、分区卡牌、徽章、技能树小卡片、魔法阵/终端界面光效。左上是封号与一句评价，左侧可以有“文档贤者/法师在书馆中翻开技能书”的插画感视觉；右上是战力面板；中段是技能树分布；下段是“你的强项 / 短板 / 补强路线 / 当前结论”。",
            "画面比例 3:4 或 4:5，高清，中文排版清晰，信息完整但不拥挤。请优先保证文字真实可读，而不是装饰。",
            f"核心封号：{profile['title']}；阶位：{profile['rank']} · {profile['rank_label']}；无所不能指数：{scores['omnipotence']}/100。",
            f"四维评分：覆盖 {scores['coverage']}，深度 {scores['depth']}，均衡 {scores['balance']}，可操作性 {scores['operability']}。",
            f"技能总数：{profile['total_skills']}；技能树主脉：{domain_line}。",
            f"代表术式/技能名：{skill_line}。",
            f"你的强项文案：{strengths}",
            f"短板文案：{weaknesses}",
            f"补强路线三张卡：{routes}",
            f"当前结论：{narrative['conclusion']}",
            f"版式要求：顶部大标题“封号：{profile['title']}”；右侧战力面板显示 {scores['omnipotence']}/100 和 {profile['rank']} {profile['rank_label']} 徽章；技能树分布用 10 张小卡片或横向图标卡展示；你的强项和短板用左右双栏；补强路线用三张升级路线卡；底部放当前结论。",
            "视觉方向：高级、锐利、有中二感但不幼稚；深色背景，蓝紫能量光，金色阶位徽章，清晰的信息层级，少量抽象技能树/魔法阵/终端界面元素。",
            "文字必须包含：封号、战力面板、技能树分布、你的强项、短板、补强路线、当前结论。不要出现长路径、不要出现密集小字、不要伪造额外数据。",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, default=Path.cwd())
    parser.add_argument("--root", action="append", type=Path, help="Additional or explicit root to scan.")
    parser.add_argument("--format", choices=["markdown", "json", "image-brief"], default="markdown")
    args = parser.parse_args()

    roots = args.root or default_roots(args.workspace)
    existing_roots = [root.expanduser() for root in roots if root.expanduser().exists()]
    items: list[dict[str, Any]] = []
    for root in existing_roots:
        items.extend(scan(root))
    report = build_report(items, existing_roots)

    if args.format == "json":
        print(json.dumps(report, ensure_ascii=False, indent=2))
    elif args.format == "image-brief":
        print(image_brief(report))
    else:
        print(markdown(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
