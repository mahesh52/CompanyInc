import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-payment-confirm',
  templateUrl: './payment-confirm.component.html',
  styleUrls: ['./payment-confirm.component.sass']
})
export class PaymentConfirmComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  setUpYourAccount() {
    this.router.navigateByUrl('dashboard');
  }
}
