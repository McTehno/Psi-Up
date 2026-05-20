from typing import Any, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """
    Shema za podrobnosti napake.

    Uporablja se za enoten prikaz napak na frontendu.
    """

    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """
    Enotna shema za error response.
    """

    success: bool = False
    error: ErrorDetail