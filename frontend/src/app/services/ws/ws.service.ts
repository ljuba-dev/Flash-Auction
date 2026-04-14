import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {WsMessage} from '../../interfaces/ws.message';
import {WS_MESSAGES_TYPE} from '../../ws.messages.type';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  constructor(private socket: Socket) {
  }

  connect() {
    this.socket.connect();
  }
  isConnected() {
    return this.socket.ioSocket.active;
  }
  sendMessage(message: WsMessage) {
    this.socket.emit('message', message);
  }
  onMessage(type: WS_MESSAGES_TYPE, callback: (message: WsMessage) => void) {
    this.socket.on(WS_MESSAGES_TYPE[type], callback);

  }
  disconnect() {
    this.socket.disconnect();
    this.socket.ioSocket.disconnect();
  }
}
