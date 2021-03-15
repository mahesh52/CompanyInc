import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from "../../services/utils.service";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {ToasterService} from "../../common/toaster.service";

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
  variants = [];
  productDetails = [];
  selectedId: string;
  salePrice = '';
  downStreamPortal: any;
  upStreamPortal: any;
  selectedColor:any;
  @ViewChild('carousel', {static: true}) carousel: NgbCarousel;

  constructor(private toaster: ToasterService,private utilService: UtilsService,private route: ActivatedRoute, private router: Router, private utils: UtilsService, private productService: ProductService) {
  }

  ngOnInit() {

    this.selectedId = this.route.snapshot.paramMap.get('id');
    this.productDetails = JSON.parse(sessionStorage.getItem('products'));
    this.selectedProduct = this.productDetails[this.selectedId];
    this.downStreamPortal = sessionStorage.getItem('downStream');
    this.upStreamPortal = sessionStorage.getItem('upStream');
    console.log(this.selectedId);
    console.log(this.selectedProduct);
    this.selectedColor = this.selectedProduct.variantColors[0];
    this.getGlobalConfigurations();
    this.selectedItems = this.selectedProduct.tags;

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
      this.selectedProduct.salePrice =  (price * (1 + (markup / 100))).toFixed(2);
      console.log( this.selectedProduct.salePrice );
    }
  }

  getTags(tags) {
    if(tags){
      return tags.split(',').filter(item => item);
    }

  }

  hasValue(value) {
    let hasFound = false;
    if(this.selectedItems){
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
    if (date !== '') {
      date = date.split('T');
      let returndate = date[0].split('-');
      return returndate[2] + '/' + returndate[1] + '/' + returndate[0];
    }
    return 'N/A';
  }
  getImages(images){
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
      if(!this.selectedItems){
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

  back() {
    this.router.navigate(['dashboard']);
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
    }

    this.loading = true;
    this.productService.updateProduct(this.selectedProduct.id, request,this.downStreamPortal,this.upStreamPortal)
      .subscribe(res => {
        if(this.selectedProduct.productType=== 'other'){
          this.productTypes.push(this.selectedProduct.productTypeOther);
        }
        if(this.selectedProduct.collections=== 'other'){
          this.collections.push(this.selectedProduct.collectionOther);
        }
        this.selectedProduct.productType = this.selectedProduct.productTypeOther;
        this.selectedProduct.collections = this.selectedProduct.collectionOther;
        if (res && res.length > 0) {
          res.forEach((item) => {
            let selectedIndex;
            this.productDetails.forEach((prod, index) => {
              if (prod.productID === item.productID) {
                selectedIndex = index;
              }
            });
            if(selectedIndex){
              this.productDetails[selectedIndex] = item;
            } else {
              this.productDetails.push(item);
            }
          });
        }

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
  checkStatus(status){
    if(status.toUpperCase().indexOf('CREATED')>=0){
      return true;
    }
    return false;
  }
}
