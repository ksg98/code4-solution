"""
Legal document parsing utilities for Wisconsin statutes.
Extracts citations, cross-references, and hierarchical structure.
"""
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class StatuteCitation:
    """Represents a Wisconsin statute citation."""
    full_cite: str
    chapter: str
    section: str
    subsection: Optional[str] = None
    year: Optional[str] = None
    citation_type: str = "statute"


@dataclass
class CrossReference:
    """Represents a cross-reference to another legal provision."""
    source_location: str
    target: str  # Changed from target_citation for consistency
    reference_type: str  # "see_also", "defined_in", "pursuant_to", etc.
    context: str


# Wisconsin statute citation patterns
STATUTE_PATTERNS = [
    # Wis. Stat. § 940.01(2)(a)
    (r'Wis\.?\s*Stat\.?\s*§?\s*(\d+)\.(\d+)(?:\((\d+)\))?(?:\(([a-z]+)\))?(?:\s*\((\d{4}(?:-\d{2,4})?)\))?', 'full'),
    # § 346.63
    (r'§\s*(\d+)\.(\d+)(?:\((\d+)\))?(?:\(([a-z]+)\))?', 'short'),
    # section 940.01
    (r'[Ss]ection\s+(\d+)\.(\d+)(?:\((\d+)\))?(?:\(([a-z]+)\))?', 'narrative'),
    # ch. 940 or chapter 940
    (r'(?:[Cc]h\.|[Cc]hapter)\s+(\d+)', 'chapter_only'),
]

# Case law citation patterns (Wisconsin post-2000 format)
CASE_PATTERNS = [
    (r'(\d{4})\s+WI\s+(\d+)', 'supreme_court'),
    (r'(\d{4})\s+WI\s+App\s+(\d+)', 'court_of_appeals'),
]

# Cross-reference patterns
CROSS_REFERENCE_PATTERNS = {
    'see_also': r'see also\s+§+\s*([\d\.\(\)a-z,\s\-to]+)',
    'see': r'see\s+§+\s*([\d\.\(\)a-z]+)',
    'defined_in': r'as defined in\s+(?:(?:ch\.|chapter|§|s\.)\s*(\d+(?:\.\d+)?))',
    'pursuant_to': r'pursuant to\s+§+\s*([\d\.\(\)a-z]+)',
    'under': r'under\s+(?:§|s\.)\s*([\d\.\(\)a-z]+)',
    'subject_to': r'subject to\s+(?:§|s\.)\s*([\d\.\(\)a-z]+)',
}

# Hierarchical structure patterns
SECTION_HEADER_PATTERN = r'^(\d+\.\d+)\s+(.+?)\.?\s*$'
SUBSECTION_PATTERN = r'^\((\d+)\)\s+'
PARAGRAPH_PATTERN = r'^\(([a-z])\)\s+'
SUBPARAGRAPH_PATTERN = r'^\(([A-Z])\)\s+'


def extract_statute_citations(text: str) -> List[StatuteCitation]:
    """Extract all Wisconsin statute citations from text."""
    citations = []

    for pattern, pattern_type in STATUTE_PATTERNS:
        matches = re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE)
        for match in matches:
            if pattern_type == 'chapter_only':
                # Just a chapter reference
                chapter = match.group(1)
                citations.append(StatuteCitation(
                    full_cite=match.group(0),
                    chapter=chapter,
                    section="",
                    citation_type="chapter"
                ))
            else:
                groups = match.groups()
                chapter = groups[0]
                section = groups[1] if len(groups) > 1 else ""

                # Build subsection string
                subsection_parts = []
                if len(groups) > 2 and groups[2]:  # (1)
                    subsection_parts.append(f"({groups[2]})")
                if len(groups) > 3 and groups[3]:  # (a)
                    subsection_parts.append(f"({groups[3]})")
                subsection = "".join(subsection_parts) if subsection_parts else None

                year = groups[4] if len(groups) > 4 else None

                citations.append(StatuteCitation(
                    full_cite=match.group(0),
                    chapter=chapter,
                    section=section,
                    subsection=subsection,
                    year=year,
                    citation_type="statute"
                ))

    return citations


def extract_case_citations(text: str) -> List[Dict[str, str]]:
    """Extract Wisconsin case law citations."""
    cases = []

    for pattern, court_type in CASE_PATTERNS:
        matches = re.finditer(pattern, text)
        for match in matches:
            year = match.group(1)
            number = match.group(2)
            cases.append({
                "citation": match.group(0),
                "year": year,
                "number": number,
                "court": court_type,
                "type": "case_law"
            })

    return cases


def extract_cross_references(text: str, current_location: str = "") -> List[CrossReference]:
    """Extract cross-references to other legal provisions."""
    references = []

    for ref_type, pattern in CROSS_REFERENCE_PATTERNS.items():
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            target = match.group(1)
            # Get surrounding context (100 chars before and after)
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()

            references.append(CrossReference(
                source_location=current_location,
                target=target,
                reference_type=ref_type,
                context=context
            ))

    return references


def detect_hierarchical_level(text: str) -> Tuple[int, Dict[str, str]]:
    """
    Detect the hierarchical level of a text chunk.

    Returns:
        (level, metadata) where level is:
        0 = Chapter
        1 = Section
        2 = Subsection (1)
        3 = Paragraph (a)
        4 = Subparagraph (A)
    """
    # Check for section header (e.g., "940.01 First-degree intentional homicide")
    section_match = re.match(SECTION_HEADER_PATTERN, text.strip(), re.MULTILINE)
    if section_match:
        return 1, {
            "section_number": section_match.group(1),
            "section_title": section_match.group(2)
        }

    # Check for subsection (1)
    if re.match(SUBSECTION_PATTERN, text.strip()):
        subsec_match = re.match(SUBSECTION_PATTERN, text.strip())
        return 2, {"subsection": subsec_match.group(1)}

    # Check for paragraph (a)
    if re.match(PARAGRAPH_PATTERN, text.strip()):
        para_match = re.match(PARAGRAPH_PATTERN, text.strip())
        return 3, {"paragraph": para_match.group(1)}

    # Check for subparagraph (A)
    if re.match(SUBPARAGRAPH_PATTERN, text.strip()):
        subpara_match = re.match(SUBPARAGRAPH_PATTERN, text.strip())
        return 4, {"subparagraph": subpara_match.group(1)}

    # Default to chapter level if none match
    return 0, {}


def extract_legal_metadata(text: str, source: str = "") -> Dict:
    """
    Extract comprehensive legal metadata from document text.

    Args:
        text: Document text content
        source: Source file path

    Returns:
        Dictionary with extracted legal metadata
    """
    metadata = {
        "source": source,
        "statutes_cited": [],
        "cases_cited": [],
        "cross_references": [],
        "hierarchy_level": 0,
        "jurisdiction": "wisconsin",
    }

    # Extract statute citations
    statute_cites = extract_statute_citations(text)
    if statute_cites:
        primary_cite = statute_cites[0]  # First citation is likely the primary one
        metadata["statute_num"] = f"{primary_cite.chapter}.{primary_cite.section}"
        if primary_cite.subsection:
            metadata["statute_num"] += primary_cite.subsection
        metadata["chapter"] = primary_cite.chapter
        metadata["section"] = primary_cite.section
        metadata["statutes_cited"] = [c.full_cite for c in statute_cites]

    # Extract case citations
    case_cites = extract_case_citations(text)
    if case_cites:
        metadata["cases_cited"] = [c["citation"] for c in case_cites]
        metadata["case_citation"] = case_cites[0]["citation"] if case_cites else None

    # Extract cross-references
    current_location = metadata.get("statute_num", "")
    cross_refs = extract_cross_references(text, current_location)
    if cross_refs:
        metadata["cross_references"] = [
            {
                "target": ref.target,
                "type": ref.reference_type,
                "context": ref.context[:200]  # Limit context length
            }
            for ref in cross_refs
        ]

    # Detect hierarchy
    level, hierarchy_meta = detect_hierarchical_level(text)
    metadata["hierarchy_level"] = level
    metadata.update(hierarchy_meta)

    # Detect document type based on content
    if any(kw in text.lower() for kw in ['statute', 'chapter', 'section']):
        metadata["doc_type"] = "statute"
    elif any(kw in text.lower() for kw in ['state v.', 'court of appeals', 'supreme court']):
        metadata["doc_type"] = "case_law"
    elif any(kw in text.lower() for kw in ['policy', 'procedure', 'department']):
        metadata["doc_type"] = "policy"
    elif any(kw in text.lower() for kw in ['training', 'guide', 'manual']):
        metadata["doc_type"] = "training"

    # Detect sensitive topics
    sensitive_keywords = {
        'use_of_force': ['deadly force', 'use of force', 'shooting', 'firearm discharge'],
        'civil_rights': ['miranda', 'search and seizure', 'warrant', 'fourth amendment'],
        'juvenile': ['juvenile', 'minor', 'child under'],
    }

    text_lower = text.lower()
    for topic, keywords in sensitive_keywords.items():
        if any(kw in text_lower for kw in keywords):
            metadata["is_sensitive"] = True
            metadata["sensitive_topic"] = topic
            break

    return metadata


def parse_effective_date(text: str) -> Optional[str]:
    """Extract effective date from statute text."""
    # Common patterns: "Effective January 1, 2023", "(2023-24)", etc.
    date_patterns = [
        r'[Ee]ffective\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})',
        r'\((\d{4}-\d{2,4})\)',
        r'[Ee]ff\.\s+(\d{1,2}/\d{1,2}/\d{4})',
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)

    return None


def normalize_statute_number(statute_ref: str) -> str:
    """
    Normalize statute reference to standard format.

    Examples:
        "Wis. Stat. § 940.01" -> "940.01"
        "section 346.63(1)(a)" -> "346.63(1)(a)"
    """
    # Extract just the number part
    patterns = [
        r'(\d+\.\d+(?:\(\d+\))?(?:\([a-z]+\))?)',
    ]

    for pattern in patterns:
        match = re.search(pattern, statute_ref)
        if match:
            return match.group(1)

    return statute_ref
