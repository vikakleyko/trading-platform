import { Component, OnInit } from '@angular/core';
import {AssetsService} from '../service/assets.service';
import {Asset} from '../model/asset.model';
import {MenuItem, Message, MessageService} from 'primeng/api';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {

  allAssets: Asset[];
  myAssets: Asset[];
  menuItems: MenuItem[];

  priceVsAmountList: any[];

  availableFunds: number;

  // selected amount of units to buy oe sell
  selectedAmount: number;

  selectedAsset: Asset;

  showPortfolioPage: Boolean = true;
  showBuySellPage: Boolean = false;
  buyingDialog: Boolean = false;
  sellingDialog: Boolean = false;

  timeInterval = 15;
  msgs: Message[] = [];

  constructor(private assetsService: AssetsService) { }

  ngOnInit() {
    this.myAssets = [];
    this.availableFunds = 100000;

    this.initMenuItems();

    this.assetsService.getAssets().subscribe( assetsList => {

      if (assetsList.length != null) {

        this.generateLists(assetsList);

        setInterval(() => {
          this.generateLists(assetsList);
        }, this.timeInterval * 1000);

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

  generateLists(assetsList: Asset[]) {

    this.generateRandomPriceAndAmount(assetsList);
    this.generateAllAssetsList(assetsList);

    // if (this.myAssets.length != null) {
    //    this.generateMyAssetsList(assetsList);
    //    console.log('updates');
    // }
  }

  generateRandomPriceAndAmount(assets: Asset[]) {
    this.priceVsAmountList = [];

    let randomAmount = null;
    let randomStockPrice = null;

    return assets.forEach( a => {

      randomAmount = this.generateAmout();
      randomStockPrice = Number(this.generateStockPrice(a.name).toFixed(2));

      this.priceVsAmountList.push({ name: a.name, price: randomStockPrice, amount: randomAmount});
      console.log(this.priceVsAmountList);
    });
  }

  generateAllAssetsList(assets: Asset[]) {
    this.allAssets = [];

    assets.forEach( as => {
      this.allAssets.push({ id: as.id, name: as.name, amount: this.findAmountByAssetName(as.name),
                          price: this.findPriceByAssetName(as.name), value: null});
    });
  }

  generateMyAssetsList(assets: Asset[]) {
    this.myAssets = [];

    assets.forEach( as => {
      this.myAssets.push({ id: as.id, name: as.name, amount: as.amount, price: this.findPriceByAssetName(as.name),
                           value: as.amount * this.findPriceByAssetName(as.name)});
    });
  }

  generateAmout() {
    // return random int
    return 5000 + this.getRandomInt(-2000, 2000);
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

  findAmountByAssetName(name: string) {
    return this.priceVsAmountList.find( item => item.name === name).amount;
  }

  findPriceByAssetName(name: string) {
    return this.priceVsAmountList.find( item => item.name === name).price;
  }


  openDialogToBuy(asset: Asset) {
    this.selectedAsset = asset;
    this.buyingDialog = true;
  }

  openDialogToSell(asset: Asset) {
    this.selectedAsset = asset;
    this.sellingDialog = true;
  }

  buyAsset() {
    console.log('amount to buy ' + this.selectedAmount);
    if (this.selectedAmount > this.selectedAsset.amount) {
        this.showMsg('This amount is not available');
        return;
    }
    if (!this.enoughFunds()) {
        this.showMsg('You dont have enough funds');
        return;
    } else {
      this.availableFunds = this.availableFunds - this.selectedAmount * this.selectedAsset.price;
      this.showMsg('The operation has been successful');
      this.buyingDialog = false;
      this.selectedAmount = null;
    }
  }

  sellAsset() {
    console.log('sell asset');

    this.sellingDialog = false;
    this.selectedAmount = null;

  }

  enoughFunds() {
    return this.availableFunds > this.selectedAmount * this.selectedAsset.price;
  }

  openPortfolioPage() {
    this.showPortfolioPage = true;
    this.showBuySellPage = false;
  }

  openBuySellPage() {
    this.showBuySellPage = true;
    this.showPortfolioPage = false;
  }

  showMsg(msg: string) {
    this.msgs = [];
    this.msgs.push({severity: 'info', summary: 'Message', detail: msg});
  }
}
