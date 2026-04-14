import {Component, ElementRef, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BID, API_ITEM_BY_ID, API_ITEMS} from '../../api.routes';
import {WsService} from '../../services/ws/ws.service';
import {SharedToastService} from '../../services/shared/shared.toast.service';
import {Toast} from '../../interfaces/toast';
import {Item} from '../../interfaces/item';
import {ItemBidsResponse} from '../../interfaces/item-bids-response';
import {ItemsResponse} from '../../interfaces/items-response';
import {DatePipe, DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {WsHandlers} from '../../services/ws/ws.handlers';

@Component({
  selector: 'app-items',
  imports: [
    DecimalPipe,
    RouterLink,
    DatePipe
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent implements OnInit {

  constructor(private http: HttpClient, private wsService: WsService, private sharedToastService: SharedToastService, private wsHandlers: WsHandlers) {}
  @ViewChild('bidModal') modal!: ElementRef<HTMLDialogElement>;
  _selectedItem: WritableSignal<Item | null> = signal(null);
  _items: WritableSignal<any[]> = signal([]);
  _bidAmount: WritableSignal<number> = signal(0);
  _itemBids: WritableSignal<any[]> = signal([]);
  _topBids: WritableSignal<any[]> = signal([]);
  createdByYou = false;
  getItemBids(item_id: number) {
    this.http.get<ItemBidsResponse>(API_ITEM_BY_ID + `/${item_id}`).subscribe( (response) => {
      this._selectedItem.set(response.data.item);
      this._itemBids.set(response.data.bids);
    });
  }

  openModal(item:Item) {
    this.getItemBids(item.id);
    this._bidAmount.set(item.current_bid);
    this.modal.nativeElement.showModal();
  }
  updateBidAmount(event: Event) {
    const element = event.target as HTMLInputElement;
    this._bidAmount.set(parseInt(element.value));
  }
  bid() {
    this.http.post(API_BID, {
      item_id: this._selectedItem()?.id,
      bid_amount: this._bidAmount(),
    }).pipe(
      catchError((error) => {
        this.modal.nativeElement.close();
        const showData:Toast = {
          show: true,
          type: 'error',
          message: `Too low of ${this._bidAmount()}$ on item "${this._selectedItem()?.name}"`
        }
        this.createdByYou = true;
        this.sharedToastService.updateData(showData);

        return throwError(() => null);

      })
    ).subscribe(
      (response) => {
        this.modal.nativeElement.close();
      }
    );
  }
  ngOnInit() {
    this.http.get<ItemsResponse>(API_ITEMS).subscribe( (response) => {
      this._items.set(response.data);
    });
    this.wsHandlers.updateItems.subscribe((message) => {
      if(message?.payload?.item_id){
        this._items.update(items =>
          items.map((item) => {
            if(item.id === message.payload.item_id) {
              item.current_bid = message.payload.bid_amount;
            }
            return item;
          })
        );
        if(this.createdByYou) {
          const showData: Toast = {
            show: true,
            type: 'success',
            message: `New bid of ${message.payload.bid_amount}$ on item "${this._selectedItem()?.name}"`
          }
          this.sharedToastService.updateData(showData);
          this.createdByYou = false;
        }
      }
    })
    this.wsHandlers.setTopBids.subscribe((message) => {
      if(message?.payload?.length > 0) {
        this._topBids.set(message.payload);
      }
    })
    this.wsHandlers.updateTopBids.subscribe((message) => {
      if(message?.payload?.length > 0) {
        this._topBids.set(message.payload);
      }
    })
  }
}
