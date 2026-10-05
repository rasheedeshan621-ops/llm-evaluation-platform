import json

from .judge_service import generate_judge_response


def extract_claims(
    generated_answer: str,
    api_key: str,
    model: str,
    provider: str = "openai"
):
    prompt = f"""
You are a claim extraction system.

Extract the most important factual claims from the following generated answer.

Generated Answer:
{generated_answer}

Rules:

1. Extract only factual claims.
2. Do not extract questions.
3. Do not extract opinions or vague statements.
4. Each claim must be understandable on its own.
5. Keep every claim short and concise.
6. Extract a maximum of 8 claims.
7. Do not extract mathematical formulas.
8. Do not extract implementation details or parameter explanations.
9. Do not add information that is not present in the answer.
10. If there are fewer than 8 important factual claims, return only those claims.
11. Extract multiple distinct factual claims when the answer contains multiple factual statements.
12. Do not combine unrelated factual statements into one claim.

Return ONLY valid JSON.

Use exactly this format:

{{
    "claims": [
        "short factual claim 1",
        "short factual claim 2"
    ]
}}
"""

    result = generate_judge_response(
        provider=provider,
        model=model,
        api_key=api_key,
        prompt=prompt
    )

    # Parse JSON response
    parsed_result = json.loads(result["answer"])

    # Extract the actual claims list
    claims = parsed_result.get("claims", [])

    # Safety check
    if not isinstance(claims, list):
        claims = []

    return {
        "claims": claims,
        "input_tokens": result["input_tokens"],
        "output_tokens": result["output_tokens"],
        "total_tokens": result["total_tokens"]
    }