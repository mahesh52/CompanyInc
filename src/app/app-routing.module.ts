import {NgModule, Component} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SiteLayoutComponent} from './layout/site-layout/site-layout.component';
import {HomeComponent} from './pages/home/home.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {DetailsComponent} from './pages/details/details.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {AuthGuard} from "./auth.guard";
import {LandingComponent} from "./pages/landing/landing.component";
import {PortalsComponent} from "./pages/portals/portals.component";
import {ForgotpasswordComponent} from "./pages/forgotpassword/forgotpassword.component";
import {SubscriptionComponent} from "./pages/subscription/subscription.component";
import {PaymentConfirmComponent} from './pages/payment-confirm/payment-confirm.component';
import {ProfileComponent} from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      {path: '', redirectTo: 'landing', pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'landing', component: LandingComponent},
      {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
      {path: 'register', component: RegisterComponent},
      {path: 'portals', component: PortalsComponent, canActivate: [AuthGuard]},
      {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
      {path: 'details/:id', component: DetailsComponent, canActivate: [AuthGuard]},
      {path: 'forgotpwd', component: ForgotpasswordComponent},
      {path: 'subscription', component: SubscriptionComponent, canActivate: [AuthGuard]},
      {path: 'payment', component: PaymentConfirmComponent, canActivate: [AuthGuard]},
      {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
