import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";
import {environment} from "../../environments/environment";
import {APICONFIG} from "../common/APICONFIG";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  userDetails: any;
  tokenDetails: any;
  isUserLoggedIn = false;

  constructor(private api: ApiService) { }

  getUserDetails() {
    return this.api.Get(environment.baseUrl + APICONFIG.getUser);
  }
}
