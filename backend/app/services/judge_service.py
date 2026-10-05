from .providers.openai_provider import generate_answer as generate_openai
from .providers.gemini_provider import generate_answer as generate_gemini
from .providers.groq_provider import generate_answer as generate_groq
from .providers.claude_provider import generate_answer as generate_claude


def generate_judge_response(
    provider: str,
    model: str,
    api_key: str,
    prompt: str
):
    provider = provider.lower().strip()

    if provider == "openai":
        return generate_openai(
            question=prompt,
            api_key=api_key,
            model=model
        )

    if provider == "gemini":
        return generate_gemini(
            question=prompt,
            api_key=api_key,
            model=model
        )

    if provider == "groq":
        return generate_groq(
            question=prompt,
            api_key=api_key,
            model=model
        )

    if provider == "claude":
        return generate_claude(
            question=prompt,
            api_key=api_key,
            model=model
        )

    raise ValueError(
        f"Unsupported judge provider: {provider}"
    )