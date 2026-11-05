#!/usr/bin/env python3
"""gen_feed.py — generate web/public/feed.xml (Atom) from the sessions content tree.

Walks web/content/sessions/**/index.html, reads each ballad-card article
(b-date, h3 title, excerpt, stone-link href), and emits a valid Atom 1.0 feed.
Only top-level index.html at the sessions root is skipped (it's the index,
not a session). Session bed index.html files (one level deep) are also skipped
— only session leaf index.html files (two levels deep: bed/session/index.html)
become feed entries.

Run:  python3 scripts/gen_feed.py   (from anywhere — paths resolve from __file__)
"""
import html as html_module
import os
import re
from datetime import datetime, timezone

BASE = "https://www.shanaghy.com"
FEED_TITLE = "The Ballads — Shanaghy"
FEED_SUBTITLE = "Notes from the runemaster's forge-floor — the ballads between the stones."
FEED_AUTHOR = "FiremanDecko"
FEED_ID = f"{BASE}/feed.xml"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WEB = os.path.join(ROOT, "web")
CONTENT = os.path.join(WEB, "content")
PUBLIC = os.path.join(WEB, "public")


def strip_tags(text):
    return re.sub(r"<[^>]+>", "", text).strip()


def parse_date(date_str):
    """Parse YYYY-MM-DD into an RFC 3339 datetime string (UTC)."""
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return dt.strftime("%Y-%m-%dT00:00:00Z")
    except ValueError:
        return None


def extract_entries_from_sessions_index(html_text):
    """Extract ballad-card articles from the sessions index (web/content/sessions/index.html)."""
    entries = []
    # Match each ballad-card article block
    article_re = re.compile(
        r'<article\s+class="ballad-card[^"]*"[^>]*>(.*?)</article>',
        re.DOTALL,
    )
    for m in article_re.finditer(html_text):
        body = m.group(1)

        # stone-link href → the canonical URL path
        link_m = re.search(r'<a\s+class="stone-link"\s+href="([^"]+)"', body)
        if not link_m:
            continue
        path = link_m.group(1)

        # b-date
        date_m = re.search(r'<span\s+class="b-date">([^<]+)</span>', body)
        date_str = date_m.group(1).strip() if date_m else ""

        # h3 title
        title_m = re.search(r"<h3>(.+?)</h3>", body, re.DOTALL)
        title = strip_tags(title_m.group(1)) if title_m else ""

        # excerpt (first <p class="b-excerpt">)
        excerpt_m = re.search(r'<p\s+class="b-excerpt">(.*?)</p>', body, re.DOTALL)
        excerpt = strip_tags(excerpt_m.group(1)) if excerpt_m else ""

        rfc_date = parse_date(date_str)
        if not (path and title and rfc_date):
            continue

        entries.append(
            {
                "url": BASE + path,
                "title": title,
                "date": rfc_date,
                "date_raw": date_str.strip(),
                "excerpt": excerpt,
            }
        )
    # already newest-first in the HTML; keep that order
    return entries


def build_atom(entries, updated):
    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append('<feed xmlns="http://www.w3.org/2005/Atom">')
    lines.append(f"  <title>{html_module.escape(FEED_TITLE)}</title>")
    lines.append(f"  <subtitle>{html_module.escape(FEED_SUBTITLE)}</subtitle>")
    lines.append(f'  <link href="{BASE}/feed.xml" rel="self" type="application/atom+xml"/>')
    lines.append(f'  <link href="{BASE}/sessions/" rel="alternate" type="text/html"/>')
    lines.append(f"  <updated>{updated}</updated>")
    lines.append(f"  <id>{html_module.escape(FEED_ID)}</id>")
    lines.append(f"  <author><name>{html_module.escape(FEED_AUTHOR)}</name></author>")
    for e in entries:
        entry_id = html_module.escape(e["url"])
        lines.append("  <entry>")
        lines.append(f"    <id>{entry_id}</id>")
        lines.append(f"    <title>{html_module.escape(e['title'])}</title>")
        lines.append(f'    <link href="{e["url"]}" rel="alternate" type="text/html"/>')
        lines.append(f"    <updated>{e['date']}</updated>")
        lines.append(f"    <published>{e['date']}</published>")
        if e["excerpt"]:
            lines.append(f"    <summary>{html_module.escape(e['excerpt'])}</summary>")
        lines.append("  </entry>")
    lines.append("</feed>")
    return "\n".join(lines) + "\n"


def main():
    sessions_index = os.path.join(CONTENT, "sessions", "index.html")
    with open(sessions_index, encoding="utf-8") as fh:
        html_text = fh.read()

    entries = extract_entries_from_sessions_index(html_text)
    if not entries:
        print("[warn] no ballad entries found — feed.xml will be empty")
        updated = datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT00:00:00Z")
    else:
        updated = entries[0]["date"]  # newest first

    atom = build_atom(entries, updated)

    os.makedirs(PUBLIC, exist_ok=True)
    feed_path = os.path.join(PUBLIC, "feed.xml")
    with open(feed_path, "w", encoding="utf-8") as fh:
        fh.write(atom)

    print(f"[ok] feed.xml: {len(entries)} entries -> {feed_path}")
    print(f"[ok] updated: {updated}")


if __name__ == "__main__":
    main()
