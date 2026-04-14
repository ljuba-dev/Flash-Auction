import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Toast} from '../../interfaces/toast';

@Injectable({
  providedIn: 'root'
})

export class SharedToastService {
  private dataSource = new BehaviorSubject<Toast>({
    show: false,
    type: 'success'
  });
  data$ = this.dataSource.asObservable();

  updateData(value: Toast) {
    this.dataSource.next(value);
  }

}
