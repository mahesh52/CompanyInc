import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {NotificationsService} from "../../services/notifications.service";
import {UtilsService} from "../../services/utils.service";
import {ToasterService} from "../../common/toaster.service";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  userDetails: {};
  currentUrl: string;
  isOpenNotifications = true;
  notifications = [];
  uploadNotifications = [];
  upStreamPortals: any;
  downStreamPortals: any;
  stopNotificationDownload = false;
  stopNotificationUpload = false;

  constructor(private user: UsersService, private toaster: ToasterService, private utilService: UtilsService, private router: Router, private notificationService: NotificationsService) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
  }

  ngOnInit() {
    this.currentUrl = this.router.url.split('?')[0];
    if (sessionStorage.getItem('userDetails') !== null && sessionStorage.getItem('userDetails') !== undefined
      && sessionStorage.getItem('userDetails') !== '') {
      this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    }
    this.user.userInfo.subscribe((value) => {
      this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    });
   // this.getDownStreamPortals();
    // this.notificationService.notifications.subscribe((value) => {
    //   console.log(value);
    //   if (value) {
    //     if (this.notifications.length === 0 && this.uploadNotifications.length === 0) {
    //       document.getElementById("openModalButton").click();
    //     }
    //     this.notifications = [];
    //       this.notifications.push(value);
    //     if (value.percentFinish == 100) {
    //       this.stopNotificationDownload = false;
    //       this.toaster.show('success', 'Download', 'Your download is completed please refresh the table to see updated products');
    //       setTimeout((item) => {
    //         this.notifications = [];
    //         if(this.uploadNotifications.length === 0){
    //           document.getElementById("openModalButton").click();
    //         }
    //       }, 3000);
    //     }
    //   }
    // });

    // this.notificationService.upLoadnotifications.subscribe((value) => {
    //
    //   if (value) {
    //     if (this.notifications.length === 0 && this.uploadNotifications.length === 0) {
    //       document.getElementById("openModalButton").click();
    //     }
    //     this.uploadNotifications = [];
    //       this.uploadNotifications.push(value);
    //
    //
    //
    //     if (value.percentFinish == 100) {
    //       this.stopNotificationUpload = false;
    //       this.toaster.show('success', 'Upload', 'Your upload is completed please refresh the table to see updated products');
    //       setTimeout((item) => {
    //         if(this.notifications.length === 0){
    //           document.getElementById("openModalButton").click();
    //         }
    //         this.uploadNotifications = [];
    //       }, 3000);
    //     }
    //   }
    // });
  }

  stopNotifications() {
    this.stopNotificationDownload = true;
    this.notifications = [];
    this.notificationService.emitStopNotificationChanges(true);
    if (this.uploadNotifications.length === 0) {
      document.getElementById("openModalButton").click();
    }
  }

  stopNotificationsUpload() {
    this.stopNotificationUpload = true;
    this.uploadNotifications = [];
    this.notificationService.emitStopUploadNotificationChanges(true);
    if (this.notifications.length === 0) {
      document.getElementById("openModalButton").click();
    }
  }

  getUpStreamPortals() {
    this.utilService.getUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
      this.getUpStreamPortals();
    }, error => {
      console.log('Error while getting the downstream portals');
      console.log(error);
    });
  }

  logoutUser() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }

  getPortalUrl(portalId, type) {
    if (portalId && portalId !== 'null') {
      if (type === 'up') {
        return this.upStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoIconURL;
      } else if (type === 'down') {
        return this.downStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoIconURL;

      }
    }
    return null;
  }
}
