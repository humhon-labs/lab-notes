#!/usr/bin/env python3
"""data/posts.js 데이터 모델 검증 (KO/EN 다국어 모델).

용도 두 가지:
1. PostToolUse 훅: stdin의 훅 입력 JSON에서 file_path를 읽어
   data/posts.js 또는 content/*.md 변경일 때만 검증한다.
2. 수동 실행: `python3 scripts/validate-posts.py --all`

검증 항목:
- category는 정확히 4종 중 하나 (중간점 U+00B7 '·')
- date는 YYYY-MM-DD 형식의 유효한 날짜
- title/summary는 {ko,en} 객체(ko 필수, en 선택) 또는 문자열(하위호환)
- slug ↔ content/<slug>.ko.md 필수 대응 (영어본 <slug>.en.md 는 선택)
- content/*.md 는 <slug>.ko.md / <slug>.en.md 형식이며 slug가 posts에 존재
- 필수 필드(slug, title, category, tags, date, summary) 존재
- posts 배열이 date 내림차순 정렬

실패 시 exit 2 + stderr 메시지 (훅에서 Claude에게 피드백됨).
"""
import datetime
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_JS = ROOT / "data" / "posts.js"
CONTENT_DIR = ROOT / "content"

VALID_CATEGORIES = {"AI·Data", "Backend·Infra", "Product·Ops", "PM"}
REQUIRED_FIELDS = ("slug", "title", "category", "tags", "date", "summary")

# 1단계 중첩(title/summary의 {ko,en})을 허용해 글 객체를 통째로 잡는다.
POST_OBJECT_RE = r"\{(?:[^{}]|\{[^{}]*\})*\}"


def should_run_from_hook_input():
    """훅 stdin 입력을 읽어 관련 파일 변경인지 판단한다."""
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return False
    path = data.get("tool_input", {}).get("file_path", "") or ""
    return path.endswith("data/posts.js") or (
        "/content/" in path and path.endswith(".md")
    )


def parse_posts(src):
    """posts.js에서 글 객체들을 추출한다.

    title/summary는 {ko,en} 객체 또는 문자열을 모두 지원한다.
    객체면 값을 'OBJ'로 두고 <field>_langs 에 {'ko': bool, 'en': bool} 을,
    문자열이면 그 값과 <field>_langs=None 을 채운다.
    """
    posts = []
    for block in re.findall(POST_OBJECT_RE, src):
        if not re.search(r"\bslug\s*:", block):
            continue
        post = {}
        for key in ("slug", "category", "date"):
            m = re.search(r"\b%s\s*:\s*'([^']*)'" % key, block)
            if m:
                post[key] = m.group(1)
        m = re.search(r"\btags\s*:\s*(\[[^\]]*\])", block)
        if m:
            post["tags"] = m.group(1)
        for key in ("title", "summary"):
            mo = re.search(r"\b%s\s*:\s*(\{[^{}]*\})" % key, block)
            if mo:
                inner = mo.group(1)
                post[key] = "OBJ"
                post[key + "_langs"] = {
                    "ko": bool(re.search(r"\bko\s*:", inner)),
                    "en": bool(re.search(r"\ben\s*:", inner)),
                }
            else:
                ms = re.search(r"\b%s\s*:\s*'([^']*)'" % key, block)
                if ms:
                    post[key] = ms.group(1)
                    post[key + "_langs"] = None
        m = re.search(r"\bsource\s*:\s*'([^']*)'", block)
        if m:
            post["source"] = m.group(1)
        posts.append(post)
    return posts


def validate():
    errors = []
    src = POSTS_JS.read_text(encoding="utf-8")
    posts = parse_posts(src)

    if not posts:
        errors.append("data/posts.js에서 글 객체를 하나도 찾지 못했습니다.")

    slugs = []
    dates = []
    for i, p in enumerate(posts):
        label = p.get("slug") or f"#{i + 1}번째 항목"

        for field in REQUIRED_FIELDS:
            if field not in p or p[field] == "":
                errors.append(f"[{label}] 필수 필드 누락: {field}")

        # title/summary가 {ko,en} 객체면 ko 필수, en은 선택
        for key in ("title", "summary"):
            langs = p.get(key + "_langs")
            if langs is not None and not langs.get("ko"):
                errors.append(f"[{label}] {key}.ko 누락 — ko는 필수입니다.")

        cat = p.get("category")
        if cat and cat not in VALID_CATEGORIES:
            errors.append(
                f"[{label}] 잘못된 category: '{cat}' — "
                "AI·Data / Backend·Infra / Product·Ops / PM 중 하나여야 하며 "
                "중간점은 U+00B7 '·' 를 사용해야 합니다."
            )

        date = p.get("date", "")
        if date:
            try:
                datetime.date.fromisoformat(date)
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                    raise ValueError
                dates.append(date)
            except ValueError:
                errors.append(f"[{label}] 잘못된 date: '{date}' (YYYY-MM-DD 필요)")

        slug = p.get("slug")
        if slug:
            slugs.append(slug)
            if not (CONTENT_DIR / f"{slug}.ko.md").exists():
                errors.append(f"[{label}] content/{slug}.ko.md 파일이 없습니다 (ko 필수).")

    dup = {s for s in slugs if slugs.count(s) > 1}
    if dup:
        errors.append(f"slug 중복: {', '.join(sorted(dup))}")

    for md in sorted(CONTENT_DIR.glob("*.md")):
        stem = md.name[:-3]  # ".md" 제거 → "loop-engineering.ko"
        m = re.match(r"^(.+)\.(ko|en)$", stem)
        if not m:
            errors.append(
                f"content/{md.name} 이름이 <slug>.ko.md / <slug>.en.md 형식이 아닙니다."
            )
            continue
        base = m.group(1)
        if base not in slugs:
            errors.append(f"content/{md.name} 에 대응하는 posts.js 항목이 없습니다.")

    if dates != sorted(dates, reverse=True):
        errors.append("posts 배열이 date 내림차순이 아닙니다.")

    return errors


def main():
    if "--all" not in sys.argv and not should_run_from_hook_input():
        sys.exit(0)

    errors = validate()
    if errors:
        print("posts 데이터 검증 실패:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(2)

    print("posts 데이터 검증 통과")
    sys.exit(0)


if __name__ == "__main__":
    main()
