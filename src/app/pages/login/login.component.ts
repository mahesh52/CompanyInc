import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router,private userService:UsersService) { }
  username = '';
  password = '';
  loginError = '';
  ngOnInit() {
  }
  signUp(){
    this.router.navigate(['register']);
  }
  login(){
   let  username = this.username;
    let  password = this.password;
    if(username !== '' && password !== ''){
      const user = this.userService.users.filter(function (item) {
        return item.username === username && item.password === password
      })
      if(user.length > 0){
        sessionStorage.setItem('isLoggedIn', 'yes');
        sessionStorage.setItem('user',JSON.stringify(user));
        this.router.navigate(['home']);
      } else {
        this.loginError = 'Invalid username or password';
      }
    } else {
      this.loginError = 'Please enter username/password';
    }

  }
}
