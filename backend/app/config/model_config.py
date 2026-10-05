PROVIDERS = {
    "openai": {
        "name": "OpenAI",
        "models": [
            "gpt-4.1-mini",
            "gpt-4.1"
        ]
    },

    "gemini": {
        "name": "Google Gemini",
        "models": [
            "gemini-3.8-flash"
        ]
    },

    "groq": {
        "name": "Groq",
        "models": [
            "openai/gpt-oss-20b"
        ]
    },

    "claude": {
        "name": "Anthropic Claude",
        "models": [
            "claude-sonnet-4-5",
            "claude-haiku-4-5"
        ]
    }
}


def get_providers():
    return PROVIDERS