import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";
import {environment} from "../../environments/environment";
import {APICONFIG} from "../common/APICONFIG";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  userDetails: any;
  tokenDetails: any;
  isUserLoggedIn = false;
  public userInfo = new Subject<any>();

  constructor(private api: ApiService) { }

  getUserDetails() {
    return this.api.Get(environment.baseUrl + APICONFIG.getUser);
  }
  emitUserInfo(value: boolean) {
    this.userInfo.next(value);
  }
  createUser(data) {
    return this.api.Post(environment.baseUrl + APICONFIG.createuser,data);
  }
}
