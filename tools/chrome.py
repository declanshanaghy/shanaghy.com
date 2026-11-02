#!/usr/bin/env python3
"""tools/chrome.py — canonical chrome for every page of the garden.

One source of truth for header, footer, and nav. Stamps all pages
idempotently; `--check` fails with a diff list if any page has drifted.

Usage:
  python3 tools/chrome.py --check     # verify consistency (CI gate)
  python3 tools/chrome.py             # stamp canonical chrome sitewide
"""
import re, sys, glob, os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAV = [("Forge", ""), ("Stones", "projects/"), ("Films", "videos/"),
       ("Sessions", "sessions/"), ("Creed", "creed/"),
       ("Fleet", "fleet/"), ("Paths", "paths/")]
LOGO = "assets/icons/forge-logo.png"
GH = "https://github.com/declanshanaghy"
MOTTO = "an amalgamation of many spores"

def _pre(depth):
    return "../" * depth if depth else "./"

def header(depth, cur_dir):
    pre = _pre(depth)
    links = "\n    ".join(
        '<a class="tlink%s" href="%s%s">%s</a>'
        % (' here' if d == cur_dir else '', pre, d, label)
        for label, d in NAV)
    return ('<nav class="topbar" aria-label="The forge of FiremanDecko">\n'
            '  <a class="brand" href="%s">'
            '<img class="brand-logo" src="%s%s" alt="The Forge of FiremanDecko" '
            'width="160" height="40" loading="lazy"></a>\n'
            '  <div class="toplinks">\n    %s\n  </div>\n</nav>'
            % (pre, pre, LOGO, links))

def footer(depth):
    pre = _pre(depth)
    cols = "\n    ".join('<a class="foot-tlink" href="%s%s">the %s</a>'
                         % (pre, d, label.lower()) for label, d in NAV)
    return ('<footer class="foot">\n'
            '  <p class="foot-line">The garden grows from Athlone, Co. Westmeath, '
            'with roots in Ballyhaunis, Co. Mayo.</p>\n'
            '  <a class="foot-gh" href="%s" target="_blank" rel="noopener">'
            'github.com/declanshanaghy</a>\n'
            '  <p class="foot-colophon">\n    %s\n  </p>\n'
            '  <p class="foot-copy">© Declan Shanaghy · %s · 🍀</p>\n</footer>'
            % (GH, cols, MOTTO))

def pages():
    return [f for f in glob.glob(os.path.join(REPO, "**", "*.html"), recursive=True)
            if "/.git/" not in f and "/web/" not in f and "_TEMPLATE" not in f]

def check():
    bad = 0
    for f in pages():
        rel = os.path.relpath(f, REPO)
        depth = rel.count("/")
        cur = rel.rsplit("/", 1)[0] + "/" if "/" in rel else ""
        s = open(f, encoding="utf-8").read()
        if header(depth, cur) not in s:
            print("HEADER DRIFT:", rel); bad += 1
        if footer(depth) not in s:
            print("FOOTER DRIFT:", rel); bad += 1
    print("%s: %d pages checked, %d drifted" % ("FAIL" if bad else "OK", len(pages()), bad))
    return bad

def stamp():
    for f in pages():
        rel = os.path.relpath(f, REPO)
        depth = rel.count("/")
        cur = rel.rsplit("/", 1)[0] + "/" if "/" in rel else ""
        s = open(f, encoding="utf-8").read()
        h, ftr = header(depth, cur), footer(depth)
        if h in s and ftr in s:
            continue
        m = re.search(r'<nav class="topbar"[^>]*>.*?</nav>', s, re.S)
        if m: s = s[:m.start()] + h + s[m.end():]
        else:
            mb = re.search(r'<body[^>]*>', s); s = s[:mb.end()] + "\n" + h + s[mb.end():]
        mf = re.search(r'<footer[^>]*>.*?</footer>', s, re.S)
        if mf: s = s[:mf.start()] + ftr + s[mf.end():]
        else: s = s.replace("</body>", ftr + "\n</body>", 1)
        open(f, "w", encoding="utf-8").write(s)
        print("stamped:", rel)
    return check()

if __name__ == "__main__":
    sys.exit(check() if "--check" in sys.argv else stamp())