def calculate_hallucination_risk(claim_evidence):
    """
    Calculate hallucination risk using claim verification results.

    Status weights:
    - SUPPORTED     = 0.0
    - UNSUPPORTED   = 0.5
    - CONTRADICTED  = 1.0

    Unsupported claims are treated as possible hallucinations,
    while contradicted claims are treated as strong hallucination signals.
    """

    total_claims = len(claim_evidence)

    # -----------------------------------------------------
    # No claims
    # -----------------------------------------------------

    if total_claims == 0:
        return {
            "total_claims": 0,
            "supported": 0,
            "unsupported": 0,
            "contradicted": 0,
            "hallucination_rate": 0,
            "hallucination_score": 0,
            "evidence_coverage": 0,
            "risk": "LOW"
        }

    # -----------------------------------------------------
    # Count verification statuses
    # -----------------------------------------------------

    supported = 0
    unsupported = 0
    contradicted = 0

    for item in claim_evidence:

        verification = item.get("verification", {})

        status = verification.get(
            "status",
            "UNSUPPORTED"
        ).upper().strip()

        if status == "SUPPORTED":
            supported += 1

        elif status == "CONTRADICTED":
            contradicted += 1

        else:
            # Treat missing / unknown status as unsupported
            unsupported += 1

    # -----------------------------------------------------
    # Evidence coverage
    # -----------------------------------------------------

    evidence_coverage = (
        supported / total_claims
    ) * 100

    # -----------------------------------------------------
    # Weighted hallucination score
    #
    # SUPPORTED     = 0
    # UNSUPPORTED   = 0.5
    # CONTRADICTED  = 1.0
    # -----------------------------------------------------

    weighted_hallucination = (
        (unsupported * 0.5)
        + (contradicted * 1.0)
    )

    hallucination_score = (
        weighted_hallucination / total_claims
    ) * 100

    hallucination_score = round(
        hallucination_score,
        2
    )

    # -----------------------------------------------------
    # Risk calculation
    #
    # 0 - 15%   -> LOW
    # 15 - 40%  -> MEDIUM
    # > 40%     -> HIGH
    #
    # But any contradiction makes the risk at least MEDIUM.
    # 20%+ contradicted claims -> HIGH.
    # -----------------------------------------------------

    contradiction_rate = (
        contradicted / total_claims
    ) * 100

    if contradiction_rate >= 20:
        risk = "HIGH"

    elif contradicted > 0:
        risk = "MEDIUM"

    elif hallucination_score > 40:
        risk = "HIGH"

    elif hallucination_score > 15:
        risk = "MEDIUM"

    else:
        risk = "LOW"

    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {
        "total_claims": total_claims,
        "supported": supported,
        "unsupported": unsupported,
        "contradicted": contradicted,

        # Keep existing field for frontend compatibility
        "hallucination_rate": hallucination_score,

        # New explicit field
        "hallucination_score": hallucination_score,

        "evidence_coverage": round(
            evidence_coverage,
            2
        ),

        "risk": risk
    }