import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {SharedToastService} from '../../../services/shared/shared.toast.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [
    NgClass
  ],
  templateUrl: './toast.component.html',
})
export class ToastComponent implements OnInit {
   _toastMessage: WritableSignal<string> = signal('');
   _showToast: WritableSignal<boolean> = signal(false);
   _toastType: WritableSignal<string> = signal('success');

  constructor(private sharedToastService: SharedToastService) {}


  ngOnInit() {
    this.sharedToastService.data$.subscribe((value) => {
      this._showToast.set(value.show);
      this._toastMessage.set(value.message || '');
      this._toastType.set(value.type || 'success');
      setTimeout(() => {
        this._showToast.set(false);
      }, 5000);
    });
  }
}
