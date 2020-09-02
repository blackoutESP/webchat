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
      console.log(this.wssMessage);
    }
  }

  sendPrivateMsg(ip): void {
    this.wssMessage.host = ip || null;
    console.log(this.wssMessage);
    const webSocket = new WebSocket(`ws://${ip}:8080/`);
    webSocket.onopen = () => {
      if (webSocket.readyState === 1 && webSocket.OPEN) {
        webSocket.send(JSON.stringify(this.wssMessage));
      }
    };
  }
}
