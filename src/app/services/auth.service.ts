import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {map, tap, catchError} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import Amplify, {Auth} from 'aws-amplify';
import {environment} from './../../environments/environment';

@Injectable()
export class AuthService {

  public loggedIn: BehaviorSubject<boolean>;

  constructor(
    private router: Router
  ) {
    Amplify.configure(environment.amplify);
    this.loggedIn = new BehaviorSubject<boolean>(false);
  }

  /** signup */
  public signUp(data): Observable<any> {
    return fromPromise(Auth.signUp({
      username: data.username,
      password: data.password,
      attributes: {
        email: data.email,
        name: data.name,
        phone_number:'+1'+data.mobile
      },
      validationData: []
    }));

  }

  public resendCode(username) {
    return fromPromise(Auth.resendSignUp(username));
  }

  /** confirm code */
  public confirmSignUp(email, code): Observable<any> {
    return fromPromise(Auth.confirmSignUp(email, code));
  }

  /** signin */
  public signIn(email, password): Observable<any> {
    return fromPromise(Auth.signIn(email, password));
  }

  public forgotPassword(username): Observable<any> {
    return fromPromise(Auth.forgotPassword(username));

  }
  public forgotPasswordSubmit(username,code,password): Observable<any> {
    return fromPromise( Auth.forgotPasswordSubmit(username,code,password));
  }
  public getLoginUser() {
    Auth.currentUserInfo();
  }

  /** get authenticat state */
  public isAuthenticated(): Observable<boolean> {
    return fromPromise(Auth.currentAuthenticatedUser())
      .pipe(
        map(result => {
          this.loggedIn.next(true);
          return true;
        }),
        catchError(error => {
          this.loggedIn.next(false);
          return of(false);
        })
      );
  }

  /** signout */
  public signOut() {
    fromPromise(Auth.signOut())
      .subscribe(
        result => {
          this.loggedIn.next(false);
          this.router.navigate(['/login']);
        },
        error => console.log(error)
      );
  }
}
