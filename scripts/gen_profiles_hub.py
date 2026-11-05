#!/usr/bin/env python3
"""gen_profiles_hub.py — regenerate the soul roll of web/content/profiles.html.

Walks web/content/profiles/*.html (the source of truth — the same tree the
[slug] route derives its paths from) and rewrites the cards between the
profiles-cards markers: one moss-capped soul card per profile, portrait/name/
epithet lifted verbatim from each soul's own page. Also rewrites the roll
count. Run after minting or renaming any profile:

  python3 scripts/gen_profiles_hub.py

Idempotent: re-runs replace only what sits between the markers.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PROFILES = os.path.join(ROOT, "web", "content", "profiles")
PAGE = os.path.join(ROOT, "web", "content", "profiles.html")

CARDS_START = "<!-- profiles-cards:start -->"
CARDS_END = "<!-- profiles-cards:end -->"


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).strip()


def parse_soul(slug):
    src = open(os.path.join(PROFILES, slug + ".html"), encoding="utf-8").read()
    name = re.search(r'<h1 class="profile-name">([\s\S]*?)</h1>', src)
    epithet = re.search(r'<p class="profile-epithet">([\s\S]*?)</p>', src)
    portrait = re.search(r'<img class="profile-portrait" src="([^"]+)" alt="([^"]*)"', src)
    return {
        "name": strip_tags(name.group(1)) if name else slug,
        "epithet": strip_tags(epithet.group(1)) if epithet else "",
        "src": portrait.group(1) if portrait else None,
        "alt": portrait.group(2) if portrait else "",
    }


def main():
    slugs = sorted(
        f[:-5] for f in os.listdir(PROFILES) if f.endswith(".html")
    )
    cards = []
    for slug in slugs:
        s = parse_soul(slug)
        img = (
            '      <img class="soul-portrait" src="%s" alt="%s" width="84" height="84" loading="lazy">\n'
            % (s["src"], s["alt"])
            if s["src"]
            else ""
        )
        epithet = ('      <p class="soul-epithet">%s</p>\n' % s["epithet"]) if s["epithet"] else ""
        cards.append(
            '    <article class="soul">\n'
            '      <a class="soul-link" href="/profiles/%s/" aria-label="%s"></a>\n'
            "%s"
            '      <h3><a href="/profiles/%s/">%s</a></h3>\n'
            "%s"
            "    </article>" % (slug, s["name"], img, slug, s["name"], epithet)
        )
    block = CARDS_START + "\n" + "\n\n".join(cards) + "\n" + CARDS_END

    page = open(PAGE, encoding="utf-8").read()
    page = re.sub(
        re.escape(CARDS_START) + r"[\s\S]*?" + re.escape(CARDS_END),
        lambda m: block,
        page,
    )
    page = re.sub(
        r'(<span class="roll-count">)[^<]*(</span>)',
        lambda m: m.group(1) + "%d souls" % len(slugs) + m.group(2),
        page,
    )
    open(PAGE, "w", encoding="utf-8").write(page)
    noimg = [s for s in slugs if not parse_soul(s)["src"]]
    print("[ok] profiles.html: %d souls rolled -> %s" % (len(slugs), PAGE))
    if noimg:
        print("[note] souls without portraits:", ", ".join(noimg))


if __name__ == "__main__":
    main()
