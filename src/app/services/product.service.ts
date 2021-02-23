import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {environment} from "../../environments/environment";
import {APICONFIG} from "../common/APICONFIG";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private api: ApiService) {
  }

  getProducts(upStreamPortalId,downStreamPortalId, fromDate?: string, toDate?: string) {
    let url = environment.baseUrl + APICONFIG.productUSer + '/' + upStreamPortalId+'/'+downStreamPortalId;
    if (fromDate && toDate) {
      url = url + '?endDate=' + toDate + '&startDate=' + fromDate;
    }
    return this.api.Get(url);
  }

  updateProduct(id, data) {
    return this.api.PutOthers('api/product/' + id, data);
  }

  uploadProducts() {
    return this.api.Post('api/product/UploadProducts', {});
  }

  downloadProducts(fromDate, todate) {
    return this.api.Post('api/product/DownloadStyles?toDate=' + todate + '&fromDate=' + fromDate, {});
  }
}
