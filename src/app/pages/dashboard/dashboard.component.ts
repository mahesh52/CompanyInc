import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";
import {PaginationService} from "../../services/pagination.service";
import {SortUtilsService} from "../../services/sort-utils.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import * as moment from 'moment';
import {SSE} from "../landing/sse";
import {environment} from "../../../environments/environment";
import {APICONFIG} from "../../common/APICONFIG";
import {STORAGEKEY} from "../../common/STORAGEKEY";
import {ToasterService} from "../../common/toaster.service";
import {NotificationsService} from "../../services/notifications.service";
import * as jQuery from 'jquery';
import {UsersService} from "../../services/users.service";
import {NgbDate} from "@ng-bootstrap/ng-bootstrap";

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
  originalList = [];
  uniqueStatuses: any;

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
  selectedUpStreamPortal: any;
  selectedDownStreamPortal: any
  downStreamPortal: any;
  userDetails: any;
  selectedProducts = [];
  downLoadEvent: any;
  uploadLoadEvent: any;
  isDownloadedStarted = false;
  isUploadStarted = false;

  stopNotificationDownload = false;
  stopNotificationUpload = false;
  dropdownList = [];
  selectedDropItems = [];
  selectedCols = [];
  dropdownSettings = {};
  filteredKey: any;
  minDate: any;
  sorKey: any;
  selectedPage: any;

  constructor(private user: UsersService, private notificationService: NotificationsService, private toaster: ToasterService, private utilService: UtilsService, private router: Router, private paginationService: PaginationService,
              private productService: ProductService,
              private http: HttpClient,
              private utils: UtilsService,
              private sortUtilsService: SortUtilsService) {
    const current = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

  }

  ngOnInit() {
    // this.notificationService.stopnotifications.subscribe((value) => {
    //   this.downLoadEvent.close();
    //   this.isDownloadedStarted = false;
    //   this.downLoadEvent.removeEventListener("progress");
    // });
    // this.notificationService.stopupLoadnotifications.subscribe((value) => {
    //   this.uploadLoadEvent.close();
    //   this.uploadLoadEvent.removeEventListener("progress");
    //   this.isUploadStarted = false;
    // });
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    if (!this.userDetails.isCustomerSubscriptionActive) {
      this.router.navigateByUrl('/subscription/0');
    } else {
      this.getUpStreamPortals();
    }


    this.dropdownList = [
      {item_id: 'Product Details', item_text: 'Product Details'},
      {item_id: 'Product Type', item_text: 'Product Type'},
      {item_id: 'Collection', item_text: 'Collection'},
      {item_id: 'Tags', item_text: 'Tags'},
      {item_id: 'DownStream SKU', item_text: 'DownStream SKU'},
      {item_id: 'Unit Price', item_text: 'Unit Price'},
      {item_id: 'Markup', item_text: 'Markup'},
      {item_id: 'Sale Price', item_text: 'Sale Price'},
      {item_id: 'Order Number', item_text: 'Order Number'},
      {item_id: 'UpStream SKU', item_text: 'UpStream SKU'},
      {item_id: 'Vendor', item_text: 'Vendor'},
      {item_id: 'Publishing date', item_text: 'Publishing date'}
    ];
    this.selectedCols = [
      {item_id: 'Product Details', item_text: 'Product Details'},
      {item_id: 'Product Type', item_text: 'Product Type'},
      {item_id: 'Collection', item_text: 'Collection'},
      {item_id: 'Tags', item_text: 'Tags'},
      {item_id: 'DownStream SKU', item_text: 'DownStream SKU'},
      {item_id: 'Unit Price', item_text: 'Unit Price'},
      {item_id: 'Markup', item_text: 'Markup'},
      {item_id: 'Sale Price', item_text: 'Sale Price'}
    ];
    this.selectedDropItems = [
      'Product Details',
      'Product Type',
      'Collection',
      'Tags',
      'DownStream SKU',
      'Unit Price',
      'Markup',
      'Sale Price'
    ];

    this.dropdownSettings = {
      singleSelection: false,
      // limitSelection:9,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: false,
      enableCheckAll: false
    };
  }

  getDate(date) {
    if (date) {
      return date['day'] + '/' + date['month'] + '/' + date['year'];
    }
    return 'N/A';
    // return date;
  }

  getGlobalConfigurations() {
    this.utilService.getGlobalConfigurations(this.downStreamPortal).subscribe(res => {
      if (res && res.length > 0) {
        this.productTypes = res[0].productTypes;
        this.collections = res[0].collections;
        this.tags = res[0].tags;
      }

    }, error => {
      if (error.status === 403) {
        this.refreshToken()
      }
      console.log('Error while getting getGlobalConfigurations');
      console.log(error);
    });
  }

  getUpStreamPortals() {
    this.utilService.getUserUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
      if (sessionStorage.getItem('upStream') !== '' &&
        sessionStorage.getItem('upStream') !== null
        && sessionStorage.getItem('upStream') !== undefined
       && sessionStorage.getItem('upStream') !== 'null'
        && sessionStorage.getItem('upStream') !== 'undefined'
      ) {
        this.upStreamPortal = sessionStorage.getItem('upStream');
        sessionStorage.removeItem('upStream');
      } else {
        this.upStreamPortal = res[0].portalID;
      }
      this.getDownStreamPortals();
    }, error => {
      if (error.status === 403) {
        this.refreshToken()
      }
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getUserDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
      if (sessionStorage.getItem('downStream') !== '' &&
        sessionStorage.getItem('downStream') !== null &&
        sessionStorage.getItem('downStream') !== undefined
        && sessionStorage.getItem('downStream') !== 'null'
        && sessionStorage.getItem('downStream') !== 'undefined') {
        this.downStreamPortal = sessionStorage.getItem('downStream');
        sessionStorage.removeItem('downStream');
      } else {
        this.downStreamPortal = res[0].portalID;
      }
      //  this.getProducts();
      this.getGlobalConfigurations();
      if (sessionStorage.getItem('selectedDropItems') !== '' &&
        sessionStorage.getItem('selectedDropItems') !== null &&
        sessionStorage.getItem('selectedDropItems') !== undefined
        && sessionStorage.getItem('selectedDropItems') !== 'null'
        && sessionStorage.getItem('selectedDropItems') !== 'undefined'
      ) {
        this.selectedDropItems = JSON.parse(sessionStorage.getItem('selectedDropItems'));
        sessionStorage.removeItem('selectedDropItems');
      }
      if (sessionStorage.getItem('selectedCols') !== '' &&
        sessionStorage.getItem('selectedCols') !== null &&
        sessionStorage.getItem('selectedCols') !== undefined
        && sessionStorage.getItem('selectedCols') !== 'null'
        && sessionStorage.getItem('selectedCols') !== 'undefined'
      ) {
        this.selectedCols = JSON.parse(sessionStorage.getItem('selectedCols'));
        sessionStorage.removeItem('selectedCols');
      }

      if (sessionStorage.getItem('products') !== '' &&
        sessionStorage.getItem('products') !== null &&
        sessionStorage.getItem('products') !== undefined
        && sessionStorage.getItem('products') !== 'null'
        && sessionStorage.getItem('products') !== 'undefined') {
        const res1 = JSON.parse(sessionStorage.getItem('products'));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
        let result = this.productDetails.map(a => a.downstreamStatus);
        this.uniqueStatuses = [...new Set(result)];
        if (sessionStorage.getItem('filter') &&
          sessionStorage.getItem('filter') !== ''
          && sessionStorage.getItem('filter') !== 'null'
          && sessionStorage.getItem('filter') !== 'undefined'
        ) {
          this.filterData(sessionStorage.getItem('filter')
          );
          sessionStorage.removeItem('filter');
        } else if (sessionStorage.getItem('sortKey') &&
          sessionStorage.getItem('sortKey') !== ''
          && sessionStorage.getItem('sortKey') !== 'null'
          && sessionStorage.getItem('sortKey') !== 'undefined'
        ) {
          this.sorKey = sessionStorage.getItem('sortKey');
          this.sortData(this.sorKey);
          sessionStorage.removeItem('sortKey');
        } else {
          if (sessionStorage.getItem('currentPage') &&
            sessionStorage.getItem('currentPage') !== ''
            && sessionStorage.getItem('currentPage') !== 'null'
            && sessionStorage.getItem('currentPage') !== 'undefined') {
            this.setPage(Number(sessionStorage.getItem('currentPage')));
            this.selectedPage = Number(sessionStorage.getItem('currentPage'));
            sessionStorage.removeItem('currentPage');
          } else {
            this.setPage(1);
          }
        }


      } else {
        this.getProducts();
      }
    }, error => {
      if (error.status === 403) {
        this.refreshToken()
      }
      console.log('Error while getting the downstream portals');
      console.log(error);
    });
  }

  getProductIndx(prodId) {
    let index = 0;

    this.productDetails.forEach((item, i) => {
      if (item.productID === prodId) {
        index = i;
      }
    });
    return index + 1;
  }

  details(id) {
    let index = 0;
    const productDetails = JSON.parse(sessionStorage.getItem('products'))
    const selectedItems = productDetails.filter(function (item, index) {
      return item.productID === id
    });
    productDetails.forEach((item, i) => {
      if (item.productID === id) {
        index = i;
      }
    });
    console.log(selectedItems);
    this.downStreamPortal = sessionStorage.setItem('downStream', this.downStreamPortal);
    this.upStreamPortal = sessionStorage.setItem('upStream', this.upStreamPortal);
    sessionStorage.setItem('currentPage', this.pager.currentPage);
    sessionStorage.setItem('selectedCols', JSON.stringify(this.selectedCols));
    sessionStorage.setItem('selectedDropItems', JSON.stringify(this.selectedDropItems));
    sessionStorage.setItem('sortKey', this.sorKey);
    if (this.filteredKey) {
      sessionStorage.setItem('filter', this.filteredKey);
    }

    this.router.navigate(['/details', index]);
  }

  getProductsRefresh() {
    this.filteredKey = null;
    this.getGlobalConfigurations();
    this.loading = true;
    this.pagedItems = [];
    this.productService.getProducts(this.upStreamPortal, this.downStreamPortal)
      .subscribe(res => {
        this.selectedUpStreamPortal = this.upStreamPortal;
        this.selectedDownStreamPortal = this.downStreamPortal;
        this.loading = false;
        console.log(res);
        //res[0].ShopifyStatus = 'Published';

        let res1 = [];
        res.forEach((item) => {
          item.markup = item.markup + ' %';
          item.unitPriceWithShippingFee = '$ ' + item.unitPriceWithShippingFee;
          if (item.collections) {
            const checkCollection = this.collections.filter((collection) => collection === item.collections);
            if (checkCollection.length === 0) {
              item.collectionOther = item.collections;
              item.collections = 'other';

            }
          }
          if (item.productType) {
            const checkPtype = this.productTypes.filter((ptype) => ptype === item.productType);
            if (checkPtype.length === 0) {
              item.productTypeOther = item.productType;
              item.productType = 'other';
            }
          }

          if (item.publishingDate) {
            if (item.publishingDate.indexOf('T') >= 0) {
              const date = item.publishingDate.split('T');
              let returndate = date[0].split('-');
              item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
              //'2021-10-01';//returndate[0] + '-' + returndate[1] + '-' + returndate[2];
            } else {
              const returndate = item.publishingDate.split('-');
              item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
            }
          }
          item.isReadonly = false;
          res1.push(item);
        });
        res1.forEach((obj) => {
          if (obj.downstreamStatus.toUpperCase().indexOf('CREATED') >= 0
            || obj.downstreamStatus.toUpperCase().indexOf('PUBLISHED') >= 0) {
            res1.forEach((obj1, index) => {
              if (obj1.skuDownstream === obj.skuDownstream) {
                res1[index].isReadonly = true;
              }
            });
          }
        });
        sessionStorage.setItem('products', JSON.stringify(res1));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
        let result = this.productDetails.map(a => a.downstreamStatus);
        this.uniqueStatuses = [...new Set(result)];
        this.pager.totalPages = undefined;
        this.setPage(1);


      }, error => {
        if (error.status === 403) {
          this.refreshToken()
        }

        this.loading = false;
        console.log('Err: while getting products');
      });

  }

  getProducts() {
    if ((this.selectedUpStreamPortal !== this.upStreamPortal) || (this.selectedDownStreamPortal !== this.downStreamPortal)) {
      this.filteredKey = '';
      this.getGlobalConfigurations();
      this.loading = true;
      this.pagedItems = [];
      this.productService.getProducts(this.upStreamPortal, this.downStreamPortal)
        .subscribe(res => {
          this.selectedUpStreamPortal = this.upStreamPortal;
          this.selectedDownStreamPortal = this.downStreamPortal;
          this.loading = false;
          console.log(res);
          //res[0].ShopifyStatus = 'Published';

          let res1 = [];
          res.forEach((item) => {
            item.markup = item.markup + ' %';
            item.unitPriceWithShippingFee = '$ ' + item.unitPriceWithShippingFee;
            if (item.collections) {
              const checkCollection = this.collections.filter((collection) => collection === item.collections);
              if (checkCollection.length === 0) {
                item.collectionOther = item.collections;
                item.collections = 'other';

              }
            }
            if (item.productType) {
              const checkPtype = this.productTypes.filter((ptype) => ptype === item.productType);
              if (checkPtype.length === 0) {
                item.productTypeOther = item.productType;
                item.productType = 'other';
              }
            }

            if (item.publishingDate) {
              if (item.publishingDate.indexOf('T') >= 0) {
                const date = item.publishingDate.split('T');
                let returndate = date[0].split('-');
                item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
                //'2021-10-01';//returndate[0] + '-' + returndate[1] + '-' + returndate[2];
              } else {
                const returndate = item.publishingDate.split('-');
                item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
              }
            }
            item.isReadonly = false;
            res1.push(item);
          });
          res1.forEach((obj) => {
            if (obj.downstreamStatus.toUpperCase().indexOf('CREATED') >= 0
              || obj.downstreamStatus.toUpperCase().indexOf('PUBLISHED') >= 0) {
              res1.forEach((obj1, index) => {
                if (obj1.skuDownstream === obj.skuDownstream) {
                  res1[index].isReadonly = true;
                }
              });
            }
          });
          sessionStorage.setItem('products', JSON.stringify(res1));
          this.productDetails = res1;
          this.originalList = res1;
          this.totalProducts = res1.length;
          let result = this.productDetails.map(a => a.downstreamStatus);
          this.uniqueStatuses = [...new Set(result)];
          this.pager.totalPages = undefined;
          if (this.sorKey) {
            this.sortData(this.sorKey);
          } else {
            this.setPage(1);
          }


        }, error => {
          if (error.status === 403) {
            this.refreshToken()
          }

          this.loading = false;
          console.log('Err: while getting products');
        });
    }

  }

  refreshToken(path?: string) {
    var user = JSON.parse(sessionStorage.getItem(STORAGEKEY.auth));
    let formData = new URLSearchParams();
    formData.set('grant_type', 'refresh_token');
    formData.set('client_id', environment.amplify.Auth.userPoolWebClientId);
    formData.set('refresh_token', user['refreshToken']);
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set('Authorization', 'Bearer ' + user['access_token'])
    let options = {
      headers: headers
    };
    this.http.post(environment.cognitoUrl + '/oauth2/token', formData.toString(), options).subscribe(
      result => {
        sessionStorage.setItem('auth', JSON.stringify(result));
        this.user.tokenDetails = result;
        this.user.isUserLoggedIn = true;
        //this.auth.getLoginUser();

        //this.router.navigateByUrl('/portals');
        // window.location.reload();
        if (path) {
          if (path === 'download') {
            this.loadFromSource();
          } else if (path === 'upload') {
            this.uploadProducts();
          } else if (path === 'save') {
            this.saveData(JSON.parse(sessionStorage.getItem('productItem')));
            sessionStorage.removeItem('productItem');
          }
        } else {
          this.getUpStreamPortals();
        }


      },
      error => {
        console.log(error);
      });
  }

  setPage(page: number) {
    this.pager.totalPages = this.productDetails.length;

    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    if (isNaN(page)) {
      page = 1;
    }
    // if(this.pager.currentPage != page){
    const matTable = document.getElementById('productsTable');
    matTable.scrollIntoView(true);
    //}

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
    this.selectedItems = this.productDetails[this.selectedIndex].tags;

  }

  selectDetIndex(id) {
    this.productDetails.forEach((item, i) => {
      if (item.productID === id) {
        this.selectedDetailsIndex = i;
      }
    });


    this.selectedProdDetails = this.productDetails[this.selectedDetailsIndex].details;
    this.isProdSelected = true;
  }

  updateProductDetails() {
    this.productDetails[this.selectedDetailsIndex].details = this.selectedProdDetails;
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
    this.isProdSelected = false;
  }

  addToList(checked, value) {
    if (checked) {
      if (!this.selectedItems) {
        this.selectedItems = [];
      }
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
      this.filteredKey = value;
      const items = this.originalList.filter(function (item) {
        return item.downstreamStatus.toUpperCase() === value.toUpperCase()
      });
      this.productDetails = items;
      this.pager = {};
      if (sessionStorage.getItem('sortKey') && sessionStorage.getItem('sortKey') !== ''
        && sessionStorage.getItem('sortKey') !== 'null'
        && sessionStorage.getItem('sortKey') !== 'undefined'
      ) {
        this.sorKey = sessionStorage.getItem('sortKey');
        this.sortData(this.sorKey);
        sessionStorage.removeItem('sortKey');
      } else {
        if (sessionStorage.getItem('currentPage') &&
          sessionStorage.getItem('currentPage') !== ''
          && sessionStorage.getItem('currentPage') !== 'null'
          && sessionStorage.getItem('currentPage') !== 'undefined') {
          this.setPage(Number(sessionStorage.getItem('currentPage')));
          this.selectedPage = Number(sessionStorage.getItem('currentPage'));
          sessionStorage.removeItem('currentPage');
        } else {
          this.setPage(1);
        }
      }


    } else {
      sessionStorage.removeItem('filter');
      this.productDetails = this.originalList;
      this.pager = {};
      if (sessionStorage.getItem('sortKey') && sessionStorage.getItem('sortKey') !== ''
        && sessionStorage.getItem('sortKey') !== 'null'
        && sessionStorage.getItem('sortKey') !== 'undefined') {
        this.sorKey = sessionStorage.getItem('sortKey');
        this.sortData(this.sorKey);
        sessionStorage.removeItem('sortKey');
      }

      if (sessionStorage.getItem('currentPage') &&
        sessionStorage.getItem('currentPage') !== ''
        && sessionStorage.getItem('currentPage') !== 'null'
        && sessionStorage.getItem('currentPage') !== 'undefined') {
        this.setPage(Number(sessionStorage.getItem('currentPage')));
        this.selectedPage = Number(sessionStorage.getItem('currentPage'));
        sessionStorage.removeItem('currentPage');
      } else {
        this.setPage(1);
      }
      // this.setPage(1);
    }

  }

  hasValue(value) {
    let hasFound = false;
    if (this.selectedItems) {
      this.selectedItems.forEach((item) => {
        if (item === value) {
          hasFound = true;
        }
      });
      if (hasFound) {
        return true;
      }
    }

    return false;
  }

  addListToProduct() {
    this.selectedItems = this.selectedItems.filter(item => item);
    // if (this.productDetails[this.selectedIndex].tags) {
    //   this.productDetails[this.selectedIndex].tags = [...this.productDetails[this.selectedIndex].tags, ...this.selectedItems];
    // } else {
    this.productDetails[this.selectedIndex].tags = this.selectedItems;
    //  }
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
    this.isProdSelected = false;
  }

  saveData(item) {
    let request = {
      "productID": item.productID,
      "details": item.details,
      "productType": item.productType === 'other' ? item.productTypeOther : item.productType,
      "collections": item.collections === 'other' ? item.collectionOther : item.collections,
      "tags": item.tags,
      "markup": item.markup.replace('%', '').replace(),
      "orderNumber": item.orderNumber,
      "skuUpstream": item.skuUpstream,
      "skuDownstream": item.skuDownstream,
      "upstreamPortalID": this.upStreamPortal,
      "downstreamPortalId": this.downStreamPortal,
      "unitPriceWithShippingFee": item.unitPriceWithShippingFee.replace('$', '').trim(),
      "publishingDate": item.publishingDate['year'] + '-' + ('0' + item.publishingDate['month']).slice(-2) + '-' + ('0' + item.publishingDate['day']).slice(-2),
    }
    this.loading = true;
    this.productService.updateProduct(item.productID, request, this.downStreamPortal, this.upStreamPortal)
      .subscribe(res => {
        const productDetails = JSON.parse(sessionStorage.getItem('products'));
        if (res && res.length > 0) {

          res.forEach((item) => {
            item.markup = item.markup + ' %';
            item.unitPriceWithShippingFee = '$ ' + item.unitPriceWithShippingFee;
            if (item.collections) {
              const checkCollection = this.collections.filter((collection) => collection === item.collections);
              if (checkCollection.length === 0) {
                item.collectionOther = item.collections;
                item.collections = 'other';

              }
            }
            if (item.productType) {
              const checkPtype = this.productTypes.filter((ptype) => ptype === item.productType);
              if (checkPtype.length === 0) {
                item.productTypeOther = item.productType;
                item.productType = 'other';
              }
            }

            if (item.publishingDate) {
              if (item.publishingDate.indexOf('T') >= 0) {
                const date = item.publishingDate.split('T');
                let returndate = date[0].split('-');
                item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
                //'2021-10-01';//returndate[0] + '-' + returndate[1] + '-' + returndate[2];
              } else {
                const returndate = item.publishingDate.split('-');
                item.publishingDate = new NgbDate(Number(returndate[0]), Number(returndate[1]), Number(returndate[2]));
              }
            }
            item.isReadonly = false;

            let selectedIndex;
            productDetails.forEach((prod, index) => {
              if (prod.productID === item.productID) {
                selectedIndex = index;
              }
            });
            if (selectedIndex) {
              productDetails[selectedIndex] = item;
            } else {
              productDetails.push(item);
            }
          });
          // this.getProducts();
          if (item.productType === 'other') {
            if (!this.productTypes) {
              this.productTypes = [];
            }
            this.productTypes.push(item.productTypeOther);
          }
          if (item.collections === 'other') {
            if (!this.collections) {
              this.collections = [];
            }
            this.collections.push(item.collectionOther);
          }
          item.productType = item.productTypeOther;
          item.collections = item.collectionOther;
        }


        productDetails.forEach((obj) => {
          if (obj.downstreamStatus.toUpperCase().indexOf('CREATED') >= 0
            || obj.downstreamStatus.toUpperCase().indexOf('PUBLISHED') >= 0) {
            productDetails.forEach((obj1, index) => {
              if (obj1.skuDownstream === obj.skuDownstream) {
                productDetails[index].isReadonly = true;
              }
            });
          }
        });
        sessionStorage.setItem('products', JSON.stringify(productDetails));
        this.productDetails = productDetails;
        this.originalList = productDetails;
        this.totalProducts = productDetails.length;
        let result = this.productDetails.map(a => a.downstreamStatus);
        this.uniqueStatuses = [...new Set(result)];
        this.pager.totalPages = undefined;
        this.setPage(this.pager.currentPage);
        this.loading = false;
        sessionStorage.setItem('products', JSON.stringify(this.productDetails));
        console.log(res);
        this.toaster.show('success', 'Saving', 'Product details updated successfully!');
      }, error => {
        if (error.status === 403) {
          sessionStorage.setItem('productItem', JSON.stringify(item));
          this.refreshToken('save')
        }
        this.loading = false;
        this.toaster.show('error', 'Saving', 'Something went wrong try again !!');
      });
  }

  removeFromList(id, tag) {
    let index = 0;
    const item = this.productDetails.filter(function (item) {
      return item.productID === id
    });

    this.productDetails.forEach((item, i) => {
      if (item.productID === id) {
        index = i;
      }
    });

    const selectedItems = this.productDetails[index].tags.filter(function (item) {
      return item !== tag
    })
    this.productDetails[index].tags = selectedItems;
    sessionStorage.setItem('products', JSON.stringify(this.originalList));
  }

  uploadProducts() {
    // this.loading = true;
    // this.productService.uploadProducts(this.upStreamPortal,this.downStreamPortal)
    //   .subscribe(res => {
    //     this.loading = false;
    //     this.getProducts();
    //   }, error => {
    //     this.loading = false;
    //   });
    if (!this.isUploadStarted) {
      const divNot = document.getElementById("collapseExample");

      if (!divNot.classList.contains('show')) {
        document.getElementById("openModalButtonDownload").click();
      }
      EventSource = SSE;
      let url = environment.baseUrl + APICONFIG.upLoadProducts + this.upStreamPortal + '/' + this.downStreamPortal;
      this.isUploadStarted = true;
      const user = JSON.parse(sessionStorage.getItem(STORAGEKEY.auth));
      const headerValue = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user['access_token'],
      }
      const payload = {
        headers: headerValue,
        payload: '["ALL"]'
      };
      if (this.selectedProducts.length > 0) {
        payload.payload = JSON.stringify(this.selectedProducts.map(a => a.productID));
      }
      this.uploadLoadEvent = new SSE(url, payload);
      // const eventSource = new EventSource("http://localhost:9192/UploadProductEmitter/u@2001/d@2003");
      // eventSource.addEventListener('status', function (e) {
      //   console.log('System status is now: ' + e.data);
      // });

      this.uploadLoadEvent.addEventListener(
        this.userDetails.customerID,
        this.uploadServerEvent,
        false
      );

      this.uploadLoadEvent.addEventListener(
        'progress',
        this.uploadServerEvent,
        false
      );

      this.uploadLoadEvent.addEventListener("COMPLETE", function (evt) {
        console.log(evt);
        this.uploadLoadEvent.close();
        this.uploadLoadEvent.removeEventListener("progress");
        this.selectedProducts = [];
      });
      this.uploadLoadEvent.stream();

      this.uploadLoadEvent.onopen = (e) => console.log("open");

      this.uploadLoadEvent.onerror = (e) => {
        if (e.readyState == EventSource.CLOSED) {
          console.log("close");
          this.isUploadStarted = false;
          this.selectedProducts = [];
          this.uploadLoadEvent.removeEventListener("progress");
          if (e.source && e.source.xhr && e.source.xhr.status && e.source.xhr.status === 403) {
            this.refreshToken('upload');
          }
        } else {
          console.log(e);
          this.isUploadStarted = false;
          this.selectedProducts = [];
          this.uploadLoadEvent.removeEventListener("progress");
          if (e.source && e.source.xhr && e.source.xhr.status && e.source.xhr.status === 403) {
            this.refreshToken('upload');
          }
        }
        //  this.initListener();
      };
    } else {
      this.toaster.show('error', 'Errors', 'One upload is already in process please wait for the existing process to complete');
    }

  }

  zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  loadFromSource() {
    if (!this.isDownloadedStarted) {
      if (this.fromDate && this.toDate) {
        const time1 = moment(this.fromDate).format('YYYY-MM-DD');
        const time2 = moment(this.toDate).format('YYYY-MM-DD');
        if (time1 > time2) {
          alert('To date must be greater than from date');
        } else {
          const formDate = this.zeroPad(this.fromDate['month'], 2) + '-' + this.zeroPad(this.fromDate['day'], 2) + '-' + this.fromDate['year'];
          const toDate = this.zeroPad(this.toDate['month'], 2) + '-' + this.zeroPad(this.toDate['day'], 2) + '-' + this.toDate['year'];
          // this.productService.downLoadProducts(this.upStreamPortal, formDate, toDate)
          //   .subscribe(res => {
          //     this.loading = false;
          //     //  need to create SSE events
          //   }, error => {
          //     this.loading = false;
          //   });
          //  this.toaster.show('success', 'Downloading', 'your down load is started');
          this.initListener(formDate, toDate);
          this.isDownloadedStarted = true;
          const divNot = document.getElementById("collapseExample");

          if (!divNot.classList.contains('show')) {
            document.getElementById("openModalButtonDownload").click();
          }
        }

      } else {
        //  alert('Please select from date and to date');
        this.toaster.show('error', 'Errors ', 'Please select from date and to date');
      }
    } else {
      this.toaster.show('error', 'Errors', 'One download is already in process please wait for the existing process to complete');
    }


  }

  initListener = (formDate, toDate) => {
    EventSource = SSE;
    let url = environment.baseUrl + APICONFIG.downLoadProducts + this.upStreamPortal;
    if (formDate && toDate) {
      url = url + '?endDate=' + toDate + '&startDate=' + formDate;
    }
    const user = JSON.parse(sessionStorage.getItem(STORAGEKEY.auth));
    const headerValue = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + user['access_token'],
    }

    this.downLoadEvent = new SSE(url, {
      headers: headerValue,
      payload: ''
    });


    this.downLoadEvent.addEventListener(
      this.userDetails.customerID,
      this.handleServerEvent,
      false
    );

    this.downLoadEvent.addEventListener(
      'progress',
      this.handleServerEvent,
      // function (evt) {
      // function (evt) {
      //   console.log(evt.data);
      //   const json = JSON.parse(evt.data);
      //   this.notificationService.emitNotificationChanges(json);
      //   console.log(json);
      //   if(json.percentFinish && json.percentFinish == 100){
      //     eventSource.close();
      //     eventSource.removeEventListener("progress");
      //
      //   }
      // },
      false
    );

    this.downLoadEvent.addEventListener("COMPLETE", function (evt) {
      console.log(evt);
      this.downLoadEvent.close();
      this.downLoadEvent.removeEventListener("progress");

    });
    this.downLoadEvent.stream();

    this.downLoadEvent.onopen = (e) => console.log("open");

    this.downLoadEvent.onerror = (e) => {
      if (e.readyState == EventSource.CLOSED) {
        console.log("close");
        this.isDownloadedStarted = false;
        this.downLoadEvent.removeEventListener("progress");
        if (e.source && e.source.xhr && e.source.xhr.status && e.source.xhr.status === 403) {
          this.refreshToken('download');
        }
      } else {
        this.isDownloadedStarted = false;
        this.downLoadEvent.removeEventListener("progress");
        console.log(e);
        if (e.source && e.source.xhr && e.source.xhr.status && e.source.xhr.status === 403) {
          this.refreshToken('download');
        }
      }
      //  this.initListener();
    };


  };

  uploadServerEvent = (e) => {
    //  console.log(e.data);
    const json = JSON.parse(e.data);
    console.log(json);
    const divNot = document.getElementById("collapseExample");

    if (!divNot.classList.contains('show')) {
      document.getElementById("openModalButtonDownload").click();
    }
    this.utils.uploadNotifications = [];
    this.utils.uploadNotifications.push(json);
    if (json.messageType === 'FAILED' || json.messageType === 'FAILURE') {
      this.uploadLoadEvent.close();
      this.uploadLoadEvent.removeEventListener("progress");
      this.isUploadStarted = false;
      this.selectedProducts = [];
      this.toaster.show('error', 'Upload', 'Your upload operation is failed');
      setTimeout((item) => {
        this.utils.uploadNotifications = [];
        if (this.utils.notifications.length === 0) {
          if (divNot.classList.contains('show')) {
            document.getElementById("openModalButtonDownload").click();
          }

        }
      }, 3000);
    }
    if (json.percentFinish && json.percentFinish == 100) {
      this.uploadLoadEvent.close();
      this.uploadLoadEvent.removeEventListener("progress");
      this.isUploadStarted = false;
      this.selectedProducts = [];
      this.toaster.show('success', 'Upload', 'Your upload is completed please refresh the table to see updated products');
      setTimeout((item) => {
        this.utils.uploadNotifications = [];
        if (this.utils.notifications.length === 0) {
          if (divNot.classList.contains('show')) {
            document.getElementById("openModalButtonDownload").click();
          }

        }
      }, 3000);
    }
    //  this.notificationService.emitUploadNotificationChanges(json);
  };
  handleServerEvent = (e) => {
    //  console.log(e.data);
    const json = JSON.parse(e.data);
    console.log(json);
    const divNot = document.getElementById("collapseExample");

    if (!divNot.classList.contains('show')) {
      document.getElementById("openModalButtonDownload").click();
    }
    this.utils.notifications = [];
    this.utils.notifications.push(json);
    if (json.messageType === 'FAILED' || json.messageType === 'FAILURE') {
      this.uploadLoadEvent.close();
      this.uploadLoadEvent.removeEventListener("progress");
      this.isUploadStarted = false;
      this.selectedProducts = [];
      this.toaster.show('error', 'Upload', 'Your download operation is failed');
      setTimeout((item) => {
        this.utils.uploadNotifications = [];
        if (this.utils.notifications.length === 0) {
          if (divNot.classList.contains('show')) {
            document.getElementById("openModalButtonDownload").click();
          }

        }
      }, 3000);
    }
    if (json.percentFinish && json.percentFinish == 100) {
      this.downLoadEvent.close();
      this.downLoadEvent.removeEventListener("progress");
      this.isDownloadedStarted = false;
      this.toaster.show('success', 'Download', 'Your download is completed please refresh the table to see updated products');
      setTimeout((item) => {
        this.utils.notifications = [];
        if (this.utils.uploadNotifications.length === 0) {
          if (divNot.classList.contains('show')) {
            document.getElementById("openModalButtonDownload").click();
          }
        }
      }, 3000);

    }


    // this.notificationService.emitNotificationChanges(json);

    // let newNotifications = this.state.newNotifications;
    // newNotifications.unshift({
    //   from: json.from,
    //   message: json.message,
    //   isRead: false,
    // });

    // this.setState({ newNotifications: newNotifications });
  };


  getSalePrice(price, markup) {
    if (price && markup) {
      markup = markup.replace('%', '').trim();
      price = price.replace('$', '').trim();
      return (price * (1 + (markup / 100))).toFixed(2);
    }
    return '';
  }

  sortData(key) {
    if (key) {
      this.sorKey = key;
      this.productDetails = this.sortUtilsService.sortByKey(this.productDetails, key, false);
      this.pager = {};
      if (sessionStorage.getItem('currentPage') && sessionStorage.getItem('currentPage') !== ''
        && sessionStorage.getItem('currentPage') !== 'null'
        && sessionStorage.getItem('currentPage') !== 'undefined'
      ) {
        this.setPage(Number(sessionStorage.getItem('currentPage')));
        this.selectedPage = Number(sessionStorage.getItem('currentPage'));
        sessionStorage.removeItem('currentPage');
      } else {
        this.setPage(1);
      }
    } else {
      // this.productDetails = this.productDetails;
      //  this.productDetails = this.sortUtilsService.sortByKey(this.productDetails, this.sorKey, true);
      //  this.sorKey = '';
      //  this.pager = {};
      //  if (sessionStorage.getItem('currentPage') && sessionStorage.getItem('currentPage') !== '') {
      //    this.setPage(Number(sessionStorage.getItem('currentPage')));
      //    this.selectedPage = Number(sessionStorage.getItem('currentPage'));
      //    sessionStorage.removeItem('currentPage');
      //  } else {
      //    this.setPage(1);
      //  }
    }
  }

  getImage(photos) {
    const imgKeys = Object.keys(photos);
    return photos[imgKeys[0]];
  }

  selectProduct(event, product) {
    if (event.target.checked) {
      this.selectedProducts.push(product);
    } else {
      this.selectedProducts = this.selectedProducts.filter((item) => item.productID !== product.productID)
    }
  }

  addToTags(customtag) {
    if (customtag.value && customtag.value !== '') {
      const tagChecking = this.tags.filter((tag) => tag.toLowerCase() === customtag.value.toLowerCase())
      if (tagChecking.length === 0) {
        this.tags.push(customtag.value);
      }
      customtag.value = '';
    }

  }

  checkStatus(status, sku) {
    const productDetails = JSON.parse(sessionStorage.getItem('products'))
    const selectedItems = productDetails.filter(function (item, index) {
      return item.skuDownstream === sku &&
        item.downstreamStatus.toUpperCase().indexOf('CREATED') === -1
        && item.downstreamStatus.toUpperCase().indexOf('PUBLISHED') === -1
    });
    if (status.toUpperCase().indexOf('CREATED') >= 0
      || status.toUpperCase().indexOf('PUBLISHED') >= 0) {
      return true;
    }
    return false;
  }

  getPortalUrl(portalId, type) {
    if (portalId && portalId !== 'null') {
      if (type === 'up') {
        return this.upStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoIconURL;
      } else if (type === 'down') {
        return this.downStreamPortals.filter((portal) => portal.portalID == portalId)[0].portalLogoIconURL;

      }
    }
    return null;
  }

  stopNotifications() {
    this.stopNotificationDownload = true;
    this.utils.notifications = [];
    // this.notificationService.emitStopNotificationChanges(true);
    this.downLoadEvent.close();
    this.isDownloadedStarted = false;
    this.downLoadEvent.removeEventListener("progress");
    const divNot = document.getElementById("collapseExample");

    if (divNot.classList.contains('show')) {
      if (this.utils.notifications.length === 0 && this.utils.uploadNotifications.length === 0) {
        document.getElementById("openModalButtonDownload").click();
      }
    }
  }

  checkNotifications() {
    if (this.utils.notifications.length > 0 || this.utils.uploadNotifications.length > 0) {
      const divNot = document.getElementById("collapseExample");

      if (!divNot.classList.contains('show')) {
        document.getElementById("openModalButtonDownload").click();
      }
      return true;
    }
    return false;
  }

  stopNotificationsUpload() {
    this.stopNotificationUpload = true;
    this.utils.uploadNotifications = [];
    const divNot = document.getElementById("collapseExample");

    if (divNot.classList.contains('show')) {
      if (this.utils.notifications.length === 0 && this.utils.uploadNotifications.length === 0) {
        document.getElementById("openModalButtonDownload").click();
      }
    }
  }

  getPortalName(portalId) {
    if (this.downStreamPortals && portalId) {
      return this.downStreamPortals.filter((obj) => obj.portalID == portalId)[0].portalName;
    }
    return 'Downstream';
  }

  getUpPortalName(portalId) {
    if (this.upStreamPortals && portalId) {
      return this.upStreamPortals.filter((obj) => obj.portalID == portalId)[0].portalName;
    }
    return 'Downstream';
  }

  onItemSelect(item: any) {
    if (this.selectedDropItems.length < 9) {
      this.selectedDropItems.push(item.item_id);
    } else {
      alert('Max 9 columns can be added using Preference');
    }

  }

  onItemDeselect(item: any) {
    const index = this.selectedDropItems.indexOf(item.item_id);
    if (index !== -1) {
      this.selectedDropItems.splice(index, 1);
    }
  }

  getOnly3tags(tags) {
    if (tags && tags.length > 3) {
      return tags.splice(0, tags.length - 3);
    }
    return tags;
  }

  getTitle(title) {
    if (title.length > 20) {
      return title.substring(0, 19) + '..';
    }
    return title;
  }
}
