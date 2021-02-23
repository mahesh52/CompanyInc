import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";
import {PaginationService} from "../../services/pagination.service";
import {SortUtilsService} from "../../services/sort-utils.service";
import {HttpClient} from "@angular/common/http";
import * as moment from 'moment';


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
  fromDate = '';
  toDate = '';
  upStreamPortals: any;
  downStreamPortals: any;
  upStreamPortal: any;
  downStreamPortal: any;

  constructor(private utilService: UtilsService, private router: Router, private paginationService: PaginationService,
              private productService: ProductService,
              private http: HttpClient,
              private utils: UtilsService,
              private sortUtilsService: SortUtilsService) {

  }

  ngOnInit() {
    this.getUpStreamPortals();
  }

  getGlobalConfigurations() {
    this.utilService.getGlobalConfigurations(this.downStreamPortal).subscribe(res => {
      this.productTypes = res[0].productTypes;
      this.collections =res[0].collections;
      this.tags = res[0].tags;
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getUpStreamPortals() {
    this.utilService.getUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
      this.upStreamPortal = res[0].portalID;
      this.getDownStreamPortals();
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
      this.downStreamPortal = res[0].portalID;
      this.getProducts();
      if (sessionStorage.getItem('products') !== '' && sessionStorage.getItem('products') !== null && sessionStorage.getItem('products') !== undefined) {
        const res1 = JSON.parse(sessionStorage.getItem('products'));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
        this.setPage(1);
      } else {
        this.getProducts();
      }
    }, error => {
      console.log('Error while getting the downstream portals');
      console.log(error);
    });
  }

  details(id) {
    let index = 0;
    const selectedItems = this.productDetails.filter(function (item, index) {
      return item.id === id
    });
    this.productDetails.forEach((item, i) => {
      if (item.id === id) {
        index = i;
      }
    });
    console.log(selectedItems);
    this.router.navigate(['/details', index]);
  }

  getProducts() {
    this.loading = true;
    this.productService.getProducts(this.upStreamPortal, this.downStreamPortal)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        //res[0].ShopifyStatus = 'Published';
        this.getGlobalConfigurations();
        let res1 = [];
        res.forEach((item) => {
          item.markup = item.markup + ' %';
          res1.push(item);
        });
        sessionStorage.setItem('products', JSON.stringify(res1));
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
    if (tags && tags !== null && tags !== undefined) {
      let returnTags = tags.split(',');
      returnTags = returnTags.filter(item => item);
      if (returnTags.length > 2) {
        returnTags = returnTags.splice(0, 2);
        //console.log(tags);
      }
      return returnTags;
    }
    return [];

  }

  getTagsLength(tags) {
    if (tags && tags !== undefined && tags !== null) {
      return tags.length;
    }
    return 0;

  }


  selectIndex(productID) {
    this.isProdSelected = true;
    this.productDetails.forEach((item, i) => {
      if (item.productID === productID) {
        this.selectedIndex = i;
      }
    });
    this.selectedItems = this.productDetails[this.selectedIndex].tags.split(',');

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
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
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
      let list = [];
      this.originalList.forEach((item) => {
        if (item.orderNumber.toUpperCase().includes(orderNumber.toUpperCase())) {
          list.push(item);
        }
      });
      // const items = this.originalList.filter(function (item) {
      //   return item.orderNumber.toUpperCase() === orderNumber.toUpperCase()
      // });
      this.productDetails = list;
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
    this.selectedItems = this.selectedItems.filter(item => item);
    if(this.productDetails[this.selectedIndex].tags){
      this.productDetails[this.selectedIndex].tags = [...this.productDetails[this.selectedIndex].tags,...this.selectedItems];
    } else {
      this.productDetails[this.selectedIndex].tags = this.selectedItems;
    }
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
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
        sessionStorage.setItem('products', JSON.stringify(this.productDetails));
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
    sessionStorage.setItem('products', JSON.stringify(this.originalList));
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

  zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  loadFromSource() {

    if (this.fromDate && this.toDate) {
      const time1 = moment(this.fromDate).format('YYYY-MM-DD');
      const time2 = moment(this.toDate).format('YYYY-MM-DD');
      if (time1 > time2) {
        alert('To date must be greater than from date');
      } else {
        this.loading = true;
        const formDate = this.zeroPad(this.fromDate['month'], 2) + '-' + this.zeroPad(this.fromDate['day'], 2) + '-' + this.fromDate['year'];
        const toDate = this.zeroPad(this.toDate['month'], 2) + '-' + this.zeroPad(this.toDate['day'], 2) + '-' + this.toDate['year'];
        this.productService.getProducts(this.upStreamPortal, this.downStreamPortal, formDate, toDate)
          .subscribe(res => {
            this.loading = false;
            this.getProducts();
          }, error => {
            this.loading = false;
          });
      }

    } else {
      alert('Please select from date and to date');
    }

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
