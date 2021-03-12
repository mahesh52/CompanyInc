import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  public notifications = new Subject<any>();
  public stopnotifications = new Subject<any>();
  public upLoadnotifications = new Subject<any>();
  public stopupLoadnotifications = new Subject<any>();
  constructor() { }

  emitNotificationChanges(value: boolean) {
    this.notifications.next(value);
  }
  emitStopNotificationChanges(value: boolean) {
    this.stopnotifications.next(value);
  }
  emitStopUploadNotificationChanges(value: boolean) {
    this.stopupLoadnotifications.next(value);
  }
  emitUploadNotificationChanges(value: boolean) {
    this.upLoadnotifications.next(value);
  }
}
