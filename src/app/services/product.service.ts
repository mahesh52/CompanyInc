import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private api: ApiService) {
  }

  getProducts() {
    return this.api.Get('api/product');
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
