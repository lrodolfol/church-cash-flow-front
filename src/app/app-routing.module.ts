import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { HeadFrameComponent } from './pages/shared/head-frame/head-frame.component';
import { treasuryRegisterPageComponent } from './pages/treasury-register-page/treasury-registe-page.component';
import { TreasuryOfferingRelatoryPageComponent } from './pages/treasury-offering-relatory-page/treasury-offering-relatory-page.component';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
   }, {
    path: 'login',
    component: LoginPageComponent
   },{
    path: 'dashboard',
    component: HeadFrameComponent,
    children: [
      {
        path: '',
        component: DashboardPageComponent
      }
    ]
   },{
    path: 'offering-register',
    component: HeadFrameComponent,
    children: [
      {
        path: '',
        component: treasuryRegisterPageComponent
      },
    ]
   },{
    path: 'offering-report',
    component: HeadFrameComponent,
    children: [
      {
        path: '',
        component: TreasuryOfferingRelatoryPageComponent
      }
    ]
   }   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
