import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  userDetails: any;
  tokenDetails: any;
  isUserLoggedIn = false;

  constructor() { }
}
