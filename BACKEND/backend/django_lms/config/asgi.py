"""ASGI config for the LMS project."""

import os
from django.core.asgi import get_asgi_application

# 1. Set the default settings environment module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

# 2. Initialize the standard HTTP ASGI application first (this loads the App Registry!)
django_asgi_app = get_asgi_application()

# 3. NOW it is safe to import Channels and your local routing modules
from channels.routing import ProtocolTypeRouter, URLRouter
from config.routing import websocket_urlpatterns

# 4. Define the root routing configuration
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": URLRouter(websocket_urlpatterns),
    }
)