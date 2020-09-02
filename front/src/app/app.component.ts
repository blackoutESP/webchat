import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'WebChat';
  ws: WebSocket;
  wssMessage: any;
  timer = 0;
  interval = 1000;
  nickname = '';
  message = '';
  timestamp = '';
  typing: boolean;
  ips = [];
  ip: string;
  constructor() {

  }

  ngOnInit(): void {
    this.setNickname();
    try{
      this.ws = new WebSocket('ws://127.0.0.1:8080/');
    }catch(e){
      console.error(e);
    }finally{
      this.ws.onmessage = (message) => {
        if (typeof JSON.parse(message.data) === 'object') {
          this.ips = [];
          const data = JSON.parse(message.data);
          for (let i = 0; i < data.length; i++){
            this.ips.push(data[i].split(':')[3]);
          }
        } else {
          console.log(JSON.parse(message.data));
        }
      };
    }
  }

  setNickname(): void {
    this.nickname = 'Alex';
  }

  onKey(event): void {
    if (event.keyCode !== 13) {
      this.timestamp = new Date().toString().split(' ')[4];
      this.message = `${this.nickname} is typping...`;
      this.typing = true;
    } else {
      this.timestamp = new Date().toString().split(' ')[4];
      this.message = event.target.value;
      this.typing = false;
      this.wssMessage = {
        nickname: this.nickname,
        timestamp: this.timestamp,
        message: this.message,
        typing: this.typing,
        host: null
      };
      // if (Object.values(this.wssMessage).length > 0) {

      // }
      this.openWs().then((socket: WebSocket) => {
        if (socket.readyState === 1 && socket.OPEN) {
          socket.send(JSON.stringify(this.wssMessage));
        }else {
          console.log('unable to send data');
        }
      }).catch(e => console.error(e));
    }
  }

  setIp(ip: string): void {
    this.ip = ip;
    this.wssMessage.host = ip;
  }

  openWs(): Promise<any> {
    return new Promise((resolve, reject) => {
      const webSocket = new WebSocket(`ws://${this.ip}:8080/`);
      webSocket.onopen = () => {
        if (webSocket.readyState === 1 && webSocket.OPEN) {
          resolve(webSocket);
        } else {
          reject(new Error('cannot open ws'));
        }
      };
    });
  }
}
