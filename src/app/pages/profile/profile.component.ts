import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PasswordStrengthValidator} from "../register/password-strength.validators";
import {Constants} from "../../common/Constants";
import * as moment from "moment";
import {UtilsService} from "../../services/utils.service";
import {ToasterService} from "../../common/toaster.service";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {
  userDetails: any;
  subscriptions: any;
  selectedSubscription: any;
  registerForm: FormGroup;
  contryList = Constants.countryList;
  loading = false;
  activeSection = 'profile';

  constructor(private user: UsersService, private toaster: ToasterService, private fb: FormBuilder, private utilService: UtilsService) {
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    console.log(this.userDetails)
    this.registerForm = fb.group({
      'name': [this.userDetails.customerName, Validators.required],
      'username': [this.userDetails.customerID, Validators.required],
      'email': [this.userDetails.customerEmailAddress, [Validators.required, Validators.email]],
      'mobile': [this.userDetails.customerMobileNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
      'address': [this.userDetails.customerBillingAddress.BillingAddress, Validators.required],
      'line2': [this.userDetails.customerBillingAddress.line2, Validators.required],
      'country': [this.userDetails.customerBillingAddress.Country, Validators.required],
      'city': [this.userDetails.customerBillingAddress.City, Validators.required],
      'zipcode': [this.userDetails.customerBillingAddress.ZipCode, Validators.required],
    })
  }

  ngOnInit() {
    this.getSubscriptions();
  }
  getDate(date) {
    if (date) {
      date = date.split('T');
      let returndate = date[0].split('-');
      return returndate[2] + '/' + returndate[1] + '/' + returndate[0];
    }
    return 'N/A';
  }
  getSubscriptions() {
    this.utilService.getSubscriptions().subscribe(res => {
      this.subscriptions = res;
      this.selectedSubscription = this.subscriptions.filter((subscript) => subscript.subscriptionID === this.userDetails.customerSubscriptionID);
    }, error => {
      console.log('Error while getting the subscriptions');
      console.log(error);
    });
  }

  openSection(section) {
    this.activeSection = section;
  }

  updateProfile() {
    let payload = {
      "customerID": this.registerForm.value.username,
      "customerName": this.registerForm.value.name,
      "customerBillingAddress": {
        "BillingAddress": this.registerForm.value.address,
        "ZipCode": this.registerForm.value.zipcode,
        "Country": this.registerForm.value.country,
        "City": this.registerForm.value.city,
      },
      "customerMobileNumber": this.registerForm.value.mobile,
      "customerEmailAddress": this.registerForm.value.email,
      "isCustomerActive": true
    };
    this.loading = true;
    this.utilService.updateCustomer(payload).subscribe(response => {
      this.loading = false;
      this.toaster.show('success', 'Profile Update', 'Your details updated successfully!');
      this.user.getUserDetails().subscribe(
        result => {
          this.loading = false;
          sessionStorage.setItem('userDetails', JSON.stringify(result));
        },
        error => {
          this.loading = false;
          console.log(error);
        });

    }, error => {
      this.loading = false;
      this.toaster.show('success', 'Profile Update', 'Something went wrong!');
    });
  }
}
