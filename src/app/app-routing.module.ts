import {NgModule, Component} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SiteLayoutComponent} from './layout/site-layout/site-layout.component';
import {HomeComponent} from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetailsComponent } from './pages/details/details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import {AuthGuard} from "./auth.guard";

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      {path: '', redirectTo: 'login', pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'home', component: HomeComponent,canActivate: [AuthGuard]},
      {path: 'register', component: RegisterComponent},
      {path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard]},
      {path: 'details/:id', component: DetailsComponent,canActivate: [AuthGuard]},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
