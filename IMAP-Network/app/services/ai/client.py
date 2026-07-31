"""Shared OpenAI-compatible client + token accounting for the AI layer.

The endpoint is OpenAI-compatible, so the same client talks to real OpenAI or
a proxy such as KKU IntelSphere (set OPENAI_BASE_URL). Instructor patches the
client so `response_model=<PydanticModel>` forces schema-valid JSON with retries.
"""
from __future__ import annotations

from dataclasses import dataclass

import instructor
from openai import OpenAI

from ...config import settings


def raw_client() -> OpenAI:
    """A plain OpenAI client (used for tool-calling / vision message payloads)."""
    if not settings.llm_configured:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add it to .env (see .env.example)."
        )
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
    )


def instructor_client() -> instructor.Instructor:
    """An Instructor-wrapped client for structured output.

    MD_JSON mode asks for a ```json code block and tolerantly extracts the JSON
    from it. This is the portable choice across the OpenAI-compatible proxy:
    Gemini wraps its JSON in markdown fences, Qwen returns it bare — MD_JSON
    handles both, whereas plain JSON mode chokes on Gemini's fences.
    """
    return instructor.from_openai(raw_client(), mode=instructor.Mode.MD_JSON)


@dataclass
class TokenUsage:
    """Accumulates token cost across one or more LLM round-trips."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    llm_calls: int = 0

    def add(self, completion) -> None:
        self.llm_calls += 1
        u = getattr(completion, "usage", None)
        if u:
            self.prompt_tokens += getattr(u, "prompt_tokens", 0) or 0
            self.completion_tokens += getattr(u, "completion_tokens", 0) or 0
            self.total_tokens += getattr(u, "total_tokens", 0) or 0

    def as_dict(self) -> dict:
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "llm_calls": self.llm_calls,
        }
