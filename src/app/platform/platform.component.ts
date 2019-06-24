import {Component, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {AssetsService} from '../service/assets.service';
import {Asset} from '../model/asset.model';
import {MenuItem, Message, MessageService} from 'primeng/api';
import {UIChart} from 'primeng/chart';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {

  allAssets: Asset[];
  myAssets: Asset[];
  menuItems: MenuItem[];

  // list with random generated values for available amount and prices
  priceVsAmountList: any[];

  availableMoney: number; // 100000 $
  totalValue: number;

  // selected amount of units to buy or sell
  selectedAmount: number;

  // selected asset to buy/sell
  selectedAsset: Asset;

  showPortfolioPage: Boolean = true;
  showBuySellPage: Boolean = false;
  buyingDialog: Boolean = false;
  sellingDialog: Boolean = false;

  // interval to update prices and available amount, seconds
  timeInterval = 60;

  msgs: Message[] = [];

  // line chart data
  chartData: any;

  // list with latest values of portfolio cost
  totalAmountData: number[];

  constructor(private assetsService: AssetsService,
              private messageService: MessageService) { }

  ngOnInit() {
    this.myAssets = [];
    this.totalAmountData = [0, 0, 0, 0, 0, 0, 0];
    this.availableMoney = 100000;

    this.initChartData();
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
    this.generateMyAssetsList(this.myAssets);

  }

  initChartData() {
    this.chartData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [{
          label: 'My portfolio value',
          data: this.totalAmountData,
          borderColor: '#4bc0c0'
        }]
    };
    this.chartData.datasets.data = Object.assign({}, this.totalAmountData);
  }

  generateRandomPriceAndAmount(assets: Asset[]) {
    this.priceVsAmountList = [];

    let randomAmount = 0;
    let randomStockPrice = 0;

    return assets.forEach( a => {

      randomAmount = this.generateAmount();
      randomStockPrice = +this.generateStockPrice(a.name).toFixed(2);

      this.priceVsAmountList.push({ name: a.name, price: randomStockPrice, amount: randomAmount});
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
    if (assets.length != null) {

      this.totalValue = 0;
      this.myAssets = [];

      assets.forEach( as => {
        const asValue = Number(as.amount * this.findPriceByAssetName(as.name));
        this.myAssets.push({ id: as.id,
                             name: as.name,
                             amount: as.amount,
                             price: this.findPriceByAssetName(as.name),
                             value: +asValue.toFixed(2)});

        // count total costs of your assets with current prices
        this.totalValue += +asValue.toFixed(2);
      });
      // take latest x values of portfolio cost to represent statistic
      this.totalAmountData.push(this.totalValue);
      this.totalAmountData.shift();

      // update chart
      this.initChartData();

      this.myAssets = this.myAssets.filter( as => as.amount !== 0);
    }
  }

  // return random int as available amount
  generateAmount() {
    return 3000 + this.getRandomInt(-1500, 1500);
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // the maximum is exclusive and the minimum is inclusive
  }

  // return random stock price
  generateStockPrice(name: string) {
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

  findAssetByName(asset: Asset) {
    return this.myAssets.find( as => as.name === asset.name);
  }

  openDialogToBuy(asset: Asset) {
    this.selectedAsset = asset;
    this.buyingDialog = true;
  }

  openDialogToSell(asset: Asset) {
    if (this.findAssetByName(asset)) {
        this.selectedAsset = this.myAssets.filter( as => as.name === asset.name)[0];
        this.sellingDialog = true;
    } else {
      this.showMsg('you dont this kind of asset');
    }
  }

  buyAsset() {

    if (this.selectedAmount - this.selectedAsset.amount > 0) {
        this.showMsg('This amount is not available');
        return;
    }

    if (!this.enoughFunds()) {
        this.showMsg('You dont have enough funds');
        return;

    } else {
      this.availableMoney = this.availableMoney - this.selectedAmount * Number(this.selectedAsset.price);

      this.showMsg('The operation has been successful');

      this.continueBuying(this.selectedAsset);

      this.buyingDialog = false;
      this.selectedAmount = 0;
    }
  }

  sellAsset() {

    if (this.selectedAmount - this.selectedAsset.amount > 0) {
      this.showMsg('You have only ' + this.selectedAsset.amount + ' to sell');
      return;
    }

    this.showMsg('The operation has been successful');

    this.updateList(this.selectedAsset, false);

    this.sellingDialog = false;
    this.selectedAmount = 0;
  }

  continueBuying(asset: Asset) {
    const existingItem = this.myAssets.filter( a => a.name === asset.name);

    if (!existingItem[0]) {
        this.myAssets.push({id: asset.id,
                            name: asset.name,
                            amount: this.selectedAmount,
                            price: this.findPriceByAssetName(asset.name),
                            value: +(this.selectedAmount * this.findPriceByAssetName(asset.name)).toFixed(2)});

      // update my portfolio table
      this.generateMyAssetsList(this.myAssets);

    } else {
          this.updateList(existingItem[0], true);
      }
  }

  updateList(item: Asset, buy: boolean) {

    let asAmount;

    if (buy) {
       asAmount = Number(item.amount) + Number(this.selectedAmount);
    } else {
       asAmount = item.amount - this.selectedAmount;
    }

    const asValue = asAmount * this.findPriceByAssetName(item.name).toFixed(2);

    const newItem = { id: item.id,
                      name: item.name,
                      amount: asAmount,
                      price:  this.findPriceByAssetName(item.name),
                      value: asValue };

    const atIndex = this.myAssets.findIndex( a => a.name === item.name);
    this.myAssets = this.update(this.myAssets, newItem, atIndex);

    // update my assets and my portfolio table
    this.generateMyAssetsList(this.myAssets);
  }

  // update selected asset parameters
  update(array, newItem, atIndex) {
    return array.map((item, index) => index === atIndex ? newItem : item);
  }

  enoughFunds() {
    return this.availableMoney > this.selectedAmount * this.selectedAsset.price;
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
    this.msgs.push({severity: 'info', summary: 'Message', detail: ': ' + msg});
  }

  selectData(event) {
    this.messageService.clear();
    this.messageService.add({severity: 'info', summary: 'My portfolio total value ',
                              'detail': this.chartData.datasets[event.element._datasetIndex].data[event.element._index] + ' $'});
  }
}
