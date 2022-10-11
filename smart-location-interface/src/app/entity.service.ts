import { Injectable } from '@angular/core';
import { forkJoin, merge, mergeWith, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BeachEntity } from './beach-entity';
import { GardenEntity } from './garden-entity';
import { Entity, EntityType } from './entity';
import { EMPTY } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private url: string = "/api/v2/entities";
  constructor(
    private http: HttpClient
  ) { }

  private getBeachEntities(): Observable<BeachEntity[]> {
    return this.http.get<BeachEntity[]>( this.url + "?type=Beach");
  }

  private getGardenEntities(): Observable<Entity[]> {
    return this.http.get<GardenEntity[]>( this.url + "?type=Garden");
  }
  
  getEntities( type : EntityType ): Observable<BeachEntity[] | Entity[]> {
    switch( type )
    {
      case EntityType.BEACH:
        return this.getBeachEntities();

      default:
        return EMPTY;
    }
  }

  getAllEntities(): Observable<BeachEntity[] | Entity[]>
  {
    var a = this.getBeachEntities() ;

    // aqui podemos juntar pedidos de vários tipos diferentes;
    // isto é apenas um exemplo
    var b = this.getGardenEntities() ;    
    return merge( a, b );
  }
}
