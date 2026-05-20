from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserResponse(BaseModel):
    """
    Shema za uporabniški profil v aplikaciji.

    Registracija in prijava se izvajata prek zunanjega orodja
    kot je Firebase, Auth0 ali podobna rešitev.
    Backend ne hrani gesel.
    """

    id: str = Field(alias="_id")
    auth_provider: Optional[str] = None
    auth_user_id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(populate_by_name=True)


class UserCreateRequest(BaseModel):
    """
    Shema za ustvarjanje uporabniškega profila v naši aplikaciji.

    Ta request se uporabi po uspešni prijavi prek zunanjega auth sistema.
    Backend prejme zunanji ID uporabnika in ustvari lokalni profil.
    """

    auth_provider: Optional[str] = None
    auth_user_id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserUpdateRequest(BaseModel):
    """
    Shema za posodobitev uporabniškega profila v aplikaciji.

    Ne uporablja se za spremembo gesla, ker gesla upravlja zunanji auth sistem.
    """

    name: Optional[str] = None
    email: Optional[EmailStr] = None