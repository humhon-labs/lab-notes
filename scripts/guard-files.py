#!/usr/bin/env python3
"""PreToolUse 훅: CLAUDE.md 규칙상 수정 금지인 파일의 Edit/Write를 차단한다.

- assets/marked.min.js  : 벤더링된 라이브러리, 직접 수정 금지
- package.json 등       : 빌드 단계/번들러 도입 금지
stdin으로 훅 입력 JSON을 받고, 차단 시 exit 2 + stderr 메시지.
"""
import json
import os
import sys

BANNED_BASENAMES = {
    "marked.min.js",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "tsconfig.json",
}
BANNED_SUBSTRINGS = ("vite.config", "webpack.config", "rollup.config", "babel.config")


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    path = data.get("tool_input", {}).get("file_path", "") or ""
    base = os.path.basename(path)

    if base in BANNED_BASENAMES or any(s in base for s in BANNED_SUBSTRINGS):
        print(
            f"차단: '{base}' 은(는) 이 저장소에서 수정/생성 금지입니다. "
            "(CLAUDE.md 규칙 — 벤더링 파일 직접 수정 금지, 빌드 단계/번들러 도입 금지)",
            file=sys.stderr,
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
