import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { BeachEntity } from './beach-entity';
import { GardenEntity } from './garden-entity';
import { VehicleEntity } from './vehicle-entity';
import { BikeLaneEntity } from './bike-lane-entity';
import { BikeHireDockingStationEntity } from './bike-hire-docking-station-entity';
import { PublicTransportStopEntity } from './public-transport-stop-entity';
import * as L from 'leaflet';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { stringify } from 'querystring';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private beaches: BeachEntity[];
  private gardens: GardenEntity[];
  private vehicles: VehicleEntity[];
  private bikeLanes: BikeLaneEntity[];
  private bikeHireDockingStations: BikeHireDockingStationEntity[];
  private publicTransportStops: PublicTransportStopEntity[];

  private setupComplete: boolean = false;

  constructor(
    private entityService: EntityService
  ) {
    this.beaches = [];
    this.gardens = [];
    this.vehicles = [];
    this.bikeLanes = [];
    this.bikeHireDockingStations = [];
    this.publicTransportStops = [];
  }

  addAllMarkers( map : any ): void {
    this.entityService.getAllEntities().subscribe({
      next: (entities) => {
        entities.forEach(e => {

          // verify 'entities' type
          switch (e.type) {
            case "Beach":
              this.beaches.push(<BeachEntity>e);
              break;
            case "Garden":
              this.gardens.push(<GardenEntity>e);
              break;
            case "Vehicle":
              this.vehicles.push(<VehicleEntity>e);
              break;
            case "BikeLane":
              this.bikeLanes.push(<BikeLaneEntity>e);
              break;
            case "BikeHireDockingStation":
              this.bikeHireDockingStations.push(<BikeHireDockingStationEntity>e);
              break;
            case "PublicTransportStop":
              this.publicTransportStops.push(<PublicTransportStopEntity>e);
              break;
          }
        }); // end of `forEach`
        this.addAllMarkersInternal( map );
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        console.log("done")
      }
    });
  }

  // helper
  private addPointMarkers(
    arr: BeachEntity[] | GardenEntity[] | BikeHireDockingStationEntity[] | PublicTransportStopEntity[] | VehicleEntity[],
    map: any
  ) {
    arr.forEach(e => {
      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");
      const marker = L.marker([lat, lon]);
      marker.addTo(map);
    });
  }

  private addAllMarkersInternal(map: any): void {
    this.addPointMarkers(this.beaches, map);
    this.addPointMarkers(this.gardens, map);
    this.addPointMarkers(this.bikeHireDockingStations, map);
    this.addPointMarkers(this.publicTransportStops, map);
    this.addPointMarkers(this.vehicles, map);
  }
}