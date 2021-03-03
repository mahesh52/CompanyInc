import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PasswordStrengthValidator} from "../register/password-strength.validators";
import {Constants} from "../../common/Constants";
import * as moment from "moment";
import {UtilsService} from "../../services/utils.service";
import {ToasterService} from "../../common/toaster.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {
  userDetails: any;
  registerForm: FormGroup;
  contryList = Constants.countryList;

  constructor(private toaster: ToasterService, private fb: FormBuilder, private utilService: UtilsService) {
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    console.log(this.userDetails)
    this.registerForm = fb.group({
      'name': [this.userDetails.customerName, Validators.required],
      'username': [this.userDetails.customerID, Validators.required],
      'email': [this.userDetails.customerEmailAddress, [Validators.required, Validators.email]],
      'mobile': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
      'address': [this.userDetails.customerBillingAddress.BillingAddress, Validators.required],
      'country': [this.userDetails.customerBillingAddress.Country, Validators.required],
      'city': [this.userDetails.customerBillingAddress.City, Validators.required],
      'zipcode': [this.userDetails.customerBillingAddress.ZipCode, Validators.required],
    })
  }

  ngOnInit() {

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
      "mobile": this.registerForm.value.mobile,
      "customerEmailAddress": this.registerForm.value.email,
      "isCustomerActive": true
    };
    this.utilService.updateCustomer(payload).subscribe(response => {
      this.toaster.show('success', 'Profile Update', 'Your details updated successfully!');
    }, error => {
      this.toaster.show('success', 'Profile Update', 'Something went wrong!');
    });
  }
}
