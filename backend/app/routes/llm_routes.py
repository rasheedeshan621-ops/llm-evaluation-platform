from fastapi import APIRouter
from pydantic import BaseModel

from ..services.llm_service import generate_answer


router = APIRouter(
    prefix="/api/llm",
    tags=["LLM"]
)


class GenerateRequest(BaseModel):
    question: str
    context: str | None = None


@router.post("/generate")
def generate(request: GenerateRequest):

    answer = generate_answer(
        question=request.question,
        context=request.context
    )

    return {
        "question": request.question,
        "answer": answer
    }