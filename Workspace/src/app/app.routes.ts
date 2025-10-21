import { Routes } from '@angular/router';
import { HomePage } from './pages/AboutUs/home-page/home-page';
import { AccountPage } from './pages/Users/account-page/account-page';
import { MakeOrderPage } from './pages/Orders/make-order-page/make-order-page';
import { PriceCalculatorPage } from './pages/AboutUs/price-calculator-page/price-calculator-page';
import { WherePage } from './pages/AboutUs/where-page/where-page';
import { ShowCartPage } from './pages/Cart/show-cart-page/show-cart-page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'account', component:AccountPage},
  { path: 'make-order', component: MakeOrderPage },
  { path: 'price-calculator', component: PriceCalculatorPage },
  { path: 'contact', component: WherePage },
  { path: 'cart', component: ShowCartPage },
  { path: '**', redirectTo: 'home' }
];
