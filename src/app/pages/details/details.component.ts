import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from "../../services/utils.service";
import {ProductService} from "../../services/product.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.sass']
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

  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;
  constructor(private router: Router,private utils: UtilsService,private productService: ProductService) {
  }

  ngOnInit() {
    this.selectedProduct = JSON.parse(sessionStorage.getItem('selectedProduct'));
    console.log(this.selectedProduct);
    this.selectedItems = this.selectedProduct.tags.split(',');
    this.productTypes = this.utils.productTypes;
    this.collections = this.utils.collections;
    this.tags = this.utils.tags;
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
  addListToProduct(){
    this.selectedProduct.tags = this.selectedItems.toString();
  }

  back(){
    this.router.navigate(['dashboard']);
  }

  saveData(){
    let request = {
      "productDetail": this.selectedProduct.productDetail,
      "productType": this.selectedProduct.productType,
      "collections": this.selectedProduct.collections,
      "tags": this.selectedProduct.tags,
      "markup": this.selectedProduct.markup,
    }
    this.loading = true;
    this.productService.updateProduct(this.selectedProduct.id,request)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
      }, error => {
        this.loading = false;
      });
  }

  removeFromList(tag){
    const selectedItems = this.selectedProduct.tags.split(',').filter(function (item) {
      return item !== tag
    })
    this.selectedProduct.tags = selectedItems.toString();
  }
}
