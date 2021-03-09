import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  public notifications = new Subject<any>();
  public upLoadnotifications = new Subject<any>();
  constructor() { }

  emitNotificationChanges(value: boolean) {
    this.notifications.next(value);
  }
  emitUploadNotificationChanges(value: boolean) {
    this.upLoadnotifications.next(value);
  }
}
