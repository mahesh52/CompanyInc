import { Component, OnInit } from '@angular/core';
import {ngxLoadingAnimationTypes} from "ngx-loading";
import {INgxLoadingConfig} from "ngx-loading";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.sass']
})
export class LoadingComponent implements OnInit {
  loading = true;
  loadingConfig: INgxLoadingConfig = {
    animationType: ngxLoadingAnimationTypes.threeBounce,
    backdropBackgroundColour: 'rgba(0,0,0,0.3)',
    fullScreenBackdrop: true,
    primaryColour: '#6b9ae5',
    secondaryColour: '#eaaf48',
    tertiaryColour: '#ea4883'
  };
  constructor() { }

  ngOnInit() {
    this.loading = true;
  }

}
