import re
from rank_bm25 import BM25Okapi


def tokenize(text: str):
    """Normalize text into simple word tokens for BM25/lexical matching."""
    return re.findall(r"\b\w+\b", (text or "").lower())


def split_into_sentences(text: str):
    sentences = re.split(r'(?<=[.!?])\s+', (text or "").strip())

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def retrieve_evidence(
    claim: str,
    context: str,
    top_k: int = 3
):
    """
    Retrieve evidence with BM25 first.

    For very small contexts BM25 can legitimately return 0.0 for every
    sentence because its IDF signal collapses. In that case, fall back to
    simple lexical-overlap scoring so directly matching evidence is not lost.
    """
    sentences = split_into_sentences(context)

    if not sentences:
        return []

    claim_tokens = tokenize(claim)

    if not claim_tokens:
        return []

    tokenized_context = [
        tokenize(sentence)
        for sentence in sentences
    ]

    bm25 = BM25Okapi(tokenized_context)
    scores = bm25.get_scores(claim_tokens)

    # Normal BM25 ranking.
    ranked_indices = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )

    # With tiny contexts, all BM25 scores can be 0.0.
    # Use lexical overlap as a deterministic fallback.
    if not any(score > 0 for score in scores):
        claim_token_set = set(claim_tokens)
        overlap_scores = []

        for tokens in tokenized_context:
            context_token_set = set(tokens)
            overlap = claim_token_set.intersection(context_token_set)
            score = (
                len(overlap) / len(claim_token_set)
                if claim_token_set
                else 0.0
            )
            overlap_scores.append(score)

        ranked_indices = sorted(
            range(len(overlap_scores)),
            key=lambda i: overlap_scores[i],
            reverse=True
        )

        return [
            {
                "evidence": sentences[index],
                "score": round(float(overlap_scores[index]), 4),
                "retrieval_method": "lexical_fallback"
            }
            for index in ranked_indices[:top_k]
            if overlap_scores[index] > 0
        ]

    return [
        {
            "evidence": sentences[index],
            "score": float(scores[index]),
            "retrieval_method": "bm25"
        }
        for index in ranked_indices[:top_k]
    ]
