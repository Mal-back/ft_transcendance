from channels.generic.websocket import WebsocketConsumer

class PracticeConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        print("Consumer connection accepted")
    
    def receive(self, text_data=None, bytes_data=None, **kwargs):
        if text_data == 'PING':
            self.send('PONG')