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

  // current asset price and available amount list
  priceVsAmountList: any[];

  availableFunds: number;
  totalAssetsValue: number;

  selectedAmount: number;

  selectedAsset: Asset;

  showPortfolioPage: Boolean = true;
  showBuySellPage: Boolean = false;
  buyingDialog: Boolean = false;
  sellingDialog: Boolean = false;

  timeInterval = 60;  // seconds

  msgs: Message[] = [];

  // line chart data
  chartData: any;

  // list with latest values of portfolio cost
  totalFundsChartData: number[];

  constructor(private assetsService: AssetsService,
              private messageService: MessageService) { }

  ngOnInit() {
    this.myAssets = [];
    this.availableFunds = 100000;
    this.totalAssetsValue = this.availableFunds;
    this.generateTotalFundsChartData(); // init list with chart data

    this.initChart();
    this.initTabMenuItems();

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

  initTabMenuItems() {
    this.menuItems = [
      {label: 'PORTFOLIO', command: () => this.openPortfolioPage()},
      {label: 'BUY/SELL ASSETS', command: () => this.openBuySellPage()},
    ];
  }

  // updates every time interval
  generateLists(assetsList: Asset[]) {
    this.generateRandomPriceAndAmount(assetsList);
    this.generateAllAssetsList(assetsList);

    if (this.myAssets.length != null) {
      this.generateMyAssetsList(this.myAssets);
      this.generateTotalPortfolioValue(this.myAssets);
    }
    this.updateChart();
  }


  // ==============================================
  //      random price and amount list
  // ==============================================

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


  // ==============================================
  //      all assets list generator
  // ==============================================

  generateAllAssetsList(assets: Asset[]) {
    this.allAssets = [];

    assets.forEach( as => {
      this.allAssets.push({ id: as.id, name: as.name, amount: this.findAmountByAssetName(as.name),
                            price: this.findPriceByAssetName(as.name), value: null});
    });
  }


  // ==============================================
  //      my assets list generator
  // ==============================================

  generateMyAssetsList(assets: Asset[]) {
      this.myAssets = [];

      assets.forEach( as => {
        const asValue = Number(as.amount * this.findPriceByAssetName(as.name));
        this.myAssets.push({ id: as.id,
                             name: as.name,
                             amount: as.amount,
                             price: this.findPriceByAssetName(as.name),
                             value: +asValue.toFixed(2)});

        this.totalAssetsValue += +asValue.toFixed(2);
      });
  }


  // ==============================================
  //         total portfolio value
  // ==============================================

  generateTotalPortfolioValue(assets: Asset[]) {
      this.totalAssetsValue = 0;

      assets.forEach( as => {
        const asValue = Number(as.amount * this.findPriceByAssetName(as.name));
        this.totalAssetsValue += +asValue.toFixed(2);
      });
  }


  // ==============================================
  //       random amount and price generators
  // ==============================================

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


  // ==============================================
  //        buying/selling assets functions
  // ==============================================

  buyAsset() {
    if (this.selectedAmount - this.selectedAsset.amount > 0) {
        this.showMsg('This amount is not available');
        return;
    }
    if (!this.enoughFunds()) {
        this.showMsg('You dont have enough funds');
        return;
    } else {
      this.availableFunds = this.availableFunds - this.selectedAmount * Number(this.selectedAsset.price);

      this.updateMyAssetsList(this.selectedAsset.name, true);
      this.updateAllAssetsList(this.selectedAsset.name, true);

      this.buyingDialog = false;
      this.selectedAmount = 0;
    }
  }

  sellAsset() {
    if (this.selectedAmount - this.selectedAsset.amount > 0) {
        this.showMsg('You have only ' + this.selectedAsset.amount + ' to sell');
        return;
    }
    const myAssetsItem = this.myAssets.filter( a => a.name === this.selectedAsset.name);

    this.availableFunds = +(this.availableFunds + this.selectedAmount * Number(myAssetsItem[0].price)).toFixed(2);

    this.updateMyAssetsList(this.selectedAsset.name, false);
    this.updateAllAssetsList(this.selectedAsset.name, false);

    this.sellingDialog = false;
    this.selectedAmount = 0;
  }


  // ==============================================
  //     update amount and my assets list
  // ==============================================

  updateMyAssetsList(itemName: string, buy: boolean) {
    let asAmount;
    const myAssetsItem = this.myAssets.filter( a => a.name === itemName);
    const item = myAssetsItem[0];

    if (!myAssetsItem[0]) {
        const newAsset = {id: this.selectedAsset.id,
                          name: this.selectedAsset.name,
                          amount: this.selectedAmount,
                          price: this.findPriceByAssetName(this.selectedAsset.name),
                          value: +(this.selectedAmount * this.findPriceByAssetName(this.selectedAsset.name)).toFixed(2)};

      this.myAssets = [...this.myAssets, newAsset];

      } else {
      if (buy) {
          asAmount = Number(myAssetsItem[0].amount) + Number(this.selectedAmount);
        } else {
          asAmount = myAssetsItem[0].amount - this.selectedAmount;
       }

      const newItem = { id: item.id,
                        name: item.name,
                        amount: asAmount,
                        price: this.findPriceByAssetName(item.name),
                        value: +asAmount * this.findPriceByAssetName(item.name).toFixed(2) };

        const updatedAssets = [...this.myAssets.filter( a => a.name !== newItem.name)];
        updatedAssets.push(newItem);
        this.myAssets = updatedAssets.filter( as => as.amount !== 0);
    }
        this.showMsg('The operation has been successful');
  }

  updateAllAssetsList(itemName: string, buy: boolean) {
    let asAmount;
    const allAssetsItem = this.allAssets.filter( a => a.name === itemName);
    const item = allAssetsItem[0];

    if (buy) {
        asAmount = item.amount - this.selectedAmount;
    } else {
        asAmount = Number(item.amount) + Number(this.selectedAmount);
    }

    const newItem = { id: item.id,
                      name: item.name,
                      amount: asAmount,
                      price: this.findPriceByAssetName(item.name),
                      value: +asAmount * this.findPriceByAssetName(item.name).toFixed(2) };

      const updatedAssets = [...this.allAssets.filter( a => a.name !== newItem.name)];
      updatedAssets.push(newItem);
      this.allAssets = updatedAssets;
      this.sortAllAssetsById();

      this.showMsg('The operation has been successful');
  }

  // ==============================================
  //              dialogs and tabs
  /// =============================================

  openDialogToBuy(asset: Asset) {
    this.selectedAsset = asset;
    if (this.selectedAsset.amount === 0) {
      this.showMsg('This asset is not available');
      return;
    }
    this.buyingDialog = true;
  }

  openDialogToSell(asset: Asset) {
    if (this.findAssetByName(asset)) {
      this.selectedAsset = this.myAssets.filter( as => as.name === asset.name)[0];
      this.sellingDialog = true;
    } else {
      this.showMsg('you dont hane this kind of asset'); // dont open dialog
    }
  }

  openPortfolioPage() {
    this.showPortfolioPage = true;
    this.showBuySellPage = false;
    this.generateTotalPortfolioValue(this.myAssets);
  }

  openBuySellPage() {
    this.showBuySellPage = true;
    this.showPortfolioPage = false;
  }

  // ==============================================
  //                  messages
  // ==============================================

  showMsg(msg: string) {
    this.msgs = [];
    this.msgs.push({severity: 'info', summary: 'Message', detail: ': ' + msg});
  }


  // ==============================================
  //              line chart data
  // ==============================================


  generateTotalFundsChartData() {
    this.totalFundsChartData = [];
    let i;
    for (i = 0; i < 7; i++) {
      this.totalFundsChartData.push(this.availableFunds);
    }
  }

  initChart() {
    this.chartData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [{
        label: 'My portfolio value',
        data: this.totalFundsChartData,
        borderColor: '#7fbcec'
      }]
    };
    this.chartData.datasets.data = Object.assign({}, this.totalFundsChartData);
  }

  updateChart() {
    this.totalFundsChartData.push(this.totalAssetsValue + this.availableFunds);
    this.totalFundsChartData.shift();

    // update chart with new data
    this.initChart();
  }

  selectData(event) {
    this.messageService.clear();
    this.messageService.add({
      severity: 'info',
      summary: 'My portfolio total value ',
      'detail': +(this.chartData.datasets[event.element._datasetIndex].data[event.element._index]).toFixed(2) + ' $'});
  }


  enoughFunds() {
    return this.availableFunds > this.selectedAmount * this.selectedAsset.price;
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

  sortAllAssetsById() {
    this.allAssets.sort(function(obj1, obj2) {
      if ( obj1.id < obj2.id ) {
        return -1;
      } else
      if ( obj1.id > obj2.id ) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
