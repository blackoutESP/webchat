import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-webchat',
  templateUrl: './webchat.component.html',
  styleUrls: ['./webchat.component.css']
})
export class WebchatComponent implements OnInit {

  @ViewChild('message') messageInput: ElementRef;
  webSocket: WebSocket;
  ips = [];
  ip: string;
  nickname: string;
  timestamp: string;
  message: string;
  host: string;
  messages = [];
  constructor() { }

  ngOnInit(): void {
    this.setNickname();
    this.webSocket = new WebSocket('ws://192.168.1.42:8080/');
    this.webSocket.onopen = () => {
      if (this.webSocket.readyState === 1 && this.webSocket.OPEN) {
        this.webSocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.ips) {
            this.ips = [];
            for (let i = 0; i < data.ips.length; i++) {
              this.ips.push(data.ips[i].split(':')[3]);
            }
          }
          if (data.message) {
            console.log(JSON.parse(data.message));
            this.messages.push(JSON.parse(data.message));
            console.log(this.messages);
          }
        };
      }
    };
  }

  setNickname(): void {
    this.nickname = prompt('Enter your nickname');
  }

  setIp(ip: string): void {
    this.ip = ip || '';
  }

  buildUsersList(): void {

  }

  onKey(event): void {
    if (event.keyCode !== 13) {
      this.message = event.target.value;
    } else {
      this.buildMessage(this.message);
    }
  }

  buildMessage(msg): void {
    const wsMessage = {
      nickname: this.nickname,
      timestamp: new Date().toString().split(' ')[4],
      message: msg,
      host: this.ip || ''
    };
    console.log(wsMessage);
    this.sendMessage(wsMessage);
  }

  sendMessage(wsMessage): void {
    this.webSocket.send(JSON.stringify(wsMessage));
    this.messageInput.nativeElement.value = '';
    if (wsMessage.host !== '') {
      const li = document.createElement('li');
      const t = document.createTextNode(` (${wsMessage.timestamp}) `);
      const n = document.createTextNode(` ${wsMessage.nickname}: `);
      const m = document.createTextNode(` ${wsMessage.message} `);
      const h = document.createTextNode(` [ destination: ${wsMessage.host} ]`);
      li.appendChild(h);
      li.appendChild(t);
      li.appendChild(n);
      li.appendChild(m);
      document.querySelector('#messagesList').appendChild(li);
    }
  }

}
