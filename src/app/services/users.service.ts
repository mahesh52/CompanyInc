import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  users = [
    {
      "username":"admin",
      "password":"admin"
    },
    {
      "username":"catherine",
      "password":"catherine"
    },
    {
      "username":"Catherine",
      "password":"Catherine"
    }
  ]
}
