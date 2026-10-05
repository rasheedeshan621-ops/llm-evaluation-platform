import csv
import io

from fastapi import APIRouter, UploadFile, File, HTTPException,Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Dataset, DatasetQuestion
from ..auth import get_current_user_id


router = APIRouter(
    prefix="/api/datasets",
    tags=["Datasets"]
)


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # Check file
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported currently"
        )

    # Read file
    content = await file.read()

    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="CSV file must be UTF-8 encoded"
        )

    # Parse CSV
    reader = csv.DictReader(
        io.StringIO(text)
    )

    required_columns = {
        "question",
        "context",
        "reference_answer"
    }

    if not reader.fieldnames:
        raise HTTPException(
            status_code=400,
            detail="CSV file has no columns"
        )

    actual_columns = set(reader.fieldnames)

    missing_columns = (
        required_columns - actual_columns
    )

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=(
                "Missing required columns: "
                + ", ".join(missing_columns)
            )
        )

    rows = list(reader)

    if not rows:
        raise HTTPException(
            status_code=400,
            detail="CSV file contains no data rows"
        )

    # Validate rows
    for index, row in enumerate(rows, start=1):

        if not row["question"].strip():
            raise HTTPException(
                status_code=400,
                detail=f"Question is empty in row {index}"
            )

        if not row["context"].strip():
            raise HTTPException(
                status_code=400,
                detail=f"Context is empty in row {index}"
            )

        if not row["reference_answer"].strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Reference answer is empty "
                    f"in row {index}"
                )
            )

    # Create dataset
    dataset = Dataset(
        user_id=user_id,
        filename=file.filename,
        total_questions=len(rows)
    )

    db.add(dataset)
    db.flush()

    # Save questions
    for row in rows:

        dataset_question = DatasetQuestion(
            dataset_id=dataset.id,
            question=row["question"].strip(),
            context=row["context"].strip(),
            reference_answer=row["reference_answer"].strip()
        )

        db.add(dataset_question)

    db.commit()
    db.refresh(dataset)

    return {
        "message": "Dataset uploaded successfully",
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "total_questions": dataset.total_questions,
        "columns": reader.fieldnames,
        "preview": rows[:3]
    }