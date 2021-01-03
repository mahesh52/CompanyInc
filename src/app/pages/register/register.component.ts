import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PasswordStrengthValidator} from "./password-strength.validators"
import {AuthService} from "../../services/auth.service";
import {environment} from "../../../environments/environment";
import {HttpHeaders, HttpClient} from "@angular/common/http";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  userData: any;
  registerError: string = '';
  loading = false;

  constructor(private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = fb.group({
      'name': ['', Validators.required],
      'username': ['', Validators.required],
      'email': ['', [Validators.required, Validators.email]],
      'mobile': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
      'password': ['',
        [Validators.required, PasswordStrengthValidator]
      ]
    })
  }

  isSignedUp = false;

  ngOnInit() {
    const code: string = this.route.snapshot.queryParamMap.get('code');
  //  console.log(code);
    if (code && code !== '') {
      let formData = new URLSearchParams();
      formData.set('grant_type', 'authorization_code');
      formData.set('client_id', environment.amplify.Auth.userPoolWebClientId);
      formData.set('code', code);
      formData.set('redirect_uri', environment.redirectUri);
      let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      };
      this.http.post(environment.cognitoUrl + '/oauth2/token', formData.toString(), options).subscribe(
        result => {
          this.user.tokenDetails = result;
          this.user.isUserLoggedIn = true;
          //this.auth.getLoginUser();
          this.router.navigateByUrl('/portals');
          sessionStorage.setItem('auth',JSON.stringify(result));
        },
        error => {
          console.log(error);
        });
    }

  }

  register() {
    this.loading = true;
    const formData = this.registerForm.value;
    this.auth.signUp(formData)
      .subscribe(
        result => {
          this.userData = formData;
          this.isSignedUp = true;
          this.registerError = '';
          this.loading = false;
        },
        error => {
          console.log(error);
          this.registerError = error.message;
          this.loading = false;
        });
    //this.router.navigate(['login']);
  }

  resendLink() {
    this.loading = true;
    this.auth.resendCode(this.userData.username).subscribe(
      result => {
        this.loading = false;
      },
      error => {
        console.log(error);
        this.registerError = error.message;
        this.loading = false;
      });
  }

  emailVerify() {
    this.loading = true;
    this.auth.signIn(this.userData.username, this.userData.password).subscribe(
      (result) => {
        console.log(result);
        this.loading = false;
        this.registerError = '';
        this.user.isUserLoggedIn = true;
        const tokenDetails = {
          idToken: result.signInUserSession.idToken.jwtToken,
          accessToken: result.signInUserSession.accessToken.jwtToken,
          refreshToken: result.signInUserSession.refreshToken.token
        }
        this.user.tokenDetails = tokenDetails;
        sessionStorage.setItem('auth',JSON.stringify(tokenDetails));
        this.router.navigateByUrl('/portals');
      },
      error => {
        console.log(error);
        this.registerError = error.message;
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
