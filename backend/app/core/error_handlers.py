from typing import Any, Dict, Optional

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def build_error_response(
    code: str,
    message: str,
    details: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Zgradi enotno obliko error response-a za frontend.
    """

    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details,
        },
    }


def get_error_code_by_status(status_code: int) -> str:
    """
    Vrne interni error code glede na HTTP status code.
    """

    mapping = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        500: "INTERNAL_SERVER_ERROR",
    }

    return mapping.get(status_code, "ERROR")


async def http_exception_handler(
    request: Request,
    exc: HTTPException
) -> JSONResponse:
    """
    Obravnava HTTPException napake.

    Te napake so večinoma pričakovane, na primer:
    - uporabnik ni najden,
    - učna enota ni najdena,
    - napačen content_type.
    """

    message = exc.detail

    if not isinstance(message, str):
        message = "Prišlo je do napake pri obdelavi zahteve."

    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_response(
            code=get_error_code_by_status(exc.status_code),
            message=message,
            details=None,
        ),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Obravnava napake pri validaciji vhodnih podatkov.

    Primer:
    - manjka obvezno polje,
    - napačen tip podatka,
    - napačen format emaila.
    """

    details = []

    for error in exc.errors():
        location = error.get("loc", [])
        field_path = ".".join(str(item) for item in location if item != "body")

        details.append({
            "field": field_path,
            "message": error.get("msg"),
            "type": error.get("type"),
        })

    return JSONResponse(
        status_code=422,
        content=build_error_response(
            code="VALIDATION_ERROR",
            message="Poslani podatki niso pravilni. Preveri obvezna polja in tipe podatkov.",
            details=details,
        ),
    )


async def unexpected_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Obravnava nepričakovane napake.

    Internih podrobnosti napake ne vračamo uporabniku,
    ker so namenjene samo backend debugiranju.
    """

    return JSONResponse(
        status_code=500,
        content=build_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="Prišlo je do nepričakovane napake na strežniku. Poskusi ponovno kasneje.",
            details=None,
        ),
    )