import { Component, OnInit } from '@angular/core';
import {AssetsService} from '../service/assets.service';
import {Asset} from '../model/asset.model';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {

  assets: Asset[];
  menuItems: MenuItem[];

  showPortfolioPage: Boolean = true;
  showBuySellPage: Boolean = false;

  constructor(private assetsService: AssetsService) { }

  ngOnInit() {
    this.assetsService.getAssets().subscribe( resp => {
      this.assets = resp;
      console.log(this.assets);
    });
    this.initMenuItems();
  }

  initMenuItems() {
    this.menuItems = [
      {label: 'PORTFOLIO', command: () => this.openPortfolioPage()},
      {label: 'BUY/SELL ASSETS', command: () => this.openBuySellPage()},
    ];
  }

  openPortfolioPage() {
    this.showPortfolioPage = true;
    this.showBuySellPage = false;
    console.log(this.showPortfolioPage);
  }

  openBuySellPage() {
    this.showBuySellPage = true;
    this.showPortfolioPage = false;
    console.log(this.showBuySellPage);
  }
}
