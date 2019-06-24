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
import {TabMenuModule} from 'primeng/tabmenu';
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ChartModule} from 'primeng/chart';
import {MessageService} from 'primeng/api';

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
    HttpClientModule,
    TabMenuModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessagesModule,
    MessageModule,
    ChartModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    AssetsService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
