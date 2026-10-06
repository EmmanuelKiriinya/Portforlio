"""Sanitize rich text coming out of the admin editor.

The editor is trusted-ish (only the owner can reach it), but stored HTML is
rendered into every visitor's page, so it is cleaned on write. Anything the
editor can produce is on the allowlist; anything else is dropped.
"""

import nh3

ALLOWED_TAGS = {
    "p", "br", "hr", "strong", "em", "u", "s", "del", "mark", "sub", "sup",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
}

ALLOWED_ATTRIBUTES = {
    # No "rel" here: link_rel below sets it, and nh3 rejects doing both.
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title", "width", "height", "loading"},
    "code": {"class"},          # language-python, language-sql …
    "pre": {"class"},
    "div": {"class", "data-type", "data-language"},
    "span": {"class"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan", "scope"},
    "li": {"data-checked"},     # task lists
    "figure": {"class"},
}


def sanitize_html(html: str | None) -> str | None:
    if not html:
        return html
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes={"http", "https", "mailto", "data"},
        link_rel="noopener noreferrer",
    )


def reading_minutes(html: str | None) -> int:
    """Estimate reading time at 220 wpm from the text content."""
    if not html:
        return 1
    text = nh3.clean(html, tags=set())
    words = len(text.split())
    return max(1, round(words / 220))
