from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Evaluation
from app.auth import get_current_user_id


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # -----------------------------
    # Overall Metrics
    # -----------------------------

    total_evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.user_id == user_id)
        .count()
    )

    average_correctness = (
        db.query(func.avg(Evaluation.correctness_score))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.correctness_score.isnot(None)
        )
        .scalar()
    )

    average_relevance = (
        db.query(func.avg(Evaluation.relevance_score))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.relevance_score.isnot(None)
        )
        .scalar()
    )

    average_faithfulness = (
        db.query(func.avg(Evaluation.faithfulness_score))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.faithfulness_score.isnot(None)
        )
        .scalar()
    )

    # -----------------------------
    # Token Usage
    # -----------------------------

    total_tokens = (
        db.query(func.sum(Evaluation.total_tokens))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.total_tokens.isnot(None)
        )
        .scalar()
    ) or 0

    average_tokens = (
        db.query(func.avg(Evaluation.total_tokens))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.total_tokens.isnot(None)
        )
        .scalar()
    ) or 0

    # -----------------------------
    # Cost
    # -----------------------------

    total_estimated_cost = (
        db.query(func.sum(Evaluation.estimated_cost))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.estimated_cost.isnot(None)
        )
        .scalar()
    ) or 0

    average_cost = (
        db.query(func.avg(Evaluation.estimated_cost))
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.estimated_cost.isnot(None)
        )
        .scalar()
    ) or 0

    # -----------------------------
    # Hallucination Risk
    # -----------------------------

    high_risk = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.hallucination_risk == "HIGH"
        )
        .count()
    )

    medium_risk = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.hallucination_risk == "MEDIUM"
        )
        .count()
    )

    low_risk = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == user_id,
            Evaluation.hallucination_risk == "LOW"
        )
        .count()
    )

    # -----------------------------
    # Recent Evaluations
    # -----------------------------

    recent_evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.user_id == user_id)
        .order_by(Evaluation.id.desc())
        .limit(5)
        .all()
    )

    recent_results = []

    for evaluation in recent_evaluations:
        recent_results.append({
            "id": evaluation.id,
            "question": evaluation.question,
            "evaluation_type": evaluation.evaluation_type,
            "generation_model": evaluation.generation_model,
            "correctness": evaluation.correctness_score,
            "relevance": evaluation.relevance_score,
            "faithfulness": evaluation.faithfulness_score,
            "hallucination_risk": evaluation.hallucination_risk,

            # Token + Cost
            "input_tokens": evaluation.input_tokens,
            "output_tokens": evaluation.output_tokens,
            "total_tokens": evaluation.total_tokens,
            "estimated_cost": evaluation.estimated_cost
        })

    # -----------------------------
    # Model Performance
    # -----------------------------

    model_performance = (
        db.query(
            Evaluation.generation_model,

            func.avg(
                Evaluation.correctness_score
            ).label("average_correctness"),

            func.avg(
                Evaluation.relevance_score
            ).label("average_relevance"),

            func.avg(
                Evaluation.faithfulness_score
            ).label("average_faithfulness"),

            func.sum(
                Evaluation.total_tokens
            ).label("total_tokens"),

            func.sum(
                Evaluation.estimated_cost
            ).label("total_cost")
        )
        .filter(Evaluation.user_id == user_id)
        .group_by(Evaluation.generation_model)
        .all()
    )

    model_results = []

    for model in model_performance:
        model_results.append({
            "model": model.generation_model,

            "average_correctness": round(
                model.average_correctness or 0,
                2
            ),

            "average_relevance": round(
                model.average_relevance or 0,
                2
            ),

            "average_faithfulness": round(
                model.average_faithfulness or 0,
                2
            ),

            "total_tokens": int(
                model.total_tokens or 0
            ),

            "total_cost": round(
                model.total_cost or 0,
                8
            )
        })

    # -----------------------------
    # Final Response
    # -----------------------------

    return {
        "total_evaluations": total_evaluations,

        "average_correctness": round(
            average_correctness or 0,
            2
        ),

        "average_relevance": round(
            average_relevance or 0,
            2
        ),

        "average_faithfulness": round(
            average_faithfulness or 0,
            2
        ),

        # -----------------------------
        # Token + Cost Analytics
        # -----------------------------

        "total_tokens": int(total_tokens),

        "average_tokens": round(
            average_tokens,
            2
        ),

        "total_estimated_cost": round(
            total_estimated_cost,
            8
        ),

        "average_cost": round(
            average_cost,
            8
        ),

        # -----------------------------
        # Hallucination Risk
        # -----------------------------

        "hallucination_risk": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        },

        # -----------------------------
        # Recent Evaluations
        # -----------------------------

        "recent_evaluations": recent_results,

        # -----------------------------
        # Model Performance
        # -----------------------------

        "model_performance": model_results
    }