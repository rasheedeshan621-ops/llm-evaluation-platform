from fastapi import APIRouter

from ..config.model_config import get_providers


router = APIRouter(
    prefix="/api/models",
    tags=["Models"]
)


@router.get("/")
def get_available_models():
    return get_providers()