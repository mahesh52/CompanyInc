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
    "Womens",
    "Mitansh Yadav"
  ];

  collections = [
    "Home page",
    "Home Page 1",
    "Masks",
    "Women"
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
  notifications = [];
  uploadNotifications = [];
  constructor(private api: ApiService) {
  }

  getSubscriptions() {
    return this.api.Get(environment.baseUrl + APICONFIG.getSubscriptions);
  }

  getGlobalConfigurations(downStreamPortalId) {
    return this.api.Get(environment.baseUrl + APICONFIG.getGlobalConfigs + '/' + downStreamPortalId);
  }

  getUpStreamPortals() {
    return this.api.Get(environment.baseUrl + APICONFIG.getUpStreamPortals);
  }

  getUserUpStreamPortals() {
    return this.api.Get(environment.baseUrl + APICONFIG.userUpStreamPortals);
  }

  getDownStreamPortals() {
    return this.api.Get(environment.baseUrl + APICONFIG.getDownStreamPortals);
  }

  getUserDownStreamPortals() {
    return this.api.Get(environment.baseUrl + APICONFIG.userDownStreamPortals);
  }

  disableUserPortal(portalId, type) {
    return this.api.PutOthers(environment.baseUrl + APICONFIG.disablePortals + type + '/' + portalId,{});
  }

  getUserPortalsConfigurations(id) {
    return this.api.Get(environment.baseUrl + APICONFIG.getPortalConfiguration + id);
  }

  postVerifyUpStreamPortal(payload) {
    return this.api.Post(environment.baseUrl + APICONFIG.verifyPortals, payload);
  }

  updateCustomer(payload) {
    return this.api.Post(environment.baseUrl + APICONFIG.updateUser, payload);
  }

  chargeCustomer(token, payload, amount) {
    return this.api.PostChargeCustomer(environment.baseUrl + APICONFIG.chargeUser, payload, amount, token);
  }
}
