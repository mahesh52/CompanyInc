import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {APICONFIG} from "../common/APICONFIG";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  productTypes = [
    "Accessories",
    "BABY GIRL NB-24 MONTHS",
    "Baby & Toddler",
    "Mini",
    "Tween",
    "Women",
    "Women's",
    "Womens"
  ];

  collections = [
    "Home page",
    "Home Page 1",
    "Masks"
  ];
  tags = [
    {item_id: "Women's", item_text: "Women's"},
    {item_id: "Accessories", item_text: "Accessories"},
    {item_id: "Women's Tops", item_text: "Women's Tops"},
    {item_id: "earrings", item_text: "earrings"},
    {item_id: "Mini", item_text: "Mini"},
    {item_id: "Baby & Toddler", item_text: "Baby & Toddler"},
    {item_id: "Baby Girl / Toddler", item_text: "Baby Girl / Toddler"},
    {item_id: "Women's Bottoms", item_text: "Women's Bottoms"},
    {item_id: "Baby Boy / Toddler", item_text: "Baby Boy / Toddler"},
    {item_id: "baby girls", item_text: "baby girls"},
    {item_id: "medical", item_text: "medical"},
    {item_id: "necklace", item_text: "necklace"},
    {item_id: "Women's dresses", item_text: "Women's dresses"},
    {item_id: "Baby", item_text: "Baby"},
    {item_id: "baby boys", item_text: "baby boys"},
    {item_id: "baby girl", item_text: "baby girl"},
    {item_id: "baby / toddler", item_text: "baby / toddler"},
    {item_id: "KIDS / TWEEN", item_text: "KIDS / TWEEN"},
    {item_id: "Women's Jumpsuits", item_text: "Women's Jumpsuits"},
    {item_id: "baby dress", item_text: "baby dress"},
    {item_id: "baby leggings", item_text: "baby leggings"},
    {item_id: "belts", item_text: "belts"},
    {item_id: "diaper set", item_text: "diaper set"},
    {item_id: "Dresses", item_text: "Dresses"},
  ];

  constructor(private api: ApiService) {
  }

  getUpStreamPortals() {
    return this.api.GetWithoutHeaders(environment.baseUrl + APICONFIG.getUpStreamPortals);
  }

  getDownStreamPortals() {
    return this.api.GetWithoutHeaders(environment.baseUrl + APICONFIG.getDownStreamPortals);
  }

  postVerifyUpStreamPortal(payload) {
    return this.api.Post(environment.baseUrl2 + APICONFIG.verifyPortals, payload);
  }
}
