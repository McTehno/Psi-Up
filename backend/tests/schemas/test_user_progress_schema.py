from app.schemas.user_progress_schema import (
    CompleteContentRequest,
    CurrentPositionResponse,
    FavoriteContentRequest,
    SaveContentRequest,
    UpdateCurrentPositionRequest,
    UserProgressCreateRequest,
    UserProgressResponse,
)


def test_user_progress_response_maps_mongodb_id_to_id():
    # Preverimo, da shema pravilno pretvori MongoDB _id v API polje id.
    progress = UserProgressResponse(
        _id="progress_001",
        user_id="user_001",
    )

    assert progress.id == "progress_001"


def test_user_progress_response_uses_default_empty_lists():
    # Nov user progress mora imeti prazne sezname za vse skupine vsebin.
    progress = UserProgressResponse(
        _id="progress_001",
        user_id="user_001",
    )

    assert progress.saved_learning_paths == []
    assert progress.saved_modules == []
    assert progress.saved_learning_units == []
    assert progress.favorite_learning_paths == []
    assert progress.favorite_modules == []
    assert progress.favorite_learning_units == []
    assert progress.completed_learning_paths == []
    assert progress.completed_modules == []
    assert progress.completed_learning_units == []
    assert progress.current_positions == []


def test_current_position_response_accepts_partial_position():
    # Trenutna pozicija lahko vsebuje samo učno pot in modul.
    position = CurrentPositionResponse(
        learning_path_id="up_001",
        current_module_id="mod_001",
    )

    assert position.learning_path_id == "up_001"
    assert position.current_module_id == "mod_001"
    assert position.current_learning_unit_id is None


def test_user_progress_create_request_accepts_user_id():
    # Ustvarjanje user progress zapisa potrebuje lokalni user_id.
    request = UserProgressCreateRequest(
        user_id="user_001",
    )

    assert request.user_id == "user_001"


def test_save_favorite_complete_requests_have_same_basic_shape():
    # Save, favorite in complete requesti uporabljajo content_id in content_type.
    # user_id ne pošiljamo v body, ker ga backend pridobi iz prijavljenega uporabnika.
    save_request = SaveContentRequest(
        content_id="ue_001",
        content_type="learning_unit",
    )
    favorite_request = FavoriteContentRequest(
        content_id="ue_001",
        content_type="learning_unit",
    )
    complete_request = CompleteContentRequest(
        content_id="ue_001",
        content_type="learning_unit",
    )

    assert save_request.content_id == "ue_001"
    assert save_request.content_type == "learning_unit"

    assert favorite_request.content_id == "ue_001"
    assert favorite_request.content_type == "learning_unit"

    assert complete_request.content_id == "ue_001"
    assert complete_request.content_type == "learning_unit"


def test_update_current_position_request_accepts_position_data():
    # Trenutna pozicija ne vsebuje user_id v bodyju.
    # Backend uporabnika določi iz JWT tokena.
    request = UpdateCurrentPositionRequest(
        learning_path_id="up_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    assert request.learning_path_id == "up_001"
    assert request.current_module_id == "mod_001"
    assert request.current_learning_unit_id == "ue_001"