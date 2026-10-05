from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
import uuid

from ..services.llm_service import generate_answer
from ..services.evaluation_service import evaluate_answer
from ..services.claim_extractor import extract_claims
from ..services.evidence_retriever import retrieve_evidence
from ..services.claim_verifier import verify_claim, verify_claims_batch
from ..services.hallucination_service import calculate_hallucination_risk
from ..services.cost_service import calculate_cost

from ..models import Evaluation, Claim, Dataset, DatasetQuestion
from ..auth import get_current_user_id
from ..database import get_db


router = APIRouter(
    prefix="/api/evaluate",
    tags=["Evaluation"]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class EvaluationRequest(BaseModel):
    question: str
    context: str
    reference_answer: str

    generation_provider: str = "openai"
    generation_model: str
    generation_api_key: str

    judge_provider: str = "openai"
    judge_model: str
    judge_api_key: str


class BenchmarkModel(BaseModel):
    provider: str = "openai"
    model: str
    api_key: str


class BenchmarkRequest(BaseModel):
    dataset_id: int
    models: List[BenchmarkModel]

    judge_provider: str = "openai"
    judge_model: str
    judge_api_key: str


# =========================================================
# QUICK EVALUATION
# =========================================================

@router.post("/quick")
def quick_evaluation(
    request: EvaluationRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # =====================================================
    # TOTAL TOKEN COUNTERS
    # =====================================================

    total_input_tokens = 0
    total_output_tokens = 0
    total_tokens = 0

    # =====================================================
    # TOTAL COST
    # =====================================================

    total_cost = 0.0

    # =====================================================
    # 1. GENERATE ANSWER
    # =====================================================

    generation_result = generate_answer(
        provider=request.generation_provider,
        model=request.generation_model,
        api_key=request.generation_api_key,
        question=request.question
    )

    generated_answer = generation_result["answer"]

    generation_input_tokens = generation_result["input_tokens"]
    generation_output_tokens = generation_result["output_tokens"]
    generation_total_tokens = generation_result["total_tokens"]

    # -----------------------------------------------------
    # Generation cost
    # -----------------------------------------------------

    generation_cost = calculate_cost(
        model=request.generation_model,
        input_tokens=generation_input_tokens,
        output_tokens=generation_output_tokens
    )

    total_input_tokens += generation_input_tokens
    total_output_tokens += generation_output_tokens
    total_tokens += generation_total_tokens
    total_cost += generation_cost

    # =====================================================
    # 2. EXTRACT FACTUAL CLAIMS
    # =====================================================

    claim_result = extract_claims(
        generated_answer=generated_answer,
        api_key=request.judge_api_key,
        model=request.judge_model,
        provider=request.judge_provider
    )

    claims = claim_result["claims"]

    claim_extraction_input_tokens = claim_result["input_tokens"]
    claim_extraction_output_tokens = claim_result["output_tokens"]
    claim_extraction_total_tokens = claim_result["total_tokens"]

    # -----------------------------------------------------
    # Claim extraction cost
    # -----------------------------------------------------

    claim_extraction_cost = calculate_cost(
        model=request.judge_model,
        input_tokens=claim_extraction_input_tokens,
        output_tokens=claim_extraction_output_tokens
    )

    total_input_tokens += claim_extraction_input_tokens
    total_output_tokens += claim_extraction_output_tokens
    total_tokens += claim_extraction_total_tokens
    total_cost += claim_extraction_cost

    # =====================================================
    # 3. RETRIEVE EVIDENCE + VERIFY CLAIMS
    # =====================================================

    claim_evidence = []

    claim_verification_input_tokens = 0
    claim_verification_output_tokens = 0
    claim_verification_total_tokens = 0

    for claim in claims:

        # -------------------------------------------------
        # BM25 retrieval
        # -------------------------------------------------

        evidence = retrieve_evidence(
            claim=claim,
            context=request.context,
            top_k=3
        )

        # -------------------------------------------------
        # Claim verification
        # -------------------------------------------------

        verification_result = verify_claim(
            claim=claim,
            evidence=evidence,
            api_key=request.judge_api_key,
            model=request.judge_model,
            provider=request.judge_provider
        )

        verification = verification_result["verification"]

        claim_verification_input_tokens += (
            verification_result["input_tokens"]
        )

        claim_verification_output_tokens += (
            verification_result["output_tokens"]
        )

        claim_verification_total_tokens += (
            verification_result["total_tokens"]
        )

        claim_evidence.append({
            "claim": claim,
            "evidence": evidence,
            "verification": verification
        })

    # -----------------------------------------------------
    # Claim verification cost
    # -----------------------------------------------------

    claim_verification_cost = calculate_cost(
        model=request.judge_model,
        input_tokens=claim_verification_input_tokens,
        output_tokens=claim_verification_output_tokens
    )

    total_input_tokens += claim_verification_input_tokens
    total_output_tokens += claim_verification_output_tokens
    total_tokens += claim_verification_total_tokens
    total_cost += claim_verification_cost

    # =====================================================
    # 4. HALLUCINATION CALCULATION
    # =====================================================

    hallucination = calculate_hallucination_risk(
        claim_evidence
    )

    # =====================================================
    # 5. OVERALL EVALUATION
    # =====================================================

    evaluation_result = evaluate_answer(
        question=request.question,
        reference_answer=request.reference_answer,
        context=request.context,
        generated_answer=generated_answer,
        api_key=request.judge_api_key,
        model=request.judge_model,
        provider=request.judge_provider
    )

    evaluation = evaluation_result["evaluation"]

    evaluation_input_tokens = evaluation_result["input_tokens"]
    evaluation_output_tokens = evaluation_result["output_tokens"]
    evaluation_total_tokens = evaluation_result["total_tokens"]

    # -----------------------------------------------------
    # Overall evaluation cost
    # -----------------------------------------------------

    evaluation_cost = calculate_cost(
        model=request.judge_model,
        input_tokens=evaluation_input_tokens,
        output_tokens=evaluation_output_tokens
    )

    total_input_tokens += evaluation_input_tokens
    total_output_tokens += evaluation_output_tokens
    total_tokens += evaluation_total_tokens
    total_cost += evaluation_cost

    # =====================================================
    # 6. SAVE EVALUATION
    # =====================================================

    db_evaluation = Evaluation(
        user_id=user_id,

        evaluation_type="quick",

        question=request.question,

        context=request.context,

        reference_answer=request.reference_answer,

        generation_provider=request.generation_provider,

        generation_model=request.generation_model,

        judge_provider=request.judge_provider,

        judge_model=request.judge_model,

        generated_answer=generated_answer,

        correctness_score=evaluation["correctness"],

        relevance_score=evaluation["relevance"],

        faithfulness_score=evaluation["faithfulness"],

        hallucination_risk=hallucination["risk"],

        # -------------------------------------------------
        # TOKEN USAGE
        # -------------------------------------------------

        input_tokens=total_input_tokens,

        output_tokens=total_output_tokens,

        total_tokens=total_tokens,

        # -------------------------------------------------
        # COST
        # -------------------------------------------------

        estimated_cost=total_cost
    )

    db.add(db_evaluation)

    db.commit()

    db.refresh(db_evaluation)

    # =====================================================
    # 7. SAVE CLAIMS
    # =====================================================

    for item in claim_evidence:

        evidence_text = "\n".join(
            evidence_item["evidence"]
            for evidence_item in item["evidence"]
        )

        db_claim = Claim(
            evaluation_id=db_evaluation.id,

            claim=item["claim"],

            evidence=evidence_text,

            status=item["verification"]["status"]
        )

        db.add(db_claim)

    db.commit()

    # =====================================================
    # 8. RETURN RESULT
    # =====================================================

    return {

        "id": db_evaluation.id,

        "question": request.question,

        "reference_answer": request.reference_answer,

        # -------------------------------------------------
        # PROVIDERS / MODELS
        # -------------------------------------------------

        "generation_provider": request.generation_provider,

        "generation_model": request.generation_model,

        "judge_provider": request.judge_provider,

        "judge_model": request.judge_model,

        # -------------------------------------------------
        # ANSWER
        # -------------------------------------------------

        "generated_answer": generated_answer,

        # -------------------------------------------------
        # GENERATION TOKENS
        # -------------------------------------------------

        "generation_input_tokens": generation_input_tokens,

        "generation_output_tokens": generation_output_tokens,

        "generation_total_tokens": generation_total_tokens,

        "generation_cost": generation_cost,

        # -------------------------------------------------
        # CLAIM EXTRACTION
        # -------------------------------------------------

        "claim_extraction_input_tokens":
            claim_extraction_input_tokens,

        "claim_extraction_output_tokens":
            claim_extraction_output_tokens,

        "claim_extraction_total_tokens":
            claim_extraction_total_tokens,

        "claim_extraction_cost":
            claim_extraction_cost,

        # -------------------------------------------------
        # CLAIM VERIFICATION
        # -------------------------------------------------

        "claim_verification_input_tokens":
            claim_verification_input_tokens,

        "claim_verification_output_tokens":
            claim_verification_output_tokens,

        "claim_verification_total_tokens":
            claim_verification_total_tokens,

        "claim_verification_cost":
            claim_verification_cost,

        # -------------------------------------------------
        # OVERALL EVALUATION
        # -------------------------------------------------

        "evaluation_input_tokens":
            evaluation_input_tokens,

        "evaluation_output_tokens":
            evaluation_output_tokens,

        "evaluation_total_tokens":
            evaluation_total_tokens,

        "evaluation_cost":
            evaluation_cost,

        # -------------------------------------------------
        # TOTAL
        # -------------------------------------------------

        "total_input_tokens":
            total_input_tokens,

        "total_output_tokens":
            total_output_tokens,

        "total_tokens":
            total_tokens,

        # Frontend-friendly aliases
        "input_tokens":
            total_input_tokens,

        "output_tokens":
            total_output_tokens,

        "estimated_cost":
            total_cost,

        # -------------------------------------------------
        # EVALUATION DATA
        # -------------------------------------------------

        "claims": claims,

        "claim_evidence": claim_evidence,

        "evaluation": evaluation,

        "hallucination": hallucination
    }


# =========================================================
# GET USER EVALUATION HISTORY
# =========================================================

@router.get("/")
def get_evaluations(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.user_id == user_id)
        .order_by(Evaluation.id.desc())
        .all()
    )

    return [
        {
            "id": evaluation.id,

            "evaluation_type":
                evaluation.evaluation_type,

            "benchmark_run_id":
            evaluation.benchmark_run_id,

            "question":
                evaluation.question,

            "generation_provider":
                evaluation.generation_provider,

            "generation_model":
                evaluation.generation_model,

            "judge_provider":
                evaluation.judge_provider,

            "judge_model":
                evaluation.judge_model,

            "correctness_score":
                evaluation.correctness_score,

            "relevance_score":
                evaluation.relevance_score,

            "faithfulness_score":
                evaluation.faithfulness_score,

            "hallucination_risk":
                evaluation.hallucination_risk,

            # -------------------------------------------------
            # TOKEN + COST
            # -------------------------------------------------

            "input_tokens":
                evaluation.input_tokens,

            "output_tokens":
                evaluation.output_tokens,

            "total_tokens":
                evaluation.total_tokens,

            "estimated_cost":
                evaluation.estimated_cost
        }

        for evaluation in evaluations
    ]


# =========================================================
# DATASET BENCHMARK
# =========================================================

@router.post("/compare")
def compare_dataset(
    request: BenchmarkRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # =====================================================
    # VALIDATE EXACTLY 3 MODELS
    # =====================================================

    if len(request.models) != 3:

        raise HTTPException(
            status_code=400,
            detail="Exactly 3 models are required"
        )

    # =====================================================
    # GET DATASET
    # =====================================================

    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == request.dataset_id,
            Dataset.user_id == user_id
        )
        .first()
    )

    if not dataset:

        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    # =====================================================
    # GET QUESTIONS
    # =====================================================

    questions = (
        db.query(DatasetQuestion)
        .filter(
            DatasetQuestion.dataset_id == request.dataset_id
        )
        .all()
    )

    if not questions:

        raise HTTPException(
            status_code=400,
            detail="Dataset contains no questions"
        )

    results = []

    benchmark_run_id = str(uuid.uuid4())

    # =====================================================
    # LOOP THROUGH QUESTIONS
    # =====================================================

    for question in questions:

        question_result = {
            "question_id": question.id,
            "question": question.question,
            "models": []
        }

        # =================================================
        # LOOP THROUGH 3 MODELS
        # =================================================

        for model_config in request.models:

            # =================================================
            # TOKEN COUNTERS
            # =================================================

            total_input_tokens = 0

            total_output_tokens = 0

            total_tokens = 0

            # =================================================
            # COST
            # =================================================

            total_cost = 0.0

            # ---------------------------------------------
            # 1. GENERATION
            # ---------------------------------------------

            generation_result = generate_answer(
                provider=model_config.provider,

                model=model_config.model,

                api_key=model_config.api_key,

                question=question.question
            )

            generated_answer = generation_result["answer"]

            generation_input_tokens = (
                generation_result["input_tokens"]
            )

            generation_output_tokens = (
                generation_result["output_tokens"]
            )

            generation_total_tokens = (
                generation_result["total_tokens"]
            )

            generation_cost = calculate_cost(
                model=model_config.model,

                input_tokens=generation_input_tokens,

                output_tokens=generation_output_tokens
            )

            total_input_tokens += generation_input_tokens

            total_output_tokens += generation_output_tokens

            total_tokens += generation_total_tokens

            total_cost += generation_cost

            # ---------------------------------------------
            # 2. OVERALL EVALUATION
            # ---------------------------------------------

            evaluation_result = evaluate_answer(
                question=question.question,

                reference_answer=question.reference_answer,

                context=question.context,

                generated_answer=generated_answer,

                api_key=request.judge_api_key,

                model=request.judge_model,

                provider=request.judge_provider
            )

            evaluation = evaluation_result["evaluation"]

            evaluation_input_tokens = (
                evaluation_result["input_tokens"]
            )

            evaluation_output_tokens = (
                evaluation_result["output_tokens"]
            )

            evaluation_total_tokens = (
                evaluation_result["total_tokens"]
            )

            evaluation_cost = calculate_cost(
                model=request.judge_model,

                input_tokens=evaluation_input_tokens,

                output_tokens=evaluation_output_tokens
            )

            total_input_tokens += evaluation_input_tokens

            total_output_tokens += evaluation_output_tokens

            total_tokens += evaluation_total_tokens

            total_cost += evaluation_cost

            # ---------------------------------------------
            # 3. CLAIM EXTRACTION
            # ---------------------------------------------

            claim_result = extract_claims(
                generated_answer=generated_answer,

                api_key=request.judge_api_key,

                model=request.judge_model,

                provider=request.judge_provider
            )

            claims = claim_result["claims"]

            claim_extraction_input_tokens = (
                claim_result["input_tokens"]
            )

            claim_extraction_output_tokens = (
                claim_result["output_tokens"]
            )

            claim_extraction_total_tokens = (
                claim_result["total_tokens"]
            )

            claim_extraction_cost = calculate_cost(
                model=request.judge_model,

                input_tokens=claim_extraction_input_tokens,

                output_tokens=claim_extraction_output_tokens
            )

            total_input_tokens += (
                claim_extraction_input_tokens
            )

            total_output_tokens += (
                claim_extraction_output_tokens
            )

            total_tokens += (
                claim_extraction_total_tokens
            )

            total_cost += claim_extraction_cost

            # ---------------------------------------------
            # 4. RETRIEVE EVIDENCE
            # ---------------------------------------------

            claim_evidence = []

            evidence_map = {}

            for claim in claims:

                evidence = retrieve_evidence(
                    claim=claim,

                    context=question.context,

                    top_k=3
                )

                evidence_map[claim] = evidence

            # ---------------------------------------------
            # 5. BATCH VERIFICATION
            # ---------------------------------------------

            verification_result = verify_claims_batch(
                claims=claims,

                evidence_map=evidence_map,

                api_key=request.judge_api_key,

                model=request.judge_model,

                provider=request.judge_provider
            )

            verification_data = (
                verification_result["verification"]
            )

            verification_input_tokens = (
                verification_result["input_tokens"]
            )

            verification_output_tokens = (
                verification_result["output_tokens"]
            )

            verification_total_tokens = (
                verification_result["total_tokens"]
            )

            verification_cost = calculate_cost(
                model=request.judge_model,

                input_tokens=verification_input_tokens,

                output_tokens=verification_output_tokens
            )

            total_input_tokens += verification_input_tokens

            total_output_tokens += verification_output_tokens

            total_tokens += verification_total_tokens

            total_cost += verification_cost

            verification_lookup = {
                item["claim"]: item

                for item in verification_data["results"]
            }

            # ---------------------------------------------
            # 6. COMBINE CLAIMS
            # ---------------------------------------------

            for claim in claims:

                verification = verification_lookup.get(
                    claim,

                    {
                        "claim": claim,

                        "status": "UNSUPPORTED",

                        "reason":
                            "No verification result returned."
                    }
                )

                claim_evidence.append({

                    "claim": claim,

                    "evidence":
                        evidence_map.get(claim, []),

                    "verification": verification
                })

            # ---------------------------------------------
            # 7. HALLUCINATION
            # ---------------------------------------------

            hallucination = (
                calculate_hallucination_risk(
                    claim_evidence
                )
            )

            # =================================================
            # 8. SAVE BENCHMARK EVALUATION
            # =================================================

            db_evaluation = Evaluation(

                user_id=user_id,

                evaluation_type="benchmark",

                benchmark_run_id=benchmark_run_id,

                question=question.question,

                context=question.context,

                reference_answer=question.reference_answer,

                generation_provider=model_config.provider,

                generation_model=model_config.model,

                judge_provider=request.judge_provider,

                judge_model=request.judge_model,

                generated_answer=generated_answer,

                correctness_score=
                    evaluation["correctness"],

                relevance_score=
                    evaluation["relevance"],

                faithfulness_score=
                    evaluation["faithfulness"],

                hallucination_risk=
                    hallucination["risk"],

                # -------------------------------------------------
                # TOKEN USAGE
                # -------------------------------------------------

                input_tokens=
                    total_input_tokens,

                output_tokens=
                    total_output_tokens,

                total_tokens=
                    total_tokens,

                # -------------------------------------------------
                # COST
                # -------------------------------------------------

                estimated_cost=
                    total_cost
            )

            db.add(db_evaluation)

            db.flush()

            # =================================================
            # 9. SAVE CLAIMS
            # =================================================

            for item in claim_evidence:

                evidence_text = "\n".join(

                    evidence_item["evidence"]

                    for evidence_item
                    in item["evidence"]
                )

                db_claim = Claim(

                    evaluation_id=
                        db_evaluation.id,

                    claim=item["claim"],

                    evidence=evidence_text,

                    status=
                        item["verification"]["status"]
                )

                db.add(db_claim)

            db.flush()

            # =================================================
            # 10. BENCHMARK RESULT
            # =================================================

            question_result["models"].append({

                "provider":
                    model_config.provider,

                "model":
                    model_config.model,

                "generated_answer":
                    generated_answer,

                # -------------------------------------------------
                # GENERATION
                # -------------------------------------------------

                "generation_input_tokens":
                    generation_input_tokens,

                "generation_output_tokens":
                    generation_output_tokens,

                "generation_total_tokens":
                    generation_total_tokens,

                "generation_cost":
                    generation_cost,

                # -------------------------------------------------
                # OVERALL EVALUATION
                # -------------------------------------------------

                "evaluation_input_tokens":
                    evaluation_input_tokens,

                "evaluation_output_tokens":
                    evaluation_output_tokens,

                "evaluation_total_tokens":
                    evaluation_total_tokens,

                "evaluation_cost":
                    evaluation_cost,

                # -------------------------------------------------
                # CLAIM EXTRACTION
                # -------------------------------------------------

                "claim_extraction_input_tokens":
                    claim_extraction_input_tokens,

                "claim_extraction_output_tokens":
                    claim_extraction_output_tokens,

                "claim_extraction_total_tokens":
                    claim_extraction_total_tokens,

                "claim_extraction_cost":
                    claim_extraction_cost,

                # -------------------------------------------------
                # VERIFICATION
                # -------------------------------------------------

                "verification_input_tokens":
                    verification_input_tokens,

                "verification_output_tokens":
                    verification_output_tokens,

                "verification_total_tokens":
                    verification_total_tokens,

                "verification_cost":
                    verification_cost,

                # -------------------------------------------------
                # TOTAL
                # -------------------------------------------------

                "total_input_tokens":
                    total_input_tokens,

                "total_output_tokens":
                    total_output_tokens,

                "total_tokens":
                    total_tokens,

                # Frontend-friendly aliases
                "input_tokens":
                    total_input_tokens,

                "output_tokens":
                    total_output_tokens,

                "estimated_cost":
                    total_cost,

                # -------------------------------------------------
                # EXISTING DATA
                # -------------------------------------------------

                "evaluation":
                    evaluation,

                "hallucination_risk":
                    hallucination,

                "claims":
                    claim_evidence
            })

        results.append(question_result)

    # =====================================================
    # COMMIT ALL BENCHMARK RESULTS
    # =====================================================

    db.commit()

    # =====================================================
    # RETURN BENCHMARK RESULTS
    # =====================================================

    return {

        "message":
            "Benchmark generation completed",

        "benchmark_run_id":
            benchmark_run_id,

        "dataset_id":
            dataset.id,

        "filename":
            dataset.filename,

        "total_questions":
            len(questions),

        "results":
            results
    }


# =========================================================
# EVALUATION DETAIL
# =========================================================

@router.get("/{evaluation_id}")
def get_evaluation_detail(
    evaluation_id: int,

    user_id: int =
        Depends(get_current_user_id),

    db: Session =
        Depends(get_db)
):

    evaluation = (
        db.query(Evaluation)
        .filter(
            Evaluation.id == evaluation_id,

            Evaluation.user_id == user_id
        )
        .first()
    )

    if not evaluation:

        raise HTTPException(
            status_code=404,

            detail="Evaluation not found"
        )

    claims = (
        db.query(Claim)
        .filter(
            Claim.evaluation_id ==
                evaluation_id
        )
        .all()
    )

    return {

        "id":
            evaluation.id,

        "evaluation_type":
            evaluation.evaluation_type,

        "question":
            evaluation.question,

        "context":
            evaluation.context,

        "reference_answer":
            evaluation.reference_answer,

        "generation_provider":
            evaluation.generation_provider,

        "generation_model":
            evaluation.generation_model,

        "judge_provider":
            evaluation.judge_provider,

        "judge_model":
            evaluation.judge_model,

        "generated_answer":
            evaluation.generated_answer,

        # -------------------------------------------------
        # SCORES
        # -------------------------------------------------

        "correctness_score":
            evaluation.correctness_score,

        "relevance_score":
            evaluation.relevance_score,

        "faithfulness_score":
            evaluation.faithfulness_score,

        "hallucination_risk":
            evaluation.hallucination_risk,

        # -------------------------------------------------
        # TOKEN USAGE
        # -------------------------------------------------

        "input_tokens":
            evaluation.input_tokens,

        "output_tokens":
            evaluation.output_tokens,

        "total_tokens":
            evaluation.total_tokens,

        # -------------------------------------------------
        # COST
        # -------------------------------------------------

        "estimated_cost":
            evaluation.estimated_cost,

        # -------------------------------------------------
        # CLAIMS
        # -------------------------------------------------

        "claims": [

            {
                "id":
                    claim.id,

                "claim":
                    claim.claim,

                "evidence":
                    claim.evidence,

                "status":
                    claim.status
            }

            for claim in claims
        ]
    }