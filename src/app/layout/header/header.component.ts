import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {NotificationsService} from "../../services/notifications.service";
import {UtilsService} from "../../services/utils.service";

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

  constructor(private utilService: UtilsService, private router: Router, private notificationService: NotificationsService) {
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
    this.getDownStreamPortals();
    this.notificationService.notifications.subscribe((value) => {
      console.log(value);
      if (value) {
        if (this.notifications.length === 0 && this.uploadNotifications.length === 0) {
          document.getElementById("openModalButton").click();
        }
        this.notifications = [];
        this.notifications.push(value);
      }
    });

    this.notificationService.upLoadnotifications.subscribe((value) => {

      if (value) {
        if (this.notifications.length === 0 && this.uploadNotifications.length === 0) {
          document.getElementById("openModalButton").click();
        }
        this.uploadNotifications = [];
        this.uploadNotifications.push(value);
      }
    });
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
        return this.upStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoURL;
      } else if (type === 'down') {
        return this.downStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoURL;

      }
    }
    return null;
  }
}
