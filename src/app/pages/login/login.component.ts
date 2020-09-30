import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {
  }
  signUp(){
    this.router.navigate(['register']);
  }
  login(){
    this.router.navigate(['home']);
  }
}
