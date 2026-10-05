import json

from .judge_service import generate_judge_response


def verify_claim(
    claim: str,
    evidence: list,
    api_key: str,
    model: str,
    provider: str = "openai"
):
    evidence_text = "\n".join(
        [
            item["evidence"]
            for item in evidence
        ]
    )

    prompt = f"""
You are a strict factual claim verification system.

Determine whether the CLAIM is supported by the provided EVIDENCE.

CLAIM:
{claim}

EVIDENCE:
{evidence_text}

Use only the provided evidence.

Labels:

SUPPORTED:
The evidence directly supports the claim.

CONTRADICTED:
The evidence directly contradicts the claim.

UNSUPPORTED:
The evidence does not provide enough information to support or contradict the claim.

Return ONLY valid JSON:

{{
    "status": "SUPPORTED",
    "reason": "short explanation"
}}
"""

    result = generate_judge_response(
        provider=provider,
        model=model,
        api_key=api_key,
        prompt=prompt
    )

    verification = json.loads(result["answer"])

    return {
        "verification": verification,
        "input_tokens": result["input_tokens"],
        "output_tokens": result["output_tokens"],
        "total_tokens": result["total_tokens"]
    }


def verify_claims_batch(
    claims,
    evidence_map,
    api_key,
    model,
    provider="openai"
):
    claims_text = ""

    for i, claim in enumerate(claims):
        evidence = evidence_map.get(claim, [])

        evidence_text = "\n".join(
            item["evidence"] for item in evidence
        )

        claims_text += f"""
CLAIM {i + 1}:
{claim}

EVIDENCE:
{evidence_text}

---
"""

    prompt = f"""
You are a strict factual claim verification system.

Verify ALL claims using ONLY the provided evidence.

{claims_text}

For each claim, use exactly one status:

SUPPORTED:
The evidence directly supports the claim.

CONTRADICTED:
The evidence directly contradicts the claim.

UNSUPPORTED:
The evidence does not provide enough information to support or contradict the claim.

Return ONLY valid JSON in this exact format:

{{
    "results": [
        {{
            "claim": "claim text",
            "status": "SUPPORTED",
            "reason": "short explanation"
        }}
    ]
}}

Important:
- Return exactly one result for every claim.
- Do not skip any claim.
- Do not add extra fields.
- Use only the provided evidence.
"""

    result = generate_judge_response(
        provider=provider,
        model=model,
        api_key=api_key,
        prompt=prompt
    )

    verification = json.loads(result["answer"])

    return {
        "verification": verification,
        "input_tokens": result["input_tokens"],
        "output_tokens": result["output_tokens"],
        "total_tokens": result["total_tokens"]
    }