from .providers.openai_provider import generate_answer as generate_openai
from .providers.gemini_provider import generate_answer as generate_gemini
from .providers.groq_provider import generate_answer as generate_groq
from .providers.claude_provider import generate_answer as generate_claude


def generate_answer(
    provider: str,
    model: str,
    api_key: str,
    question: str
):
    provider = provider.lower().strip()

    if provider == "openai":
        return generate_openai(
            question=question,
            api_key=api_key,
            model=model
        )

    if provider == "gemini":
        return generate_gemini(
            question=question,
            api_key=api_key,
            model=model
        )

    if provider == "groq":
        return generate_groq(
            question=question,
            api_key=api_key,
            model=model
        )

    if provider == "claude":
        return generate_claude(
            question=question,
            api_key=api_key,
            model=model
        )

    raise ValueError(f"Unsupported provider: {provider}")