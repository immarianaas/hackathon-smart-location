import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { BeachEntity } from './beach-entity';
import { GardenEntity } from './garden-entity';
import { VehicleEntity } from './vehicle-entity';
import { BikeLaneEntity } from './bike-lane-entity';
import { BikeHireDockingStationEntity } from './bike-hire-docking-station-entity';
import { PublicTransportStopEntity } from './public-transport-stop-entity';
import * as L from 'leaflet';
import { interval, NEVER, Observable, of, Subscription, takeWhile, throwError } from 'rxjs';
import { stringify } from 'querystring';
import { ACCESSIBILITY, Entity, PointLocation } from './entity';

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

  addAllMarkers(map: any): void {
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
        this.addAllMarkersInternal(map);
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
      this.evaluateAccessibility(e);

      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");
      const marker = L.marker([lat, lon]);
      marker.addTo(map);
    });
  }

  vehicleMarkers : any[] = [];
  // helper
  private addMovingPointMarkers(
    arr: BeachEntity[] | GardenEntity[] | BikeHireDockingStationEntity[] | PublicTransportStopEntity[] | VehicleEntity[],
    map: any
  ) {
    arr.forEach(e => {
      this.evaluateAccessibility(e);

      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");
      const marker = L.marker([lat, lon]);
      this.vehicleMarkers.push( marker );
      marker.addTo(map);
    });
  }

  private evaluateAccessibility(e: Entity): void {
    // assuming we only have `PointLocation`
    const lat = e.location.value.coordinates[0];
    const lon = e.location.value.coordinates[1];

    const publicTranspDistances = this.publicTransportStops.map(
      (value) => {
        const lat1 = value.location.value.coordinates[0];
        const lon1 = value.location.value.coordinates[1];
        return this.distance(<number>lat, <number>lon, lat1, lon1);
      });


    const bikeLanesDistances = this.bikeLanes.map(
      (lane) => {
        const distances = lane.location.value.coordinates.map(
          (c) => {
            const lat1 = c[0];
            const lon1 = c[1];
            return this.distance(<number>lat, <number>lon, lat1, lon1);
          });
        return Math.min(...distances);
      });

    const minValue = Math.min(...publicTranspDistances, ...bikeLanesDistances);
    e.accessibility = this.getAccessibilityLevel(minValue);

    console.log("[evaluateAccessibility]", e.type, minValue, this.getAccessibilityLevel(minValue));
  }

  private getAccessibilityLevel(dist: number) {
    if (dist <= 0.005)
      return ACCESSIBILITY.HIGH;
    else if (dist <= 0.015)
      return ACCESSIBILITY.MEDIUM;
    return ACCESSIBILITY.LOW;
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  private addAllMarkersInternal(map: any): void {
    if (!(this.beaches.length > 0
      && this.gardens.length > 0
      && this.bikeHireDockingStations.length > 0
      && this.publicTransportStops.length > 0
      && this.vehicles.length > 0
      && this.bikeLanes.length > 0))
      return;

    this.addPointMarkers(this.beaches, map);
    this.addPointMarkers(this.gardens, map);
    this.addPointMarkers(this.bikeHireDockingStations, map);
    this.addPointMarkers(this.publicTransportStops, map);
    this.addMovingPointMarkers(this.vehicles, map);

    this.addLineMarkers(this.bikeLanes, map); // TODO

    this.setupVehicleUpdates(map);

  }



  // helper
  private addLineMarkers(
    arr: BikeLaneEntity[],
    map: any
  ) {
    // TODO
    /*
    arr.forEach(e => {
    this.evaluateAccessibility(e);

      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");
      const marker = L.marker([lat, lon]);
      marker.addTo(map);
    });
    */
  }


  setupVehicleUpdates(map: any): void {

    interval(2500)
      .subscribe(() => {
        this.entityService.getVehicleEntities().subscribe({
          next: (vehicles) => {
            // clean everything
            this.vehicles = [];

            this.vehicleMarkers.forEach((marker) => {
              marker.removeFrom( map );
            });

            vehicles.forEach(v => {
              this.vehicles.push(v);
            });

            this.addMovingPointMarkers(this.vehicles, map);
          },
          error: (e) => {
            console.log(e);
          },
          complete: () => {
            console.log("new vehicle info fetched")
          }
        });


      });
  }

}