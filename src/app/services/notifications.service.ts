import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  public notifications = new Subject<any>();
  constructor() { }

  emitNotificationChanges(value: boolean) {
    this.notifications.next(value);
  }
}
