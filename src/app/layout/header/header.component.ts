import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  userDetails: {};
  currentUrl: string;
  constructor(private router: Router) {
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
  }

  logoutUser() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}
