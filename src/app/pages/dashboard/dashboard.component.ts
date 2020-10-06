import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";
import {PaginationService} from "../../services/pagination.service";
import {SortUtilsService} from "../../services/sort-utils.service";

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
  totalProducts: number;
  pager: any = {};
  pagedItems: any[];
  error = '';
  page = 1;
  originalList = []

  selectedItems = [];
  isProdSelected = false;
  orderNumber = '';
  isSearched = false;

  constructor(private router: Router, private paginationService: PaginationService,
              private productService: ProductService,
              private utils: UtilsService,
              private sortUtilsService: SortUtilsService) {

  }

  ngOnInit() {
    this.productTypes = this.utils.productTypes;
    this.collections = this.utils.collections;
    this.tags = this.utils.tags;

    this.getProducts();
  }

  details(id) {
    const selectedItems = this.productDetails.filter(function (item) {
      return item.id === id
    });
    console.log(selectedItems);
    sessionStorage.setItem('selectedProduct', JSON.stringify(selectedItems[0]));
    this.router.navigate(['details']);
  }

  getProducts() {
    this.loading = true;
    this.productService.getProducts()
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        //res[0].ShopifyStatus = 'Published';
        this.productDetails = res;
        this.originalList = res;
        this.totalProducts = res.length;
        this.setPage(1);

      }, error => {
        this.loading = false;
        console.log('Err: while getting products');
      });
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    if (isNaN(page)) {
      page = 1;
    }

    this.pager = this.paginationService.getPager(this.productDetails.length, page);

    this.pagedItems = this.productDetails.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  getTags(tags) {
    return tags.split(',');
  }

  selectIndex(id) {
    let index = 0;
    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        this.selectedIndex = i;
      }
    });


    this.selectedItems = this.productDetails[index].tags.split(',');
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
  clearTableData(){
    this.isSearched = false;
    this.orderNumber = '';
    this.productDetails = this.originalList;
    this.pager = {};
    this.setPage(1);
  }
  filterByOrderNumber() {
    this.isSearched = true;
    const orderNumber = this.orderNumber;
    if(orderNumber){
      const items = this.originalList.filter(function (item) {
        return item.id.toUpperCase() === orderNumber.toUpperCase()
      });
      this.productDetails = items;
      this.pager = {};
      this.setPage(1);
    } else {
      this.isSearched = false;
      this.productDetails = this.originalList;
      this.pager = {};
      this.setPage(1);
    }

  }

  filterData(value) {
    if (value) {
      if (value === 'New') {
        const items = this.originalList.filter(function (item) {
          if (!item.ShopifyStatus) {
            item.ShopifyStatus = '';
          }
          return item.ShopifyStatus.toUpperCase() === value.toUpperCase() || item.ShopifyStatus === '' || item.ShopifyStatus === null

        });
        this.productDetails = items;
        this.pager = {};
        this.setPage(1);
      } else {
        const items = this.originalList.filter(function (item) {
          return item.ShopifyStatus.toUpperCase() === value.toUpperCase()
        });
        this.productDetails = items;
        this.pager = {};
        this.setPage(1);
      }
    } else {
      this.productDetails = this.originalList;
      this.pager = {};
      this.setPage(1);
    }

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

  addListToProduct() {
    this.productDetails[this.selectedIndex].tags = this.selectedItems.toString();
    this.isProdSelected = false;
  }

  saveData(item) {
    let request = {
      "productDetail": item.productDetail,
      "productType": item.productType,
      "collections": item.collections,
      "tags": item.tags,
      "markup": item.markup,
    }
    this.loading = true;
    this.productService.updateProduct(item.id, request)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
      }, error => {
        this.loading = false;
      });
  }

  removeFromList(id, tag) {
    let index = 0;
    const item = this.productDetails.filter(function (item) {
      return item.id === id
    });

    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        index = i;
      }
    });

    const selectedItems = this.productDetails[index].tags.split(',').filter(function (item) {
      return item !== tag
    })
    this.productDetails[index].tags = selectedItems.toString();
  }

  uploadProducts() {
    this.loading = true;
    this.productService.uploadProducts()
      .subscribe(res => {
        this.loading = false;
        this.getProducts();
      }, error => {
        this.loading = false;
      });
  }

  loadFromSource() {
    this.loading = true;
    this.productService.downloadProducts()
      .subscribe(res => {
        this.loading = false;
        this.getProducts();
      }, error => {
        this.loading = false;
      });
  }

  getSalePrice(price, markup) {
    if (price && markup) {
      return (price * (1 + (markup / 100))).toFixed(2);
    }
    return '';
  }

  sortData(key) {
    if (key) {
      this.productDetails = this.sortUtilsService.sortByKey(this.productDetails, key, false);
      this.pager = {};
      this.setPage(1);
    } else {
      this.productDetails = this.originalList;
      this.pager = {};
      this.setPage(1);
    }
  }
}
