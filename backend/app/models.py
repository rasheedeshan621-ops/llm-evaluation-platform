from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    evaluations = relationship(
        "Evaluation",
        back_populates="user"
    )


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    evaluation_type = Column(
        String(50),
        nullable=False
    )

    benchmark_run_id = Column(
        String(100),
        nullable=True,
        index=True
    )

    question = Column(
        Text,
        nullable=False
    )

    context = Column(
        Text,
        nullable=True
    )

    reference_answer = Column(
        Text,
        nullable=True
    )

    generation_model = Column(
        String(100),
        nullable=False
    )

    judge_model = Column(
        String(100),
        nullable=False
    )

    generation_provider = Column(
        String(50),
        nullable=True
    )

    judge_provider = Column(
        String(50),
        nullable=True
    )

    generated_answer = Column(
        Text,
        nullable=True
    )

    correctness_score = Column(
        Float,
        nullable=True
    )

    faithfulness_score = Column(
        Float,
        nullable=True
    )

    relevance_score = Column(
        Float,
        nullable=True
    )

    hallucination_risk = Column(
        String(20),
        nullable=True
    )

    latency = Column(
        Float,
        nullable=True
    )

    # =====================================================
    # TOKEN USAGE
    # =====================================================

    input_tokens = Column(
        Integer,
        nullable=True
    )

    output_tokens = Column(
        Integer,
        nullable=True
    )

    total_tokens = Column(
        Integer,
        nullable=True
    )

    # =====================================================
    # COST
    # =====================================================

    estimated_cost = Column(
        Float,
        nullable=True
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    user = relationship(
        "User",
        back_populates="evaluations"
    )


class Claim(Base):
    __tablename__ = "claims"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    evaluation_id = Column(
        Integer,
        ForeignKey("evaluations.id"),
        nullable=False
    )

    claim = Column(
        Text,
        nullable=False
    )

    evidence = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False
    )


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    filename = Column(
        String(255),
        nullable=False
    )

    total_questions = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User"
    )

    questions = relationship(
        "DatasetQuestion",
        back_populates="dataset",
        cascade="all, delete-orphan"
    )


class DatasetQuestion(Base):
    __tablename__ = "dataset_questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    dataset_id = Column(
        Integer,
        ForeignKey("datasets.id"),
        nullable=False
    )

    question = Column(
        Text,
        nullable=False
    )

    context = Column(
        Text,
        nullable=False
    )

    reference_answer = Column(
        Text,
        nullable=False
    )

    dataset = relationship(
        "Dataset",
        back_populates="questions"
    )