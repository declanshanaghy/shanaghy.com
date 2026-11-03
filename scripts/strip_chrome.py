#!/usr/bin/env python3
"""Strip per-page chrome blocks from web/content/*.css files.

The canonical chrome is now imported globally in _app.js from web/styles/garden.css.
Per-page chrome blocks are redundant and will override the canonical.

Three chrome-block patterns:
  1. /* ============ TOPBAR — RUNE TAB STRIP ============ */  (old gen)
  2. /* canonical chrome — shared by generated pages (tools/chrome.py) */  (new gen profiles)
  3. /* ---- topbar (same rune-tab strip as the garden) ---- */  (project/session pages)

Two footer-block patterns:
  4. /* ============ FOOTER ============ */  (old gen)
  5. /* ---- footer ---- */  (project/session pages)

Also removes: @media (max-width:920px){.tlink{display:none}}
Also removes: stray tail brand/tlink chrome class rule blocks
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
CONTENT_DIR = REPO_ROOT / "web" / "content"

# Chrome selectors that belong exclusively to the global chrome (Header.js / Footer.js)
# These are safe to remove from ALL content CSS files.
CHROME_SELECTORS = [
    r'\.topbar',
    r'\.toplinks',
    r'\.tlink(?:\.here)?',
    r'\.tlink:hover',
    r'\.tlink:hover,\.tlink:focus',
    r'\.tlink\.here',
    r'\.ghpill',
    r'\.ghpill:hover',
    r'\.ghpill:hover,\.ghpill:focus',
    r'\.brand(?!-)',         # .brand{ but not .brand-*
    r'\.brand::before',
    r'\.brand::after',
    r'\.brand-logo',
    r'\.brand-logo:hover',
    r'\.brand-mark',
    r'\.brand-name',
    # footer chrome
    r'\.foot(?!-)',          # .foot{ but not .foot-*
    r'\.foot-line',
    r'\.foot-gh',
    r'\.foot-gh:hover',
    r'\.foot-colophon',
    r'\.foot-tlink',
    r'\.foot-tlink:hover',
    r'\.foot-copy',
    r'\.foot-knot',
]


def remove_section(text: str, start_pattern: str, end_patterns: list[str]) -> str:
    """Remove a section from start_pattern (inclusive) to end_patterns[n] (exclusive)."""
    start_idx = text.find(start_pattern)
    if start_idx == -1:
        return text

    after_start = text[start_idx + len(start_pattern):]
    end_idx_in_after = None
    for ep in end_patterns:
        idx = after_start.find(ep)
        if idx != -1:
            if end_idx_in_after is None or idx < end_idx_in_after:
                end_idx_in_after = idx

    if end_idx_in_after is None:
        return text[:start_idx].rstrip() + "\n"

    end_idx = start_idx + len(start_pattern) + end_idx_in_after
    removed = text[:start_idx] + text[end_idx:]
    removed = re.sub(r'\n{3,}', '\n\n', removed)
    return removed


def remove_canonical_chrome_block(text: str) -> str:
    """Remove the /* canonical chrome */ section through .foot-copy{...}."""
    marker = "/* canonical chrome — shared by generated pages (tools/chrome.py) */"
    start = text.find(marker)
    if start == -1:
        return text

    after = text[start:]

    # Chrome ends after .foot-copy{...} line
    m = re.search(r'\.foot-copy\{[^\n]*\}\n', after)
    if m:
        end_in_after = m.end()
        result = text[:start] + text[start + end_in_after:]
        return re.sub(r'\n{3,}', '\n\n', result)

    return text


def remove_stray_chrome_rules(text: str) -> tuple[str, int]:
    """Remove any remaining chrome selector rule blocks from the text.

    Returns (modified_text, count_removed).
    Uses regex to find {selector}{...} blocks and strips them.
    """
    count = 0

    # Build a pattern that matches a full CSS rule block for any chrome selector.
    # Handles both single-line and multi-line rules (non-nested).
    for sel in CHROME_SELECTORS:
        # Match: optional-newline + selector + optional-whitespace + { + content + }
        # The selector may have arbitrary comma-separated variants before it on the same line.
        # We use a simple approach: match the selector at the start of a line (possibly with leading whitespace),
        # then capture the entire rule block.
        pattern = re.compile(
            r'(?:^|\n)[ \t]*' + sel + r'(?:[^{]*)\{[^}]*\}[ \t]*(?=\n|$)',
            re.MULTILINE
        )
        new_text, n = pattern.subn('', text)
        if n > 0:
            text = new_text
            count += n

    # Collapse multiple blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text, count


def deduplicate_persona(text: str) -> str:
    """Keep only the first occurrence of a.persona rules."""
    # Find first occurrence
    first = text.find('a.persona{')
    if first == -1:
        return text
    # Find second occurrence
    second = text.find('a.persona{', first + 1)
    if second == -1:
        return text

    # Remove all occurrences from second onwards
    result = text[:second]
    tail = text[second:]
    # Remove all a.persona{...} and a.persona:hover{...} blocks
    tail = re.sub(r'a\.persona(?::hover)?\{[^}]*\}\n?', '', tail)
    text = result + tail
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text


def strip_chrome(path: Path) -> tuple[bool, str]:
    """Strip chrome blocks from a single CSS file."""
    original = path.read_text(encoding='utf-8')
    text = original
    actions = []

    # 1. Remove old gen TOPBAR section (old gen header with sticky nav)
    if '/* ============ TOPBAR — RUNE TAB STRIP ============ */' in text:
        text = remove_section(
            text,
            '/* ============ TOPBAR — RUNE TAB STRIP ============ */',
            ['/* ===', '/* —']
        )
        actions.append('removed TOPBAR block')

    # 2. Remove old gen FOOTER section
    if '/* ============ FOOTER ============ */' in text:
        text = remove_section(
            text,
            '/* ============ FOOTER ============ */',
            ['/* ===']
        )
        actions.append('removed FOOTER block')

    # 3. Remove canonical chrome block (new gen profiles)
    if '/* canonical chrome — shared by generated pages (tools/chrome.py) */' in text:
        text = remove_canonical_chrome_block(text)
        actions.append('removed canonical chrome block')

    # 4. Remove project/session topbar section
    if '/* ---- topbar (same rune-tab strip as the garden) ---- */' in text:
        text = remove_section(
            text,
            '/* ---- topbar (same rune-tab strip as the garden) ---- */',
            ['/* ----']
        )
        actions.append('removed project topbar block')

    # 5. Remove project/session footer section
    if '/* ---- footer ---- */' in text:
        text = remove_section(
            text,
            '/* ---- footer ---- */',
            ['/* ----', '@media']
        )
        actions.append('removed project footer block')

    # 6. Remove old gen stale responsive tlink rule (single-line form)
    if '@media (max-width:920px){.tlink{display:none}}' in text:
        text = text.replace('@media (max-width:920px){.tlink{display:none}}\n', '')
        text = text.replace('@media (max-width:920px){.tlink{display:none}}', '')
        actions.append('removed stale tlink media query')

    # 7. Remove any remaining stray chrome class rules (tail duplicates)
    text, n = remove_stray_chrome_rules(text)
    if n > 0:
        actions.append(f'removed {n} stray chrome rules')

    # 8. Deduplicate a.persona (keep first copy only)
    new_text = deduplicate_persona(text)
    if new_text != text:
        text = new_text
        actions.append('deduplicated a.persona')

    # Normalize trailing newlines
    text = text.rstrip('\n') + '\n'

    if text == original:
        return False, 'no change'

    path.write_text(text, encoding='utf-8')
    return True, ', '.join(actions)


def main():
    css_files = sorted(CONTENT_DIR.rglob('*.css'))
    changed = 0
    unchanged = 0

    for f in css_files:
        ok, desc = strip_chrome(f)
        rel = f.relative_to(REPO_ROOT)
        if ok:
            changed += 1
            print(f"  CHANGED  {rel}: {desc}")
        else:
            unchanged += 1
            if '--verbose' in sys.argv:
                print(f"  unchanged {rel}")

    print(f"\nDone: {changed} changed, {unchanged} unchanged out of {len(css_files)} files")


if __name__ == '__main__':
    main()
