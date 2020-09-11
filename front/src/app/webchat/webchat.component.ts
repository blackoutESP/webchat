import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-webchat',
  templateUrl: './webchat.component.html',
  styleUrls: ['./webchat.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WebchatComponent implements OnInit {

  @ViewChild('message') messageInput: ElementRef;
  webSocket: WebSocket;
  localAddress = '';
  ip: string;
  ips = [];
  nickname: string;
  timestamp: string;
  message: string;
  host: string;
  messages = [];
  privateMessages = [];
  constructor() {

  }

  ngOnInit(): void {
    this.setNickname();
    this.connect();
  }

  connect(): void {
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
          if (this.localAddress === '') {
            this.localAddress = this.ips[this.ips.length - 1];
          }
          if (data.message) {
            const msg = JSON.parse(data.message);
            if (msg.host === this.localAddress) {
              this.privateMessages.push(msg);
              console.log(this.privateMessages);
            }else {
              this.messages.push(msg);
            }
          }
        };
      }
    };
    this.webSocket.onclose = (event) => {
      console.log(`Socket closed. Reason: ${event.reason}`);
      setTimeout(() => { this.connect(); }, 1000);
    };
    this.webSocket.onerror = (error) => {
      console.log(`Error: ${error}`);
      this.webSocket.close();
    };
  }

  setNickname(): void {
    this.nickname = prompt('Nickname: ');
  }

  setIp(event): void {
    this.ip = this.ips[event.index - 1] || '';
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
      // const li = document.createElement('li');
      // const t = document.createTextNode(` (${wsMessage.timestamp}) `);
      // const n = document.createTextNode(` ${wsMessage.nickname}: `);
      // const m = document.createTextNode(` ${wsMessage.message} `);
      // const h = document.createTextNode(` [ destination: ${wsMessage.host} ]`);
      // li.appendChild(h);
      // li.appendChild(t);
      // li.appendChild(n);
      // li.appendChild(m);
      // document.querySelector('#messagesList').appendChild(li);
    }
  }

}
