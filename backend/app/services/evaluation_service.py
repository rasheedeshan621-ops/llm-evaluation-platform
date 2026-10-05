import json

from .judge_service import generate_judge_response


def evaluate_answer(
    question: str,
    reference_answer: str,
    context: str,
    generated_answer: str,
    api_key: str,
    model: str,
    provider: str = "openai"
):
    prompt = f"""
You are an LLM evaluation judge.

Evaluate the generated answer using the information below.

Question:
{question}

Reference Answer:
{reference_answer}

Context:
{context}

Generated Answer:
{generated_answer}

Evaluate these three metrics:

1. correctness
2. relevance
3. faithfulness

Give each score from 0 to 100.

Definitions:

Correctness:
How accurately the generated answer matches the reference answer.

Relevance:
How directly the generated answer answers the question.

Faithfulness:
How well the generated answer is supported by the provided context.

Return ONLY valid JSON in this format:

{{
    "correctness": 0,
    "relevance": 0,
    "faithfulness": 0,
    "reason": "short explanation"
}}
"""

    result = generate_judge_response(
        provider=provider,
        model=model,
        api_key=api_key,
        prompt=prompt
    )

    evaluation = json.loads(result["answer"])

    return {
        "evaluation": evaluation,
        "input_tokens": result["input_tokens"],
        "output_tokens": result["output_tokens"],
        "total_tokens": result["total_tokens"]
    }