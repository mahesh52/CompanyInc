import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  userDetails: {};

  constructor(private router: Router) {

  }

  ngOnInit() {
    if (sessionStorage.getItem('user') !== null && sessionStorage.getItem('user') !== undefined
      && sessionStorage.getItem('user') !== '') {
      this.userDetails = JSON.parse(sessionStorage.getItem('user'))[0];
    }
  }

  logout() {
    sessionStorage.setItem('isLoggedIn', 'no');
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}
