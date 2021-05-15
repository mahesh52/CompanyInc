import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UtilsService} from "../../services/utils.service";
import * as moment from "moment";
import {Constants} from "../../common/Constants";
import {ToasterService} from "../../common/toaster.service";
import {error} from "util";
import {expiryDatevalidator, onlyNumericValidator} from "../register/username.validators";

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  get paymentInprocess(): boolean {
    return this._paymentInprocess;
  }

  set paymentInprocess(value: boolean) {
    this._paymentInprocess = value;
  }

  paymentForm: FormGroup;
  subscriptions: any;
  selectedSubscription: any;
  selectedValue: any;
  userDetails: any;
  loading = false;
  private _paymentInprocess = false;
  contryList = Constants.countryList;
  isPaymentCompleted = false;

  constructor(private toaster: ToasterService, private utilService: UtilsService, private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    console.log(this.userDetails);
    this.paymentForm = fb.group({
      'cname': [this.userDetails.customerName, Validators.required],
      'address': [this.userDetails.customerBillingAddress && this.userDetails.customerBillingAddress.line1 ? this.userDetails.customerBillingAddress.line1 : '', Validators.required],
      'line2': [this.userDetails.customerBillingAddress && this.userDetails.customerBillingAddress.line2 ? this.userDetails.customerBillingAddress.line2 : ''],
      'country': [this.userDetails.customerBillingAddress && this.userDetails.customerBillingAddress.Country ? this.userDetails.customerBillingAddress.Country : '', Validators.required],
      'city': [this.userDetails.customerBillingAddress && this.userDetails.customerBillingAddress.City ? this.userDetails.customerBillingAddress.City : '', Validators.required],
      'zipcode': [this.userDetails.customerBillingAddress && this.userDetails.customerBillingAddress.ZipCode ? this.userDetails.customerBillingAddress.ZipCode : '', [Validators.required, Validators.minLength(5), Validators.maxLength(6), onlyNumericValidator]],
      'cardName': ['', Validators.required],
      'card': ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), onlyNumericValidator]],
      'validity': ['', [Validators.required, expiryDatevalidator]],
      'cvv': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3), onlyNumericValidator]],
    })
  }

  ngOnInit() {
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    const type = this.route.snapshot.paramMap.get('id');
    if (this.userDetails.isCustomerSubscriptionActive && type === '0') {
      this.router.navigateByUrl('/dashboard');
    }
    this.getSubscriptions();
  }

  getSubscriptions() {
    this.utilService.getSubscriptions().subscribe(res => {
      this.subscriptions = res;
      this.selectedSubscription = res[0];
      this.selectedValue = res[0].subscriptionID;
    }, error => {
      console.log('Error while getting the subscriptions');
      console.log(error);
    });
  }

  proceedToPayment() {
    setTimeout(() => {
      this._paymentInprocess = false;
    }, 4000);
    this._paymentInprocess = true;
    const expiry = this.paymentForm.value.validity.split('/');
    (<any>window).Stripe.card.createToken({
      number: this.paymentForm.value.card,
      exp_month: expiry[0],
      exp_year: expiry[1],
      cvc: this.paymentForm.value.cvv
    }, (status: number, response: any) => {
      if (status === 200) {
        this.loading = false;
        let token = response.id;
        this.chargeCard(token);
      } else {
        //  alert('Payment is failed please try again !!');
        this.toaster.show('error', '', 'Payment failed please try again!!');
        console.log(response.error.message);
      }
    });
  }

  chargeCard(token: string) {

    let payload = {
      "customerID": this.userDetails.customerID,
      "customerName": this.paymentForm.value.cname,
      "customerSubscriptionID": this.selectedSubscription.subscriptionID,
      "customerSubscriptionStartDate": moment().format("YYYY-MM-DD HH:mm:ss").replace(' ', 'T'),
      "customerSubscriptionEndDate": null,
      "customerBillingAddress": {
        "line1": this.paymentForm.value.address,
        "ZipCode": this.paymentForm.value.zipcode,
        "Country": this.paymentForm.value.country,
        "CustomerName": this.paymentForm.value.cname,
        "City": this.paymentForm.value.city,
        "line2": this.paymentForm.value.line2,
      }
    };
    this.utilService.updateCustomer(payload).subscribe(response => {
      let amount = this.selectedSubscription.subscriptionCost;
      console.log(token);
      this.utilService.chargeCustomer(token, payload, amount).subscribe(res => {
        console.log(res);
        console.log(res);
        if (res) {
          this.user.getUserDetails().subscribe((result) => {
            sessionStorage.setItem('userDetails', JSON.stringify(result));
            this.user.emitUserInfo(true);
            this._paymentInprocess = false;
            this.router.navigate(['payment'])
              .then(() => {
                window.location.reload();
              });
          }, error => {
            this._paymentInprocess = false;
            this.router.navigate(['payment'])
              .then(() => {
                window.location.reload();
              });
          });

        } else {
          this._paymentInprocess = false;
          //  alert('Payment is failed please try again !!');
          this.toaster.show('error', '', 'Payment is failed please try again !!');
        }

      }, error => {
        this._paymentInprocess = false;
        alert('Payment is failed please try again !!');
        this.toaster.show('error', 'Payment', 'Payment failed please try again!!');
        console.log('Error while charging customer');
      })
    }, error => {
      this._paymentInprocess = false;
      //  alert('Payment is failed please try again !!');
      this.toaster.show('error', '', 'Payment failed please try again!!');
      console.log('error while doing payment')
    });


    // const headers = new Headers({'token': token, 'amount': 100});
    // this.http.post('http://localhost:8080/payment/charge', {}, {headers: headers})
    //   .subscribe(resp => {
    //     console.log(resp);
    //   })
  }

  selectSubscription() {
    this.selectedSubscription = this.subscriptions.filter(obj => obj.subscriptionID === this.selectedValue)[0];
  }
}
