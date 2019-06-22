import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlatformComponent } from './platform/platform.component';
import { LoginComponent } from './login/login.component';
import {AuthService} from './service/auth.service';
import {AuthGuard} from './service/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    PlatformComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
