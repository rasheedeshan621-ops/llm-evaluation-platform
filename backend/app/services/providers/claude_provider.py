from anthropic import Anthropic


def generate_answer(question: str, api_key: str, model: str):

    client = Anthropic(api_key=api_key)

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        temperature=0,
        system="Answer clearly and accurately in English.",
        messages=[
            {
                "role": "user",
                "content": question
            }
        ]
    )

    answer = response.content[0].text

    usage = response.usage

    input_tokens = (
        usage.input_tokens
        if usage and usage.input_tokens
        else 0
    )

    output_tokens = (
        usage.output_tokens
        if usage and usage.output_tokens
        else 0
    )

    return {
        "answer": answer,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens
    }