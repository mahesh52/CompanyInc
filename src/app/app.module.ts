import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import $ from "jquery";
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SiteLayoutComponent } from './layout/site-layout/site-layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoadingComponent } from './common/loading/loading.component';
import {NgxLoadingModule} from "ngx-loading";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ToastrModule,
  ToastContainerModule,
  ToastNoAnimationModule,
} from '../lib/public_api';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetailsComponent } from './pages/details/details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";


@NgModule({
    declarations: [
        AppComponent,
        SiteLayoutComponent,
        HeaderComponent,
        FooterComponent,
        HomeComponent,
        DashboardComponent,
        DetailsComponent,
        LoginComponent,
        RegisterComponent,
        LoadingComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SlickCarouselModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxLoadingModule,
    ToastNoAnimationModule,
    ToastrModule.forRoot(),
    ToastContainerModule,
    NgMultiSelectDropDownModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
