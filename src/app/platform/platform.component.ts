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

  allAssets: Asset[];
  myAssets: Asset[];
  menuItems: MenuItem[];

  selectedAsset: Asset;

  showPortfolioPage: Boolean = true;
  showBuySellPage: Boolean = false;
  buySellDialog: Boolean = false;

  constructor(private assetsService: AssetsService) { }

  ngOnInit() {
    this.allAssets = [];
    this.myAssets = [];

    this.initMenuItems();

    this.assetsService.getAssets().subscribe( resp => {
      const assets = resp;
      console.log(assets);
      if (assets.length != null) {

        let i = 1;
        setInterval(() => {
            this.generateAssetsList(assets);
        }, 3000);

      } else {
        console.log('assets list is empty');
      }
    });
  }

  initMenuItems() {
    this.menuItems = [
      {label: 'PORTFOLIO', command: () => this.openPortfolioPage()},
      {label: 'BUY/SELL ASSETS', command: () => this.openBuySellPage()},
    ];
  }

  generateAssetsList(assets: Asset[]) {
    this.allAssets = [];
    assets.forEach( as => {

      const asAmount = this.generateAmout();
      const asPrice = this.generateStockPrice(as.name).toFixed(2);
      console.log(this.generateAmout());
      console.log(this.generateStockPrice('gold').toFixed(2));

      this.allAssets.push({ id: as.id, name: as.name, amount: asAmount, price: +asPrice, value: null});
    });
  }

  generateAmout() {
    // return random int
    return 100 + this.getRandomInt(-30, 30);
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // the maximum is exclusive and the minimum is inclusive
  }

  generateStockPrice(name: string) {
    // return random price
    const hash = name.split('').reduce(
      function (a, b) {
        a = (( a << 5 ) - a) + b.charCodeAt(0); return a & a; }, 0
    );
    const amplitude = 100;
    const d = new Date();
    const n = d.getTime();
    return Math.abs(3 * Math.sin(2 * hash * n) + Math.random() * amplitude);
  }

  openDialogToBuySellAsset(asset: Asset) {
    this.selectedAsset = asset;
    console.log(asset);
    this.buySellDialog = true;
  }

  buyAsset() {
    console.log('buy asset');
  }

  sellAsset() {
    console.log('sell asset');
  }

  openPortfolioPage() {
    this.showPortfolioPage = true;
    this.showBuySellPage = false;
  }

  openBuySellPage() {
    this.showBuySellPage = true;
    this.showPortfolioPage = false;
  }
}
