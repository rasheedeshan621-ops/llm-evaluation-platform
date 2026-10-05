from google import genai


def generate_answer(question: str, api_key: str, model: str):

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=model,
        contents=question
    )

    answer = response.text

    usage = response.usage_metadata

    input_tokens = (
        usage.prompt_token_count
        if usage and usage.prompt_token_count
        else 0
    )

    output_tokens = (
        usage.candidates_token_count
        if usage and usage.candidates_token_count
        else 0
    )

    total_tokens = (
        usage.total_token_count
        if usage and usage.total_token_count
        else input_tokens + output_tokens
    )

    return {
        "answer": answer,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens
    }