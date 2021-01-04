import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.sass']
})
export class SubscriptionComponent implements OnInit {
  paymentForm: FormGroup;

  constructor(private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
    this.paymentForm = fb.group({
      'cname': ['', Validators.required],
      'address': ['', Validators.required],
      'country': ['', Validators.required],
      'city': ['', Validators.required],
      'zipcode': ['', Validators.required],
      'cardName': ['', Validators.required],
      'card': ['', Validators.required],
      'validity': ['', Validators.required],
      'cvv': ['', Validators.required],
    })
  }

  ngOnInit() {
  }

  proceedToPayment() {
    const expiry = this.paymentForm.value.validity.split('/');
    (<any>window).Stripe.card.createToken({
      number: this.paymentForm.value.card,
      exp_month: expiry[0],
      exp_year: expiry[1],
      cvc: this.paymentForm.value.cvv
    }, (status: number, response: any) => {
      if (status === 200) {
        let token = response.id;
        this.chargeCard(token);
      } else {
        console.log(response.error.message);
      }
    });
  }

  chargeCard(token: string) {
    console.log(token);
   // const headers = new Headers({'token': token, 'amount': 100});
    // this.http.post('http://localhost:8080/payment/charge', {}, {headers: headers})
    //   .subscribe(resp => {
    //     console.log(resp);
    //   })
  }
}
