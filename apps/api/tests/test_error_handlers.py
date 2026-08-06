"""Reimplement handlers locally for isolated testing to avoid importing the
full application (which initializes DB connections and other heavy deps).
"""

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from pydantic import BaseModel


async def http_exception_handler(request, exc: HTTPException):
    """Convert HTTPExceptions into the API's standard error format."""
    del request

    detail = exc.detail
    if isinstance(detail, dict) and "errors" in detail:
        body = {"errors": detail["errors"]}
    elif isinstance(detail, dict):
        body = {"errors": {"_": [detail]}}
    else:
        body = {"errors": {"_": [str(detail) if detail is not None else ""]}}

    return JSONResponse(status_code=exc.status_code, content=body)


async def validation_exception_handler(request, exc: RequestValidationError):
    """Map FastAPI validation errors into the API's standard error format."""
    del request

    errors: dict[str, list[str]] = {}

    for err in exc.errors():
        loc = err.get("loc", ())
        key = str(loc[-1]) if loc else "_"
        msg = err.get("msg", "Invalid input")
        errors.setdefault(key, []).append(msg)

    return JSONResponse(status_code=400, content={"errors": errors})


def create_test_app() -> FastAPI:
    """Create a minimal FastAPI app for testing exception handlers."""
    app = FastAPI()

    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )

    @app.get("/raise-http-string")
    async def raise_http_string():
        """Raise an HTTPException with a string detail."""
        raise HTTPException(status_code=400, detail="oops")

    @app.get("/raise-http-structured")
    async def raise_http_structured():
        """Raise an HTTPException with a structured error payload."""
        raise HTTPException(
            status_code=404,
            detail={"errors": {"place_id": ["Place not found"]}},
        )

    @app.get("/raise-http-dict")
    async def raise_http_dict():
        """Raise an HTTPException with a dictionary detail."""
        raise HTTPException(
            status_code=400,
            detail={"message": "Invalid request"},
        )

    class Item(BaseModel):
        """Test model used for request body validation."""

        name: str
        qty: int

    @app.post("/validate-body")
    async def validate_body(item: Item):
        """Validate the request body and echo the parsed item."""
        return {"ok": True, "item": item.model_dump()}

    return app


def test_http_exception_string_message() -> None:
    """Ensure string HTTPException details use the standard error format."""
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/raise-http-string")

    assert response.status_code == 400
    assert response.json() == {
        "errors": {
            "_": ["oops"],
        }
    }


def test_http_exception_structured_message() -> None:
    """Ensure structured HTTPException errors are preserved."""
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/raise-http-structured")

    assert response.status_code == 404
    assert response.json() == {
        "errors": {
            "place_id": ["Place not found"],
        }
    }


def test_http_exception_dict_message() -> None:
    """Ensure dictionary HTTPException details are wrapped correctly."""
    app = create_test_app()
    client = TestClient(app)

    response = client.get("/raise-http-dict")

    assert response.status_code == 400
    assert response.json() == {
        "errors": {
            "_": [
                {"message": "Invalid request"},
            ]
        }
    }


def test_request_validation_error_mapping() -> None:
    """Ensure request validation errors are mapped to the API error format."""
    app = create_test_app()
    client = TestClient(app)

    response = client.post("/validate-body", json={})

    assert response.status_code == 400
    assert response.json() == {
        "errors": {
            "name": ["Field required"],
            "qty": ["Field required"],
        }
    }
