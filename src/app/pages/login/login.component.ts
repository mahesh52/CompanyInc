import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UsersService} from "../../services/users.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {PasswordStrengthValidator} from "../register/password-strength.validators";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  constructor(private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required]
    })
  }

  loginError: string = '';
  loading = false;
  username = '';
  password = '';
  loginForm: FormGroup;

  ngOnInit() {
  }

  signUp() {
    this.router.navigate(['register']);
  }

  login() {
    this.loading = true;
    this.auth.signIn(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe(
        result => {
          //    this.auth.getLoginUser();
          console.log(result);
          this.user.isUserLoggedIn = true;
          const tokenDetails = {
            idToken: result.signInUserSession.idToken.jwtToken,
            accessToken: result.signInUserSession.accessToken.jwtToken,
            refreshToken: result.signInUserSession.refreshToken.token
          }
          this.user.tokenDetails = tokenDetails;
          this.loading = false;
          sessionStorage.setItem('auth', JSON.stringify(tokenDetails));
          this.router.navigateByUrl('/portals')
        },
        error => {
          console.log(error);
          this.loginError = error.message;
          this.loading = false;
        });
  }

  loginWithFb() {
    window.location.href = environment.cognitoUrl + '/oauth2/authorize?identity_provider=Facebook&redirect_uri=' + environment.redirectUri + '&response_type=CODE&client_id=' + environment.amplify.Auth.userPoolWebClientId + '&scope=aws.cognito.signin.user.admin email openid profile';
  }

  loginWithGoogle() {
    window.location.href = environment.cognitoUrl + '/oauth2/authorize?identity_provider=Google&redirect_uri=' + environment.redirectUri + '&response_type=CODE&client_id=' + environment.amplify.Auth.userPoolWebClientId + '&scope=aws.cognito.signin.user.admin email openid profile';
  }


}
