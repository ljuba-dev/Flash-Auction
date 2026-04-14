import {Bid} from './bid';
import {Item} from './item';

export interface ItemBidsResponse {
  data: {
    item: Item;
    bids: Bid[];
  };
}
