import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  productDetails: any = [];
  loading = false;
  productTypes = [];
  collections = [];
  tags = [];
  selectedIndex: number;

  selectedItems = [];
  isProdSelected = false;

  constructor(private router: Router, private productService: ProductService, private utils: UtilsService) {

  }

  ngOnInit() {
    this.productTypes = this.utils.productTypes;
    this.collections = this.utils.collections;
    this.tags = this.utils.tags;

    this.getProducts();
  }

  details(index) {
    sessionStorage.setItem('selectedProduct', JSON.stringify(this.productDetails[index]));
    this.router.navigate(['details']);
  }

  getProducts() {
    this.loading = true;
    this.productService.getProducts()
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        this.productDetails = res;
      }, error => {
        this.loading = false;
        console.log('Err: while getting products');
      });
  }

  getTags(tags) {
    return tags.split(',');
  }

  selectIndex(i) {
    this.selectedIndex = i;
    this.selectedItems = this.productDetails[i].tags.split(',');
    this.isProdSelected = true;
  }

  addToList(checked, value) {
    if (checked) {
      this.selectedItems.push(value);
    } else {
      this.selectedItems = this.selectedItems.filter(function (item) {
        return item !== value
      })
    }
    console.log(this.selectedItems);
  }

  hasValue(value) {
    let hasFound = false;
    this.selectedItems.forEach((item) => {
      if (item === value) {
        hasFound = true;
      }
    });
    if (hasFound) {
      return true;
    }
    return false;
  }
  addListToProduct(){
    this.productDetails[this.selectedIndex].tags = this.selectedItems.toString();
    this.isProdSelected = false;
  }
  saveData(item){
    let request = {
      "productDetail": item.productDetail,
      "productType": item.productType,
      "collections": item.collections,
      "tags": item.tags,
      "markup": item.markup,
    }
    this.loading = true;
    this.productService.updateProduct(item.id,request)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
      }, error => {
        this.loading = false;
      });
  }

  removeFromList(index,tag){
    const selectedItems = this.productDetails[index].tags.split(',').filter(function (item) {
      return item !== tag
    })
    this.productDetails[index].tags = selectedItems.toString();
  }

  uploadProducts(){
    this.loading = true;
    this.productService.uploadProducts()
      .subscribe(res => {
        this.loading = false;
        this.getProducts();
      }, error => {
        this.loading = false;
      });
  }

  loadFromSource(){
    this.loading = true;
    this.productService.downloadProducts()
      .subscribe(res => {
        this.loading = false;
        this.getProducts();
      }, error => {
        this.loading = false;
      });
  }
}
