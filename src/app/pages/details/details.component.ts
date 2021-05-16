import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbDate, NgbSlideEvent, NgbSlideEventSource} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from "../../services/utils.service";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {ToasterService} from "../../common/toaster.service";
import * as _ from 'underscore';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  loading = false;
  selectedProduct: any;
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  pauseOnHover = true;
  paused = false;
  tags = [];
  productTypes = [];
  collections = [];
  selectedItems = [];
  colors = [];
  copyData: any;
  variants = [];
  productDetails = [];
  selectedId: string;
  salePrice = '';
  downStreamPortal: any;
  upStreamPortal: any;
  selectedColor: any;
  page: number = 0;
  primaryImageSrc = '';
  minDate: any;
  @ViewChild('carousel', {static: true}) carousel: NgbCarousel;
  activeSliderId = "ngb-slide-0";
  selectedImageIndex = 0;
  selectedProductDetails: any;

  constructor(private toaster: ToasterService, private utilService: UtilsService, private route: ActivatedRoute, private router: Router, private utils: UtilsService, private productService: ProductService) {
    const current = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit() {

    this.selectedId = this.route.snapshot.paramMap.get('id');
    this.productDetails = JSON.parse(sessionStorage.getItem('products'));
    this.selectedProduct = this.productDetails[this.selectedId];
    //   this.selectedProductDetails = this.productDetails[this.selectedId];
    this.downStreamPortal = sessionStorage.getItem('downStream');
    this.upStreamPortal = sessionStorage.getItem('upStream');
    console.log(this.selectedId);
    console.log(this.selectedProduct);
    this.selectedColor = this.selectedProduct.variantColors[0];
    this.getGlobalConfigurations();
    this.selectedItems = this.selectedProduct.tags;
    this.primaryImageSrc = Object.keys(this.selectedProduct.photos)[0];
    this.selectedProduct.formattedImages = this.getImages(this.selectedProduct.photos);
    this.copyData = this.selectedProduct.formattedImages.slice(0, 5);
    this.getSalePrice();
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

  getSalePrice() {
    let price = this.selectedProduct.unitPriceWithShippingFee;
    let markup = this.selectedProduct.markup;
    if (price && markup) {
      markup = markup.replace('%', '').trim();
      price = price.replace('$', '').trim();
      this.selectedProduct.salePrice = (price * (1 + (markup / 100))).toFixed(2);
      console.log(this.selectedProduct.salePrice);
    }
  }

  getTags(tags) {
    if (tags) {
      return tags.split(',').filter(item => item);
    }

  }

  prevImage() {

    this.selectedImageIndex = this.selectedImageIndex - 1;
    this.primaryImageSrc = this.selectedProduct.formattedImages[this.selectedImageIndex];


  }

  nextImage() {
    this.selectedImageIndex = this.selectedImageIndex + 1;
    this.primaryImageSrc = this.selectedProduct.formattedImages[this.selectedImageIndex];
  }

  previousImages() {
    this.page = this.page - 1;
    if (this.page >= 0 && (this.page - 1) * 5 <= this.selectedProduct.formattedImages.length) {
      this.copyData = this.selectedProduct.formattedImages.slice((this.page) * 5, (this.page + 1) * 5);
    } else {
      this.page = this.page + 1;
    }
  }

  nextImages() {
    this.page = this.page + 1;
    if ((this.page) * 5 < this.selectedProduct.formattedImages.length) {
      this.copyData = this.selectedProduct.formattedImages.slice((this.page) * 5, (this.page + 1) * 5);
    } else {
      this.page = this.page - 1;
    }
  }

  cycleToSlide(photo) {
    // console.log(photo.id - 1);
    // let slideId = photo.id - 1;
    let indexSelected;
    this.selectedProduct.formattedImages.forEach((img, index) => {
      if (img === photo) {
        indexSelected = index;
      }
    });
    this.selectedImageIndex = indexSelected;
    this.primaryImageSrc = this.selectedProduct.formattedImages[this.selectedImageIndex];

    // this.activeSliderId = "ngb-slide-" + photo;
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

  addToTags(customtag) {
    if (customtag.value && customtag.value !== '') {
      const tagChecking = this.tags.filter((tag) => tag.toLowerCase() === customtag.value.toLowerCase())
      if (tagChecking.length === 0) {
        this.tags.push(customtag.value);
      }
      customtag.value = '';
    }

  }

  onSlide(slideEvent: NgbSlideEvent) {
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }

  getDate(date) {
    if (date) {
      return date['day'] + '/' + date['month'] + '/' + date['year'];
    }
    return 'N/A';
    // return date;
  }

  getImages(images) {
    return Object.keys(images);
  }

  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
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

  addListToProduct() {
    // this.selectedItems = this.selectedItems.filter(item => item);
    this.selectedProduct.tags = this.selectedItems;
    this.productDetails[this.selectedId] = this.selectedProduct;
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
  }

  shallowEqual(object1, object2) {

    let request = {
      "productID": this.selectedProduct.productID,
      "details": this.selectedProduct.details,
      "productType": this.selectedProduct.productType === 'other' ? this.selectedProduct.productTypeOther : this.selectedProduct.productType,
      "collections": this.selectedProduct.collections === 'other' ? this.selectedProduct.collectionOther : this.selectedProduct.collections,
      "tags": this.selectedProduct.tags,
      "markup": this.selectedProduct.markup.replace('%', '').replace(),
      "orderNumber": this.selectedProduct.orderNumber,
      "skuUpstream": this.selectedProduct.skuUpstream,
      "skuDownstream": this.selectedProduct.skuDownstream,
      "upstreamPortalID": this.upStreamPortal,
      "downstreamPortalId": this.downStreamPortal,
    }
    const keys1 = Object.keys(request);
    for (let key of keys1) {
      if (Array.isArray(object1[key])) {
        if (object1[key].join(',') !== object2[key].join(',')) {
          return false;
        }
      } else {
        if (object1[key] !== object2[key]) {
          return false;
        }
      }

    }

    return true;
  }

  back() {
    const prodDetails = JSON.parse(sessionStorage.getItem('products'));

    if (!this.shallowEqual(prodDetails[this.selectedId], this.selectedProduct)) {
      if (confirm("The changes made are saved and lost, do you want to continue? ")) {
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate(['dashboard']);
    }

  }

  saveData() {
    let request = {
      "productID": this.selectedProduct.productID,
      "details": this.selectedProduct.details,
      "productType": this.selectedProduct.productType === 'other' ? this.selectedProduct.productTypeOther : this.selectedProduct.productType,
      "collections": this.selectedProduct.collections === 'other' ? this.selectedProduct.collectionOther : this.selectedProduct.collections,
      "tags": this.selectedProduct.tags,
      "markup": this.selectedProduct.markup.replace('%', '').replace(),
      "orderNumber": this.selectedProduct.orderNumber,
      "skuUpstream": this.selectedProduct.skuUpstream,
      "skuDownstream": this.selectedProduct.skuDownstream,
      "upstreamPortalID": this.upStreamPortal,
      "downstreamPortalId": this.downStreamPortal,
      "unitPriceWithShippingFee": this.selectedProduct.unitPriceWithShippingFee.replace('$', '').trim(),
      "publishingDate": this.selectedProduct.publishingDate['year'] + '-' + ('0'+this.selectedProduct.publishingDate['month']).slice(-2) + '-' + ('0'+this.selectedProduct.publishingDate['day']).slice(-2),
    }

    this.loading = true;
    const productDetails = JSON.parse(sessionStorage.getItem('products'));
    this.productService.updateProduct(this.selectedProduct.id, request, this.downStreamPortal, this.upStreamPortal)
      .subscribe(res => {
        if (this.selectedProduct.productType === 'other') {
          this.productTypes.push(this.selectedProduct.productTypeOther);
        }
        if (this.selectedProduct.collections === 'other') {
          this.collections.push(this.selectedProduct.collectionOther);
        }
        this.selectedProduct.productType = this.selectedProduct.productTypeOther;
        this.selectedProduct.collections = this.selectedProduct.collectionOther;
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
        this.productDetails = productDetails;
        productDetails.forEach((item, i) => {
          if (item.productID === request.productID) {
            this.selectedId = i;
          }
        });
        this.loading = false;
        this.productDetails[this.selectedId] = this.selectedProduct;
        sessionStorage.setItem('products', JSON.stringify(this.productDetails));
        this.toaster.show('success', '', 'Product details updated successfully!');
        console.log(res);
      }, error => {
        this.loading = false;
        this.toaster.show('error', '', 'Something went wrong try again !!');
      });
  }

  removeFromList(tag) {
    const selectedItems = this.selectedProduct.tags.filter(function (item) {
      return item !== tag
    })
    this.selectedItems = selectedItems;
    this.selectedProduct.tags = selectedItems;
    this.productDetails[this.selectedId] = this.selectedProduct;
    sessionStorage.setItem('products', JSON.stringify(this.productDetails));
  }

  checkStatus(status) {
    if (status.toUpperCase().indexOf('CREATED') >= 0) {
      return true;
    }
    return false;
  }
}
