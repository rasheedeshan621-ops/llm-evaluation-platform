# backend/app/services/cost_service.py


MODEL_PRICING = {

    # =====================================================
    # OPENAI
    # Price: USD per 1 million tokens
    # =====================================================

    "gpt-4.1-mini": {
        "input": 0.40,
        "output": 1.60
    },

    "gpt-4.1": {
        "input": 2.00,
        "output": 8.00
    },


    # =====================================================
    # GOOGLE GEMINI
    # Current introductory pricing through Dec 31, 2026
    # =====================================================

    "gemini-3.8-flash": {
        "input": 0.75,
        "output": 3.75
    },


    # =====================================================
    # GROQ
    # =====================================================

    "openai/gpt-oss-20b": {
        "input": 0.075,
        "output": 0.30
    },


    # =====================================================
    # ANTHROPIC CLAUDE
    # =====================================================

    "claude-sonnet-4-5": {
        "input": 3.00,
        "output": 15.00
    },

    "claude-haiku-4-5": {
        "input": 1.00,
        "output": 5.00
    }
}


def calculate_cost(
    model: str,
    input_tokens: int,
    output_tokens: int
):

    pricing = MODEL_PRICING.get(model)

    if not pricing:
        return 0.0

    input_cost = (
        input_tokens / 1_000_000
    ) * pricing["input"]

    output_cost = (
        output_tokens / 1_000_000
    ) * pricing["output"]

    total_cost = input_cost + output_cost

    return round(total_cost, 8)