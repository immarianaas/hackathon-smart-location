import { Injectable } from '@angular/core';
import { forkJoin, merge, mergeWith, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BeachEntity } from './beach-entity';
import { GardenEntity } from './garden-entity';
import { Entity, EntityType } from './entity';
import { EMPTY } from 'rxjs'
import { BikeHireDockingStationEntity } from './bike-hire-docking-station-entity';
import { PublicTransportStopEntity } from './public-transport-stop-entity';
import { VehicleEntity } from './vehicle-entity';
import { BikeLaneEntity } from './bike-lane-entity';


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

  private getGardenEntities(): Observable<GardenEntity[]> {
    return this.http.get<GardenEntity[]>( this.url + "?type=Garden");
  }

  private getBikeHireDockingStationEntities(): Observable<BikeHireDockingStationEntity[]> {
    return this.http.get<BikeHireDockingStationEntity[]>( this.url + "?type=BikeHireDockingStation");
  }

  private getPublicTransportStopEntities(): Observable<PublicTransportStopEntity[]> {
    return this.http.get<PublicTransportStopEntity[]>( this.url + "?type=PublicTransportStop");
  }
  
  private getVehicleEntities(): Observable<VehicleEntity[]> {
    return this.http.get<VehicleEntity[]>( this.url + "?type=Vehicle");
  }

  private getBikeLaneEntities(): Observable<BikeLaneEntity[]> {
    return this.http.get<BikeLaneEntity[]>( this.url + "?type=BikeLane");
  }

  getAllEntities(): Observable<BeachEntity[] | GardenEntity[] | BikeHireDockingStationEntity[] | PublicTransportStopEntity[] | VehicleEntity[] | Entity[]>
  {
    const a = this.getBeachEntities() ;
    const b = this.getGardenEntities() ;    
    const c = this.getBikeHireDockingStationEntities();
    const d = this.getPublicTransportStopEntities();
    const e = this.getVehicleEntities();
    const f = this.getBikeLaneEntities();
    return merge( a, b, c, d, e, f);
  }
}
