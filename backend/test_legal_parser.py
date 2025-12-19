"""
Quick tests for legal parser functionality.
Run with: python backend/test_legal_parser.py
"""
from app.services.legal_parser import (
    extract_statute_citations,
    extract_case_citations,
    extract_cross_references,
    extract_legal_metadata,
    detect_hierarchical_level,
    normalize_statute_number
)


def test_statute_extraction():
    """Test Wisconsin statute citation extraction."""
    print("\n=== Testing Statute Citation Extraction ===")

    test_cases = [
        "Under Wis. Stat. § 940.01, first-degree intentional homicide...",
        "See § 346.63 for operating while intoxicated.",
        "Section 939.22 defines mental state.",
        "This is governed by chapter 940.",
    ]

    for text in test_cases:
        citations = extract_statute_citations(text)
        print(f"\nText: {text}")
        for cite in citations:
            print(f"  Found: {cite.full_cite} -> Chapter {cite.chapter}, Section {cite.section}, Subsection {cite.subsection}")


def test_case_citations():
    """Test case law citation extraction."""
    print("\n\n=== Testing Case Law Citation Extraction ===")

    test_text = """
    In State v. Smith, 2020 WI 45, the Supreme Court held...
    See also State v. Jones, 2021 WI App 123 for related guidance.
    """

    cases = extract_case_citations(test_text)
    print(f"\nText: {test_text.strip()}")
    for case in cases:
        print(f"  Found: {case['citation']} ({case['year']}, {case['court']})")


def test_cross_references():
    """Test cross-reference extraction."""
    print("\n\n=== Testing Cross-Reference Extraction ===")

    test_text = """
    940.01 First-degree intentional homicide.
    (1) Whoever causes the death of another human being with intent to kill that person
    or another is guilty of first-degree intentional homicide.
    (2) See § 939.50 for penalty provisions. As defined in § 939.22, "intent" means...
    This is subject to § 939.48 regarding self-defense.
    """

    refs = extract_cross_references(test_text, "940.01")
    print(f"\nFound {len(refs)} cross-references:")
    for ref in refs:
        print(f"  Type: {ref.reference_type}, Target: {ref.target}")
        print(f"    Context: {ref.context[:100]}...")


def test_hierarchical_detection():
    """Test hierarchical level detection."""
    print("\n\n=== Testing Hierarchical Level Detection ===")

    test_texts = [
        "940.01 First-degree intentional homicide",
        "(1) Whoever causes the death...",
        "(a) Under circumstances...",
        "(A) If the person was...",
    ]

    for text in test_texts:
        level, meta = detect_hierarchical_level(text)
        print(f"\nText: {text}")
        print(f"  Level: {level}, Metadata: {meta}")


def test_legal_metadata_extraction():
    """Test comprehensive metadata extraction."""
    print("\n\n=== Testing Comprehensive Metadata Extraction ===")

    test_document = """
    940.01 First-degree intentional homicide.

    (1) Whoever causes the death of another human being with intent to kill
    that person or another is guilty of first-degree intentional homicide.

    (2) Penalty. A person convicted under sub. (1) shall be imprisoned for life.
    See § 939.50 for classification of felonies. As defined in § 939.22,
    "intent" means purpose to cause the result specified.

    This statute is subject to § 939.48 regarding self-defense.
    See also State v. Smith, 2020 WI 45 for recent interpretation.

    Effective January 1, 2023.
    """

    metadata = extract_legal_metadata(test_document, "statutes/chapter_940.pdf")

    print("\nExtracted metadata:")
    for key, value in metadata.items():
        if value and value != [] and value != {}:
            print(f"  {key}: {value}")


def test_normalize_statute():
    """Test statute number normalization."""
    print("\n\n=== Testing Statute Number Normalization ===")

    test_cases = [
        "Wis. Stat. § 940.01",
        "section 346.63(1)(a)",
        "§ 939.22",
        "940.01(2)",
    ]

    for text in test_cases:
        normalized = normalize_statute_number(text)
        print(f"{text:30s} -> {normalized}")


def test_sensitive_topic_detection():
    """Test sensitive topic detection."""
    print("\n\n=== Testing Sensitive Topic Detection ===")

    test_documents = [
        ("Use of deadly force is justified when...", "use_of_force"),
        ("Miranda warnings must be given before...", "civil_rights"),
        ("Juvenile offenders under 18 years...", "juvenile"),
        ("Traffic violations are governed by...", None),
    ]

    for text, expected_topic in test_documents:
        metadata = extract_legal_metadata(text)
        is_sensitive = metadata.get('is_sensitive', False)
        detected_topic = metadata.get('sensitive_topic')
        status = "✓" if detected_topic == expected_topic else "✗"
        print(f"{status} Text: {text[:50]}...")
        print(f"  Expected: {expected_topic}, Got: {detected_topic}, Sensitive: {is_sensitive}")


if __name__ == "__main__":
    print("=" * 70)
    print("Wisconsin Legal Parser - Test Suite")
    print("=" * 70)

    test_statute_extraction()
    test_case_citations()
    test_cross_references()
    test_hierarchical_detection()
    test_legal_metadata_extraction()
    test_normalize_statute()
    test_sensitive_topic_detection()

    print("\n" + "=" * 70)
    print("All tests completed!")
    print("=" * 70)
