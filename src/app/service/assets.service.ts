import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Asset, AssetsList} from '../model/asset.model';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {

  constructor(private http: HttpClient) { }

  url = environment.assetsURL;

  getAssets(): Observable<Asset[]> {
    return this.http.get<AssetsList>(this.url).pipe(map(
      (resp => {
        if (!resp.assets) {
          return [];
        }
        return resp.assets;
      })
    ));
  }
}
