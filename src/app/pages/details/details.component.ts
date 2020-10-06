import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from "../../services/utils.service";
import {ProductService} from "../../services/product.service";
import {Router} from "@angular/router";
import * as moment from "moment";

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
  @ViewChild('carousel', {static: true}) carousel: NgbCarousel;

  constructor(private router: Router, private utils: UtilsService, private productService: ProductService) {
  }

  ngOnInit() {
    this.selectedProduct = JSON.parse(sessionStorage.getItem('selectedProduct'));
    console.log(this.selectedProduct);
    this.colors = this.selectedProduct.variants.map(a => a.color);
    this.colors = [...new Set(this.colors)];
    this.getVariants(this.colors[0]);
    console.log(this.colors);
    this.selectedItems = this.selectedProduct.tags.split(',');
    this.productTypes = this.utils.productTypes;
    this.collections = this.utils.collections;
    this.tags = this.utils.tags;
  }

  getVariants(color) {
    this.variants = this.selectedProduct.variants.filter(function (item) {
      return item.color.trim() === color
    })
  }

  getTags(tags) {
    return tags.split(',');
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

  onSlide(slideEvent: NgbSlideEvent) {
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }
  getDate(date){
    if(date !== ''){
      date = date.split('T');
      let returndate = date[0].split('-');
      return returndate[2]+'/'+returndate[1]+'/'+returndate[0];
    }
    return 'N/A';
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
      this.selectedItems.push(value);
    } else {
      this.selectedItems = this.selectedItems.filter(function (item) {
        return item !== value
      })
    }
    console.log(this.selectedItems);
  }

  addListToProduct() {
    this.selectedProduct.tags = this.selectedItems.toString();
  }

  back() {
    this.router.navigate(['dashboard']);
  }

  saveData() {
    let request = {
      "productDetail": this.selectedProduct.productDetail,
      "productType": this.selectedProduct.productType,
      "collections": this.selectedProduct.collections,
      "tags": this.selectedProduct.tags,
      "markup": this.selectedProduct.markup,
    }
    this.loading = true;
    this.productService.updateProduct(this.selectedProduct.id, request)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
      }, error => {
        this.loading = false;
      });
  }

  removeFromList(tag) {
    const selectedItems = this.selectedProduct.tags.split(',').filter(function (item) {
      return item !== tag
    })
    this.selectedProduct.tags = selectedItems.toString();
  }
}
