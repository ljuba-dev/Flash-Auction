import {Injectable} from '@angular/core';
import {WsService} from './ws.service';
import {WS_MESSAGES_TYPE} from '../../ws.messages.type';
import {SharedToastService} from '../shared/shared.toast.service';
import {WsMessage} from '../../interfaces/ws.message';
import {Toast} from '../../interfaces/toast';
import {BehaviorSubject} from 'rxjs';

@Injectable(
  {providedIn: 'root'}
)
export class WsHandlers {

  constructor(private wsService: WsService, private sharedToastService: SharedToastService,) {
    if( this.wsService.isConnected()) {
      this.wsService.connect()
    }
  }
  public updateItems = new BehaviorSubject<WsMessage>({});
  public updateTopBids = new BehaviorSubject<WsMessage>({});
  public setTopBids = new BehaviorSubject<WsMessage>({});
  stopHandling() {
    this.wsService.disconnect();

  }
  startHandling() {
    this.wsService.onMessage(WS_MESSAGES_TYPE.CONNECTION, (message: WsMessage) => {
      const showData:Toast = {
        show: true,
        type: 'info',
        message: `${message.payload?.message}`
      }
      this.sharedToastService.updateData(showData);
    });
    this.wsService.onMessage(WS_MESSAGES_TYPE.TOP_BIDS, (message: WsMessage) => {
      this.setTopBids.next(message);
    })
    this.wsService.onMessage(WS_MESSAGES_TYPE.NEW_BID, (message) => {
      this.updateItems.next(message);
    });
    this.wsService.onMessage(WS_MESSAGES_TYPE.TOP_BIDS_UPDATED, (message) => {
      this.updateTopBids.next(message);
    })
  }
}
