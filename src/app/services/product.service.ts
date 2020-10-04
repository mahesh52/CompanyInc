import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor( private api: ApiService) { }

  getProducts(){
    return this.api.Get('api/product');
  }
}
