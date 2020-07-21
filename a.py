import time
from threading import Timer, Event, Thread


import random
import websocket


msg_list = []

def push_msg(msg):
    # global msg_list

    # lock = threading.Lock()
    # lock.acquire()
    msg_list.append(msg)
    # lock.release()



class MsgThread(Thread):
    def __init__(self):
        super(MsgThread, self).__init__()

    def run(self):
        for i in range(1000):
            push_msg(str(i))
            time.sleep(.5)
            print('msg:', msg_list)


class HeartbeatThread(Thread):
    """心跳"""

    def __init__(self, event, ws):
        super(HeartbeatThread, self).__init__()
        self.event = event
        self.ws = ws

    def run(self):
        while 1:
            # 发送ping包
            self.ws.send('2')
            self.event.wait(timeout=2)


def on_message(ws, message):
    """接收信息"""
    print(message)


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    """请求连接"""
    ws.send("2probe")


def on_emit(ws):
    # 创建心跳线程
    global msg_list
    
    event = Event()
    heartbeat = HeartbeatThread(event, ws)
    heartbeat.start()

    while 1:
        # content = input("input: ")
        # 发送信息
        # 4: engine.io message
        # 2: socket.io event
        # chat message event message

        if msg_list:
            print('send: ', msg_list)
            for i in msg_list:
                ws.send('42["chat message","{0}"]'.format(i))
            msg_list = []
        time.sleep(.2)


if __name__ == "__main__":

    msg = MsgThread()
    msg.start()

    websocket.enableTrace(True)
    # url 格式
    # ws://host:prot/socket.io/?EIO=3&transport=websocket
    ws = websocket.WebSocketApp(
        "ws://127.0.0.1:3000/socket.io/?EIO=3&transport=websocket",
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.on_open = on_open

    t = Timer(3, on_emit, args=(ws,))
    t.start()

    ws.run_forever()

