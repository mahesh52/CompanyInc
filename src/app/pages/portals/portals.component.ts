import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UtilsService} from "../../services/utils.service";

@Component({
  selector: 'app-portals',
  templateUrl: './portals.component.html',
  styleUrls: ['./portals.component.scss']
})
export class PortalsComponent implements OnInit {
  currentstep = 1;
  upStreamPortals: any;
  downStreamPortals: any;
  selectedUpStreamPortals: any[];
  selectedDownStreamPortals: any[];
  userDetails: any;

  constructor(private user: UsersService, private utilService: UtilsService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    this.selectedUpStreamPortals = [];
    this.selectedDownStreamPortals = [];
    this.getUpStreamPortals();
    this.getDownStreamPortals();
  }

  gotoStep2() {
    this.currentstep = 2;
  }

  gotoStep3() {
    this.currentstep = 3;
  }

  gotoSubscription() {
    this.router.navigateByUrl('/subscription');
  }

  getUpStreamPortals() {
    this.utilService.getUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
    }, error => {
      console.log('Error while getting the downstream portals');
      console.log(error);
    });
  }

  onClick($event: MouseEvent, data?: any) {
    $event.stopPropagation();
    if ($event.target['checked']) {
      this.selectedUpStreamPortals.push(data);
    } else {
      this.selectedUpStreamPortals = this.selectedUpStreamPortals.filter(obj => obj.portalID !== data.portalID);
    }
    console.log(this.selectedUpStreamPortals);

  }

  onClickDownPortal($event: MouseEvent, data?: any) {
    $event.stopPropagation();
    if ($event.target['checked']) {
      this.selectedDownStreamPortals.push(data);
    } else {
      this.selectedDownStreamPortals = this.selectedDownStreamPortals.filter(obj => obj.portalID !== data.portalID);
    }
    console.log(this.selectedDownStreamPortals);
  }

  verifyPortal(upPortal) {
    console.log(upPortal);
    const payload = {
      "customerID": this.userDetails.customerID,
      "portalType": "Upstream",
      "portalID": upPortal.portalID,
      "portalName": upPortal.portalName,
      "configuration": {
        "Username": upPortal.username,
        "Password": upPortal.password
      },
      "isVerified": true
    }


    this.utilService.postVerifyUpStreamPortal(payload).subscribe(res => {
      upPortal.isVerified = true;
      console.log(res);
    }, error => {
      // todo once service is working
      upPortal.isVerified = true;
      if(error && error.status === 200){
        upPortal.isVerified = true;
      }
      console.log('Error while verifying the upstream portals');
      console.log(error);
    });
  }

  verifyDownStreamPortal(downPortal) {
    const payload = {
      "customerID": this.userDetails.customerID,
      "portalType": "Downstream",
      "portalID": downPortal.portalID,
      "portalName": downPortal.portalName,
      "configuration": {
        "apiKey": downPortal.apikey,
        "Password": downPortal.password,
        "storeName": downPortal.storeName
      },
      "isVerified": true
    }
    this.utilService.postVerifyUpStreamPortal(payload).subscribe(res => {
      downPortal.isVerified = true;
      console.log(res);
    }, error => {
      if(error && error.status === 200){
        downPortal.isVerified = true;
      }
      //todo needs to remove after services working
      downPortal.isVerified = true;
      console.log('Error while verifying the downPortal portals');
      console.log(error);
    });
  }

  isPortalSetupDone() {
    if (this.selectedUpStreamPortals && this.selectedDownStreamPortals) {
      const verifiedUpPortals = this.selectedUpStreamPortals.filter(seletedUp => !seletedUp.isVerified);
      const verifiedDownPortals = this.selectedDownStreamPortals.filter(seletedDown => !seletedDown.isVerified);
      if (verifiedUpPortals.length === 0 && verifiedDownPortals.length === 0) {
        return true;
      }
    }
    return false;
  }

}
