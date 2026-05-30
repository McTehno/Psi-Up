import json
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]

DATA_DIR_CANDIDATES = [
    BACKEND_ROOT / "data" / "nova_verzija_data",
    BACKEND_ROOT / "data" / "mongodb",
]


def get_data_dir() -> Path:
    # Podpiramo novo in starejšo mapo z JSON podatki.
    for data_dir in DATA_DIR_CANDIDATES:
        if data_dir.exists():
            return data_dir

    raise FileNotFoundError(
        "Mapa z JSON podatki ni najdena. Pričakovana pot je "
        "backend/data/nova_verzija_data ali backend/data/mongodb."
    )


def load_json_file(file_name: str):
    # JSON datoteke beremo prek helper funkcije, da se pot ne ponavlja v testih.
    file_path = get_data_dir() / file_name

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_document_id(document: dict) -> str:
    # V MongoDB podatkih uporabljamo _id.
    return document["_id"]