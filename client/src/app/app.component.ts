import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { mergeMap, map, reduce, concatMap } from 'rxjs/operators';
import {from} from 'rxjs';

@Component({
  selector: 'app-root',
  template: ` <h1>Welcome!</h1>
    <h2>
      Your outbound IP address (just to make sure everything is wired correctly)
    </h2>
    {{ ip$ | async }}
    <h2>Leaderboard</h2>
    TODO - Your stuff should go in here...
    <ul>
      <li *ngFor="let player of leaders$ | async">
        {{player}}
      </li>
    </ul>
    `,
})
export class AppComponent {
  ip$ = this.http.get('/ipify', { responseType: 'text' });
  
  leaders$ = this.http.post('http://localhost:4000/api/rpc', JSON.stringify({
    "jsonrpc": "2.0",
    "method": "getLeaderboard",
    "params": [],
    "id": 12345
  })).pipe(
    map((param: any) => param.result),
    concatMap((params) => from(params)),
    mergeMap((param) => this.http.post('http://localhost:4000/api/rpc', JSON.stringify({
      "jsonrpc": "2.0",
      "method": "getPlayer",
      "params": [param],
      "id": 12345
    }))),
    reduce((acc, i: any) => [...acc, i.result.name], [] as string[])
  )
  
  constructor(private http: HttpClient) {}
}
