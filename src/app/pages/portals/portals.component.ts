import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-portals',
  templateUrl: './portals.component.html',
  styleUrls: ['./portals.component.sass']
})
export class PortalsComponent implements OnInit {
  currentstep = 1;

  constructor(private user: UsersService, private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit() {
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
}
