import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'WebChat';
  ws: WebSocket;
  wsMessage: object;
  timer = 0;
  interval = 1000;
  nickname = '';
  message = '';
  timestamp = '';
  typing: boolean;
  ips = [];
  constructor() {

  }

  ngOnInit(): void {
    this.setNickname();
    try {
      this.ws = new WebSocket('ws://127.0.0.1:8080');
    }catch(e){
      console.error(e);
    }
    this.ws.onmessage = (msg) => {
      let data = JSON.parse(msg.data);
      if (!data.message) {
        data.forEach(ip => {
          this.ips.push(ip);
        });
      }
    };
  }

  onKey(event): void {
    if (event.keyCode !== 13) {
      this.message = event.target.value;
      this.typing = true;
      this.wsMessage = {
        nickname: this.nickname,
        message: `${this.nickname} is typing...`,
        timestamp: null,
        typing: this.typing
      };
      this.ws.send(JSON.stringify(this.wsMessage));
    } else {
      this.message = event.target.value;
      this.typing = false;
      this.wsMessage = {
        nickname: this.nickname,
        message: this.message,
        timestamp: null,
        typing: this.typing
      };
      this.ws.send(JSON.stringify(this.wsMessage));
    }
  }

  notify(): void {
    this.typing = false;
    this.wsMessage = {
      nickname: this.nickname,
      message: `${this.nickname} stopped typing...`,
      timestamp: null,
      typing: this.typing
    };
    this.ws.send(JSON.stringify(this.wsMessage));
  }

  sendMessage(): void {
    this.timestamp = new Date().toString().split(' ')[4];
    this.wsMessage = {
      nickname: this.nickname,
      message: this.message,
      timestamp: this.timestamp,
      typing: this.typing
    };
    this.ws.send(JSON.stringify(this.wsMessage));
  }

  setNickname(): void {
    this.nickname = 'Alex'; // prompt('Enter your nickname: ');
  }
}
