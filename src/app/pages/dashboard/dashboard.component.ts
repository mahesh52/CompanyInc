import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {UtilsService} from "../../services/utils.service";
import {PaginationService} from "../../services/pagination.service";
import {SortUtilsService} from "../../services/sort-utils.service";
import {HttpClient} from "@angular/common/http";
import * as moment from 'moment';
import {SSE} from "../landing/sse";
import {environment} from "../../../environments/environment";
import {APICONFIG} from "../../common/APICONFIG";
import {STORAGEKEY} from "../../common/STORAGEKEY";
import {ToasterService} from "../../common/toaster.service";
import {NotificationsService} from "../../services/notifications.service";
import * as jQuery from 'jquery';

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
  uniqueStatuses:any;

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
  userDetails: any;
  selectedProducts = [];
  downLoadEvent: any;
  uploadLoadEvent: any;
  isDownloadedStarted = false;
  isUploadStarted = false;

  constructor(private notificationService: NotificationsService, private toaster: ToasterService, private utilService: UtilsService, private router: Router, private paginationService: PaginationService,
              private productService: ProductService,
              private http: HttpClient,
              private utils: UtilsService,
              private sortUtilsService: SortUtilsService) {

  }

  ngOnInit() {
    this.notificationService.stopnotifications.subscribe((value) => {
      this.downLoadEvent.close();
      this.isDownloadedStarted = false;
      this.downLoadEvent.removeEventListener("progress");
    });
    this.notificationService.stopupLoadnotifications.subscribe((value) => {
      this.uploadLoadEvent.close();
      this.uploadLoadEvent.removeEventListener("progress");
      this.isUploadStarted = false;
    });
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    this.getUpStreamPortals();
  }

  getGlobalConfigurations() {
    this.utilService.getGlobalConfigurations(this.downStreamPortal).subscribe(res => {
      if (res && res.length > 0) {
        this.productTypes = res[0].productTypes;
        this.collections = res[0].collections;
        this.tags = res[0].tags;
      }

    }, error => {
      console.log('Error while getting getGlobalConfigurations');
      console.log(error);
    });
  }

  getUpStreamPortals() {
    this.utilService.getUserUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
      this.upStreamPortal = res[0].portalID;
      this.getDownStreamPortals();
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getUserDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
      this.downStreamPortal = res[0].portalID;
    //  this.getProducts();
      this.getGlobalConfigurations();
      if (sessionStorage.getItem('products') !== '' && sessionStorage.getItem('products') !== null && sessionStorage.getItem('products') !== undefined) {
        const res1 = JSON.parse(sessionStorage.getItem('products'));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
        this.setPage(1);
        let result = this.productDetails.map(a => a.downstreamStatus);
        this.uniqueStatuses = [...new Set(result)];

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
      return item.productID === id
    });
    this.productDetails.forEach((item, i) => {
      if (item.productID === id) {
        index = i;
      }
    });
    console.log(selectedItems);
    this.downStreamPortal = sessionStorage.setItem('downStream', this.downStreamPortal);
    this.upStreamPortal = sessionStorage.setItem('upStream', this.upStreamPortal);
    this.router.navigate(['/details', index]);
  }

  getProducts() {
    this.loading = true;
    this.productService.getProducts(this.upStreamPortal, this.downStreamPortal)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        //res[0].ShopifyStatus = 'Published';

        let res1 = [];
        res.forEach((item) => {
          item.markup = item.markup + ' %';
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
          res1.push(item);
        });
        sessionStorage.setItem('products', JSON.stringify(res1));
        this.productDetails = res1;
        this.originalList = res1;
        this.totalProducts = res1.length;
        let result = this.productDetails.map(a => a.downstreamStatus);
        this.uniqueStatuses = [...new Set(result)];
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
        const items = this.originalList.filter(function (item) {
          return item.downstreamStatus.toUpperCase() === value.toUpperCase()
        });
        this.productDetails = items;
        this.pager = {};
        this.setPage(1);
    } else {
      this.productDetails = this.originalList;
      this.pager = {};
      this.setPage(1);
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
    }

    this.loading = true;
    this.productService.updateProduct(item.productID, request, this.downStreamPortal, this.upStreamPortal)
      .subscribe(res => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            let selectedIndex;
            this.productDetails.forEach((prod, index) => {
              if (prod.productID === item.productID) {
                selectedIndex = index;
              }
            });
            if (selectedIndex) {
              this.productDetails[selectedIndex] = item;
            } else {
              this.productDetails.push(item);
            }
          });
          if(item.productType=== 'other'){
            this.productTypes.push(item.productTypeOther);
          }
          if(item.collections=== 'other'){
            this.collections.push(item.collectionOther);
          }
          item.productType = item.productTypeOther;
          item.collections = item.collectionOther;
        }
        this.loading = false;
        sessionStorage.setItem('products', JSON.stringify(this.productDetails));
        console.log(res);
        this.toaster.show('success', '', 'Product details updated successfully!');
      }, error => {
        this.loading = false;
        this.toaster.show('error', '', 'Something went wrong try again !!');
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
      this.toaster.show('success', 'Uploads', 'Your upload is started please follow notifications to see the progress');
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
      });
      this.uploadLoadEvent.stream();

      this.uploadLoadEvent.onopen = (e) => console.log("open");

      this.uploadLoadEvent.onerror = (e) => {
        if (e.readyState == EventSource.CLOSED) {
          console.log("close");
        } else {
          console.log(e);
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
          this.toaster.show('success', 'Downloading', 'your down load is started');
          this.initListener(formDate, toDate);
          this.isDownloadedStarted = true;
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
    });
    this.downLoadEvent.stream();

    this.downLoadEvent.onopen = (e) => console.log("open");

    this.downLoadEvent.onerror = (e) => {
      if (e.readyState == EventSource.CLOSED) {
        console.log("close");
      } else {
        console.log(e);
      }
      //  this.initListener();
    };


  };

  uploadServerEvent = (e) => {
    //  console.log(e.data);
    const json = JSON.parse(e.data);
    console.log(json);
    if (json.percentFinish && json.percentFinish == 100) {
      this.uploadLoadEvent.close();
      this.uploadLoadEvent.removeEventListener("progress");
      this.isUploadStarted = false;

    }
    this.notificationService.emitUploadNotificationChanges(json);
  };
  handleServerEvent = (e) => {
    //  console.log(e.data);
    const json = JSON.parse(e.data);
    console.log(json);
    if (json.percentFinish && json.percentFinish == 100) {
      this.downLoadEvent.close();
      this.downLoadEvent.removeEventListener("progress");
      this.isDownloadedStarted = false;

    }
    this.notificationService.emitNotificationChanges(json);

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
  checkStatus(status){
    if(status.toUpperCase().indexOf('CREATED')>=0){
      return true;
    }
    return false;
  }
}
