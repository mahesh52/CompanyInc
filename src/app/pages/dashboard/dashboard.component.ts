import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";
import {PaginationService} from "../../services/pagination.service";
import {SortUtilsService} from "../../services/sort-utils.service";
import {HttpClient} from "@angular/common/http";
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';



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
  selectedDetailsIndex: number;
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
  selectedProdDetails = '';

  constructor(private router: Router, private paginationService: PaginationService,
              private productService: ProductService,
              private http: HttpClient,
              private utils: UtilsService,
              private sortUtilsService: SortUtilsService) {

  }

  ngOnInit() {
    this.productTypes = this.utils.productTypes;
    this.collections = this.utils.collections;
    this.tags = this.utils.tags;
    if (sessionStorage.getItem('products') !== '' && sessionStorage.getItem('products') !== null &&  sessionStorage.getItem('products') !== undefined) {
      const res1 = JSON.parse(sessionStorage.getItem('products') );
      this.productDetails = res1;
      this.originalList = res1;
      this.totalProducts = res1.length;
      this.setPage(1);
    } else {
      this.getProducts();
    }
  }
  details(id) {
    let index = 0;
    const selectedItems = this.productDetails.filter(function (item,index) {
      return item.id === id
    });
    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        index = i;
      }
    });
    console.log(selectedItems);
    this.router.navigate(['/details',index]);
  }

  getProducts() {
    this.loading = true;
    this.productService.getProducts()
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        //res[0].ShopifyStatus = 'Published';
        let res1 = [];
        res.forEach((item) => {
          item.markup = item.markup + ' %';
          res1.push(item);
        });
        sessionStorage.setItem('products',JSON.stringify(res1));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
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
    let returnTags = tags.split(',');
    if (returnTags.length > 2) {
      returnTags = returnTags.splice(0, 2);
      //console.log(tags);
    }
    return returnTags;
  }

  getTagsLength(tags) {
    return tags.split(',').length;

  }


  selectIndex(id) {
    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        this.selectedIndex = i;
      }
    });


    this.selectedItems = this.productDetails[this.selectedIndex].tags.split(',');
    this.isProdSelected = true;
  }

  selectDetIndex(id) {
    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        this.selectedDetailsIndex = i;
      }
    });


    this.selectedProdDetails = this.productDetails[this.selectedDetailsIndex].productDetail;
    this.isProdSelected = true;
  }

  updateProductDetails() {
    this.productDetails[this.selectedDetailsIndex].productDetail = this.selectedProdDetails;
    sessionStorage.setItem('products',JSON.stringify(this.productDetails));
    this.isProdSelected = false;
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

  clearTableData() {
    this.isSearched = false;
    this.orderNumber = '';
    this.productDetails = this.originalList;
    this.pager = {};
    this.setPage(1);
  }

  filterByOrderNumber() {
    this.isSearched = true;
    const orderNumber = this.orderNumber;
    if (orderNumber) {
      const items = this.originalList.filter(function (item) {
        return item.orderNumber.toUpperCase() === orderNumber.toUpperCase()
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
    sessionStorage.setItem('products',JSON.stringify(this.productDetails));
    this.isProdSelected = false;
  }

  saveData(item) {
    let request = {
      "productDetail": item.productDetail,
      "productType": item.productType,
      "collections": item.collections,
      "tags": item.tags,
      "markup": item.markup.replace('%', '').replace(),
    }
    this.loading = true;
    this.productService.updateProduct(item.id, request)
      .subscribe(res => {
        this.loading = false;
        sessionStorage.setItem('products',JSON.stringify(this.productDetails));
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
    sessionStorage.setItem('products',JSON.stringify(this.originalList));
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
      markup = markup.replace('%', '').trim();
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
