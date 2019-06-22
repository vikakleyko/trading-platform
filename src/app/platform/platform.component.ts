import { Component, OnInit } from '@angular/core';
import {AssetsService} from '../service/assets.service';
import {Asset} from '../model/asset.model';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {

  assets: Asset[];

  constructor(private assetsService: AssetsService) { }

  ngOnInit() {
    this.assetsService.getAssets().subscribe( resp => {
      this.assets = resp;
      console.log(this.assets);
    });
  }
}
