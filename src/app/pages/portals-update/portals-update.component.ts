import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {UtilsService} from "../../services/utils.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-portals-update',
  templateUrl: './portals-update.component.html',
  styleUrls: ['./portals-update.component.sass']
})
export class PortalsUpdateComponent implements OnInit {

  currentstep = 1;
  upStreamPortals: any;
  downStreamPortals: any;
  selectedUpStreamPortals: any[];
  selectedDownStreamPortals: any[];
  userDetails: any;
  loading = false;
  isDataLoaded = false;
  constructor(private user: UsersService, private utilService: UtilsService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit() {

    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails'))[0];
    this.getUpStreamPortals();
    //this.getDownStreamPortals();

    console.log('Error while getting the upstream portals');

  }

  checkIspOrtalSelected(upPortal) {
    const isCheck = this.selectedUpStreamPortals.filter(obj => obj.portalID === upPortal.portalID);
    if (isCheck.length > 0) {
      return true;
    }
    return false;
  }
  checkIspOrtalSelected1(downPortal) {
    const isCheck = this.selectedDownStreamPortals.filter(obj => obj.portalID === downPortal.portalID);
    if (isCheck.length > 0) {
      return true;
    }
    return false;
  }
  gotoStep2() {
    this.currentstep = 2;
  }

  gotoStep3() {
    this.currentstep = 3;
  }

  gotoSubscription() {
    this.router.navigateByUrl('/dashboard');
  }

  getUpStreamPortals() {
    this.utilService.getUpStreamPortals().subscribe(res => {
      this.upStreamPortals = res;
      this.getDownStreamPortals();
    }, error => {
      console.log('Error while getting the upstream portals');
      console.log(error);
    });
  }

  getDownStreamPortals() {
    this.utilService.getDownStreamPortals().subscribe(res => {
      this.downStreamPortals = res;
      this.utilService.getUserUpStreamPortals().subscribe(res => {
        if (res.length > 0) {
          this.utilService.getUserDownStreamPortals().subscribe(res1 => {
            this.isDataLoaded = true;
            if (res1.length > 0) {
              this.selectedUpStreamPortals = res;
              this.selectedDownStreamPortals = res1;
            } else {
              this.selectedUpStreamPortals = [];
              this.selectedDownStreamPortals = [];
            }
          }, error => {
            this.isDataLoaded = true;
            this.selectedUpStreamPortals = [];
            this.selectedDownStreamPortals = [];
            console.log('Error while getting the upstream portals');
            //console.log(error);
          });

        } else {
          this.selectedUpStreamPortals = [];
          this.selectedDownStreamPortals = [];
          this.getUpStreamPortals();
          this.getDownStreamPortals();
        }

      }, error => {
        this.isDataLoaded = true;
        this.selectedUpStreamPortals = [];
        this.selectedDownStreamPortals = [];
        this.getUpStreamPortals();
        this.getDownStreamPortals();
        console.log('Error while getting the upstream portals');
        //console.log(error);
      });
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

  verifyPortal(upPortal, index) {
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
    this.loading = true;

    this.utilService.postVerifyUpStreamPortal(payload).subscribe(res => {
      this.loading = false;
      upPortal.isVerified = true;
      this.selectedUpStreamPortals[index].succesMessage = 'Congrats, Your upstream portal verified';
      setTimeout(() => {
        this.selectedUpStreamPortals[index].succesMessage = null;
      }, 8000)
      console.log(res);
    }, error => {
      this.loading = false;
      //  upPortal.isVerified = true;
      if (error && error.status === 200) {
        upPortal.isVerified = true;
        this.selectedUpStreamPortals[index].succesMessage = 'Congrats, Your upstream portal verified';
        setTimeout(() => {
          this.selectedUpStreamPortals[index].succesMessage = null;
        }, 8000)
      } else {
        this.selectedUpStreamPortals[index].errorMessage = 'Failed to verify upstream portal please review your credentials';
        setTimeout(() => {
          this.selectedUpStreamPortals[index].errorMessage = null;
        }, 12000)
      }
      console.log('Error while verifying the upstream portals');
      console.log(error);
    });
  }

  verifyDownStreamPortal(downPortal, index) {
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
    this.loading = true;
    this.utilService.postVerifyUpStreamPortal(payload).subscribe(res => {
      this.loading = false;
      downPortal.isVerified = true;
      console.log(res);
      this.selectedDownStreamPortals[index].succesMessage = 'Congrats, Your downstream portal is verified';
      setTimeout(() => {
        this.selectedDownStreamPortals[index].succesMessage = null;
      }, 8000)
    }, error => {
      this.loading = false;
      if (error && error.status === 200) {
        downPortal.isVerified = true;
        this.selectedDownStreamPortals[index].succesMessage = 'Congrats, Your downstream portal is verified';
        setTimeout(() => {
          this.selectedDownStreamPortals[index].succesMessage = null;
        }, 8000)
      } else {
        this.selectedDownStreamPortals[index].errorMessage = 'Failed to verify downstream portal please review your credentials';
        setTimeout(() => {
          this.selectedDownStreamPortals[index].errorMessage = null;
        }, 12000)
      }
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
