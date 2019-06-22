import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlatformComponent } from './platform/platform.component';
import { LoginComponent } from './login/login.component';
import {AuthService} from './service/auth.service';
import {AuthGuard} from './service/auth.guard';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AssetsService} from './service/assets.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    PlatformComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    AssetsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
