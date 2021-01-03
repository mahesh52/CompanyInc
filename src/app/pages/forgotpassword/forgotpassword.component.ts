import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {UsersService} from "../../services/users.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.sass']
})
export class ForgotpasswordComponent implements OnInit {
  loginError: string = '';
  loading = false;
  username = '';
  password = '';
  code = '';
  loginForm: FormGroup;
  isCodeReceived = false;
  message='';
  constructor(private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private auth: AuthService) {

  }

  ngOnInit() {
  }

  forgotPassword() {
    if (this.username) {
      this.loading = true;
      this.auth.forgotPassword(this.username)
        .subscribe(
          result => {
            this.isCodeReceived = true;
            this.message = 'Verification code sent to '+ result.CodeDeliveryDetails.Destination;
            this.loading = false;
          },
          error => {
            console.log(error);
            this.loginError = error.message;
            this.message = '';
            this.loading = false;
          });
    }
  }
  forgotPasswordSubmit(){
    if (this.username && this.code && this.password) {
      this.loading = true;
      this.auth.forgotPasswordSubmit(this.username,this.code,this.password)
        .subscribe(
          result => {
            this.router.navigateByUrl('/login');
          },
          error => {
            console.log(error);
            this.loginError = error.message;
            this.loading = false;
            this.message = '';
          });
    }
  }
}
