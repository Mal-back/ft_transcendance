from channels.routing import ChannelNameRouter, ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack
from django.conf.urls import url

from game_app.consumers import PracticeConsumer

application = ProtocolTypeRouter(
    {
        "websocket": SessionMiddlewareStack(URLRouter([url(r"^ws/game/$", PracticeConsumer)])),
        # "channel": ChannelNameRouter({"game_engine": GameConsumer}),
    }
)