# backend/app/services/token_service.py

def estimate_tokens(text: str) -> int:
    """
    Rough token estimation.

    Approximation:
    1 token ≈ 4 characters for English text.
    """

    if not text:
        return 0

    return max(1, len(text) // 4)


def calculate_token_usage(
    input_text: str,
    output_text: str
):
    input_tokens = estimate_tokens(input_text)
    output_tokens = estimate_tokens(output_text)

    total_tokens = input_tokens + output_tokens

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens
    }