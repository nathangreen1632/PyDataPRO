# server/utils/skills.py
import re
import spacy
from typing import Set

# load once
_nlp = spacy.load("en_core_web_sm")

# header-capture regex
_skills_re = re.compile(
    r"" "\n"
    r"    ^\#{1,6}\s*Skills\s*$"
    r"    \r?\n"
    r"    ([\s\S]*?)"
    r"    (?=^\#{1,6}\s|\Z)"
    r"    ",
    re.VERBOSE | re.MULTILINE | re.IGNORECASE,
)

WEAK_WORDS = {
        "senior", "junior", "full", "stack", "software", "engineer", "developer",
        "account", "sector", "public", "solutions", "customer", "manager",
        "technology", "specialist", "executive", "graduate", "intern", "prompt", "citi",
        "commodities", "remote", "application", "computer", "(typescript", "houston", "austin",
        "chicago", "new york", "nyc", "boston", "san francisco", "sf", "la", "los angeles",
        "dallas", "denver", "seattle", "washington", "atlanta", "miami", "phoenix",
        "portland", "pittsburgh", "philadelphia", "baltimore", "charlotte", "raleigh",
        "nashville", "orlando", "san diego", "sacramento", "salt lake city", "st. louis",
        "minneapolis", "kansas city", "cincinnati", "columbus", "indianapolis",
        "detroit", "cleveland", "milwaukee", "tampa", "houston", "dallas", "austin",
        "san jose", "las vegas", "albuquerque", "tucson", "fresno", "long beach",
        "mesa", "scottsdale", "irvine", "santa clara", "oakland", "bakersfield",
        "anaheim", "santa ana", "riverside", "stockton", "chula vista", "irvine",
        "san bernardino", "modesto", "fontana", "moreno valley", "glendale",
        "huntington beach", "garden grove", "santa rosa", "ontario", "rancho cucamonga",
        "oxnard", "palmdale", "salinas", "pomona", "escondido", "torrance",
        "pasadena", "hayward", "fullerton", "orange", "el monte", "thousand oaks",
        "visalia", "simi valley", "concord", "roseville", "santa clara", "sunnyvale",
        "santa cruz", "san mateo", "san francisco bay area", "silicon valley"
    }

_SPLIT_RE = re.compile(r"[/,|•]")

def extract_skills_section(markdown: str) -> str:
    m = _skills_re.search(markdown)
    return m.group(1).strip() if m else ""

def extract_technical_keywords(text: str) -> Set[str]:
    doc = _nlp(text)
    raw_phrases: Set[str] = set()

    _extract_entities(doc, raw_phrases)
    _extract_noun_chunks(doc, raw_phrases)
    _extract_strong_tokens(doc, raw_phrases)

    return _dedupe_and_titlecase(raw_phrases)

def _extract_entities(doc, out: Set[str]):
    for ent in doc.ents:
        if ent.label_ in {"ORG","PRODUCT","SKILL","LANGUAGE","WORK_OF_ART"}:
            _clean_and_add(ent.text, out)

def _extract_noun_chunks(doc, out: Set[str]):
    for chunk in doc.noun_chunks:
        _clean_and_add(chunk.text, out)

def _extract_strong_tokens(doc, out: Set[str]):
    for tok in doc:
        w = tok.text.strip()
        if (
            tok.pos_ in {"PROPN","NOUN"}
            and len(w) > 2
            and not tok.is_stop
            and w.lower() not in WEAK_WORDS
        ):
            out.add(w)

def _clean_and_add(raw: str, out: Set[str]):
    for part in _SPLIT_RE.split(raw):
        p = part.strip()
        if _is_valuable(p):
            out.add(p)

def _is_valuable(phrase: str) -> bool:
    words = phrase.split()
    if len(words) == 1:
        return words[0].istitle() and words[0].lower() not in WEAK_WORDS
    return (
        1 <= len(words) <= 3
        and all(w.lower() not in WEAK_WORDS for w in words)
    )

def _dedupe_and_titlecase(raw_phrases: Set[str]) -> Set[str]:
    final: Set[str] = set()
    seen: Set[str] = set()
    for kw in sorted(raw_phrases, key=len):
        low = kw.lower()
        if not any(low in s for s in seen):
            final.add(kw.title())
            seen.add(low)
    return final
