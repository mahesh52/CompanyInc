import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProductService} from "../../services/product.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router, private productService: ProductService) {
  }

  ngOnInit() {
    this.getProducts();
  }

  details() {
    this.router.navigate(['details']);
  }

  getProducts() {
    this.productService.getProducts()
      .subscribe(res1 => {
        console.log(res1);
      }, error => {
        console.log('Err: while getting products');
      });
  }

}
