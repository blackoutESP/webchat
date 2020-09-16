import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-webchat',
  templateUrl: './webchat.component.html',
  styleUrls: ['./webchat.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WebchatComponent implements OnInit {

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
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
    this.messageInput.nativeElement.focus();
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
            }else {
              this.messages.push(msg);
            }
            // document.querySelector('.mat-tab-body-content').scrollTop = document.querySelector('.mat-tab-body-content').scrollHeight;
            this.scroll();
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
    if (event.tab.textLabel !== 'Room') {
      this.ip = event.tab.textLabel;
    } else {
      this.ip = '';
    }
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
      host: this.ip || '',
      localAddress: this.localAddress
    };
    if (wsMessage.host) {
      this.privateMessages.push(wsMessage);
    }
    this.sendMessage(wsMessage);
  }

  sendMessage(wsMessage): void {
    this.webSocket.send(JSON.stringify(wsMessage));
    this.messageInput.nativeElement.value = '';
    this.messageInput.nativeElement.focus();
  }

  scroll(): void {
    this.viewport.scrollTo({bottom: 0});
  }

}
