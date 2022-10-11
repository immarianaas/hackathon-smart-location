import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BeachEntity } from './beach-entity';


@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private url: string = "/api/v2/entities";
  constructor(
    private http: HttpClient
  ) { }

  getEntities(): Observable<BeachEntity[]> {
    return this.http.get<BeachEntity[]>( this.url );
  }
}
