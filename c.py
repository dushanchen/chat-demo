from socket import *
import concurrent.futures as futures


class TCPClient:
    def __init__(self, host='192.168.55.50', port=8117):
        self.HOST = host
        self.PORT = port
        self.BUFSIZ = 1024
        self.ADDRESS = (self.HOST, self.PORT)
        self.tcpClientSocket = socket(AF_INET, SOCK_STREAM)
        self.tcpClientSocket.connect(self.ADDRESS)

    def send(self, msg):
        """
        向服务器端发送信息
        :param msg:
        :return:
        """
        self.tcpClientSocket.send(msg.encode('utf-8'))

    def receive(self):
        try:
            while True:
                data = self.tcpClientSocket.recv(self.BUFSIZ)
                if not data:
                    break
                print("接收到服务器端消息：{}".format(data.decode('utf-8')))
        finally:
            print("连接已断开！")
            self.tcpClientSocket.close()


def main():
    ex = futures.ThreadPoolExecutor(max_workers=1)
    tc = TCPClient()
    ex.submit(tc.receive)

    while True:
        data = input('>')
        if not data:
            print("连接已断开！")
            tc.tcpClientSocket.close()
            break
        tc.send(data)


main()
