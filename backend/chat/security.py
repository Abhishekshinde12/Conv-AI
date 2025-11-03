from channels.db import database_sync_to_async
from authapp.models import MyUser
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from urllib.parse import parse_qs
import jwt

# Import Simple JWT's default settings
from rest_framework_simplejwt.settings import api_settings

@database_sync_to_async
def get_user(user_id):
    """
    Asynchronously retrieves a user from the database.
    Returns AnonymousUser if the user does not exist or the ID is invalid.
    """
    try:
        # Your MyUser model correctly uses a UUID primary key
        return MyUser.objects.get(id=user_id)
    except (MyUser.DoesNotExist, ValueError, TypeError):
        # Handles cases where user doesn't exist or ID is not a valid UUID
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom middleware that authenticates a user via a JWT access token
    from the query string, respecting djangorestframework-simplejwt settings.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            try:
                # --- THIS IS THE FIX ---
                # 1. Use the signing key that Simple JWT is configured to use
                signing_key = api_settings.SIGNING_KEY

                # 2. Use the algorithm that Simple JWT is configured to use
                algorithm = api_settings.ALGORITHM

                payload = jwt.decode(token, signing_key, algorithms=[algorithm])
                
                # 3. Use the user ID claim that Simple JWT is configured to use
                user_id_claim = api_settings.USER_ID_CLAIM
                user_id = payload.get(user_id_claim)

                if user_id:
                    scope['user'] = await get_user(user_id)
                else:
                    scope['user'] = AnonymousUser()

            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                # Token is invalid or expired
                scope['user'] = AnonymousUser()
        else:
            # No token was provided
            scope['user'] = AnonymousUser()

        return await self.app(scope, receive, send)