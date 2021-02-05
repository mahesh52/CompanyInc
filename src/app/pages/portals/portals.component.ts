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

  constructor(private user: UsersService, private utilService: UtilsService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit() {
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
      "customerID": "cust@dev",
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
      console.log(res);
    }, error => {
      console.log('Error while verifying the upstream portals');
      console.log(error);
    });
  }
}
