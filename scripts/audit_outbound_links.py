#!/usr/bin/env python3
"""Audit outbound links for shanaghy.com: external <a> tags missing target="_blank".

House form is `target="_blank" rel="noopener"` — count what the tree already
uses and match the majority; never introduce a second form.

Usage:
    python3 audit_outbound_links.py [repo-path] [--fail]

Audits <repo>/web/content (source) always and <repo>/web/out (built tree)
when present. The built tree is the gate: the shared chrome adds its own
external anchors at build time, so the built tree counts MORE external
anchors than the source — a source-only sweep can pass while a built page
still ships a gap. Written in Python because macOS BSD grep lacks -P;
keep the audit scripted, never eyeballed.

Exit code: 0 always, or 1 on any gap when --fail is given (gate mode).
"""
import argparse
import collections
import pathlib
import re
import sys

TAG = re.compile(r"<a\b[^>]*>", re.I)
HREF_EXT = re.compile(r'href="https?://', re.I)


def audit(root: pathlib.Path):
    gaps = collections.Counter()
    ok = total = 0
    detail = []
    for page in sorted(root.rglob("*.html")):
        for lineno, line in enumerate(page.read_text().splitlines(), 1):
            for match in TAG.finditer(line):
                tag = match.group(0)
                if not HREF_EXT.search(tag):
                    continue
                total += 1
                if 'target="_blank"' in tag.lower():
                    ok += 1
                else:
                    rel = str(page.relative_to(root))
                    gaps[rel] += 1
                    detail.append((rel, lineno, tag[:160]))
    return total, ok, gaps, detail


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "repo",
        nargs="?",
        default="~/src/github.com/declanshanaghy/shanaghy.com",
        help="repo checkout (default: the canonical local path)",
    )
    parser.add_argument("--fail", action="store_true", help="exit 1 on any gap (gate mode)")
    args = parser.parse_args()
    repo = pathlib.Path(args.repo).expanduser()

    rc = 0
    for sub, label in (("web/content", "SOURCE"), ("web/out", "BUILT")):
        root = repo / sub
        if not root.is_dir():
            print(f"{label}: {root} not found — skipped")
            continue
        total, ok, gaps, detail = audit(root)
        print(f"{label} {sub}: external anchors {total}, compliant {ok}, GAPS {total - ok}")
        for fname, count in sorted(gaps.items()):
            print(f"  {fname}: {count} gap(s)")
        for row in detail[:40]:
            print("   ", row)
        if gaps and args.fail:
            rc = 1
    sys.exit(rc)


if __name__ == "__main__":
    main()
