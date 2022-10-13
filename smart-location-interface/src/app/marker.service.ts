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
import * as icons from './icons';

const bikeLaneStroke = 5;
const bikeLaneColorRed = '#880808'
const bikeLaneColorYellow = '#FFD700'
const bikeLaneColorGreen = '#50C878'

const bikeLanePointLength = 50;
const bikeLanePointColor = '#070606'
const bikeLaneColorFill = '#FFFDFA'


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

  private vehicleMarkers: any[];



  private markerClusters: any;


  static idEntityMap = new Map<string, Entity>();



  constructor(
    private entityService: EntityService,
  ) {
    this.beaches = [];
    this.gardens = [];
    this.vehicles = [];
    this.bikeLanes = [];
    this.bikeHireDockingStations = [];
    this.publicTransportStops = [];
    this.vehicleMarkers = [];


    this.markerClusters = L.markerClusterGroup({
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster) {

        const markers: any[] = cluster.getAllChildMarkers();

        var nGardens = 0;
        var nBeaches = 0;
        var nBusStops = 0;
        var nBikeHireDockingStation = 0;

        var sumAccessibility = 0;
        var count = 0;
        markers.forEach((c) => {
          if (MarkerService.idEntityMap.get(c.options.alt)?.type == 'Beach') {
            ++nBeaches;
            ++count;
            sumAccessibility += (MarkerService.idEntityMap.get(c.options.alt)?.accessibility == undefined)
            ? 0
            : <number>MarkerService.idEntityMap.get(c.options.alt)?.accessibility;
          }
          else if (MarkerService.idEntityMap.get(c.options.alt)?.type == 'Garden') {
            ++nGardens;
            ++count;
            sumAccessibility += (MarkerService.idEntityMap.get(c.options.alt)?.accessibility == undefined)
            ? 0
            : <number>MarkerService.idEntityMap.get(c.options.alt)?.accessibility;
          }
          else if (MarkerService.idEntityMap.get(c.options.alt)?.type == 'PublicTransportStop') {
            ++nBusStops;
          }
          else if (MarkerService.idEntityMap.get(c.options.alt)?.type == 'BikeHireDockingStation') {
            ++nBikeHireDockingStation;
          }


        });

        console.error("HELPPP", sumAccessibility / count);
        const iconstr = '<fa-icon icon="coffee"></fa-icon>'

        const gardenStr = `<div><span class="badge badge-light">` + nGardens + `</span> <img src="${icons.gardenIcon}" style=" width: 25px; height: 41px;margin: 5px;"></div>`
        const beachesStr = `<div><span class="badge badge-light">` + nBeaches + `</span> <img src="${icons.beachIcon}" style=" width: 25px; height: 41px;margin: 5px;"> </div>`
        const busStopStr = `<div><span class="badge badge-light">` + nBusStops + `</span> <img src="${icons.busStopIcon}" style=" width: 25px; height: 41px;margin: 5px;"></div>`
        const bikeHiringStr = `<div><span class="badge badge-light">` + nBikeHireDockingStation + `</span> <img src="${icons.bikeHireDockingStationIcon}" style=" width: 25px; height: 41px;margin: 5px;"></div>`

        const str = ((nGardens > 0) ? gardenStr : '')
          + ((nBeaches > 0) ? beachesStr : '')
          + ((nBusStops > 0) ? busStopStr : '')
          + ((nBikeHireDockingStation > 0) ? bikeHiringStr : '');

        // return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        return L.divIcon({
          // html: '<div>' + iconstr + '</div>' + '<button type="button" class="btn btn-primary" style="border-radius: 30%;">' + str + '</button>',
          // html: '<div class="cluster-icon-html">     ' + str + '</div>',
          html: `<div class="cluster-icon-html">${str}</div>`,
          iconAnchor: [5, 5],
          className: 'cluster-icon'
        });
      },
    });
  }

  addAllMarkers(map: any): void {
    this.entityService.getAllEntities().subscribe({
      next: (entities) => {
        entities.forEach(e => {
          MarkerService.idEntityMap.set(e.id, e);
          // verify 'entities' type
          switch (e.type) {
            case "Beach":
              // icon is set later
              this.beaches.push(<BeachEntity>e);
              break;
            case "Garden":
              // icon is set later
              this.gardens.push(<GardenEntity>e);
              break;
            case "Vehicle":
              e.iconPath = icons.busPin
              this.vehicles.push(<VehicleEntity>e);
              break;
            case "BikeLane":
              e.iconPath = ""
              this.bikeLanes.push(<BikeLaneEntity>e);
              break;
            case "BikeHireDockingStation":
              e.iconPath = icons.bikeHireDockingStationPin
              this.bikeHireDockingStations.push(<BikeHireDockingStationEntity>e);
              break;
            case "PublicTransportStop":
              e.iconPath = icons.busStopPin
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
    map: any,
  ) {
    arr.forEach(e => {
      this.evaluateAccessibility(e);

      // accessibility needs to be set before chosing the marker colour
      if (e.type == "Beach") e.iconPath = this.selectBeachIcon(e);
      if (e.type == "Garden") e.iconPath = this.selectGardenIcon(e);

      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");
      let currentIcon;
      if (e.iconPath == '') {
        currentIcon = iconDefault
      }
      else {
        currentIcon = L.icon({
          iconUrl: e.iconPath,
          //TODO:Should also differ
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        });
      }

      // const marker = L.marker([lat, lon], { icon: currentIcon, alt: e.type });
      const marker = L.marker([lat, lon], { icon: currentIcon, alt: e.id });

      this.markerClusters.addLayer(marker);
      // marker.addTo(map);
    });
  }

  selectBeachIcon(e: Entity) {
    //helper
    const value = e.accessibility
    if (value == ACCESSIBILITY.HIGH) {
      return icons.beachPinGreen
    }
    else if (value == ACCESSIBILITY.MEDIUM) {
      return icons.beachPinYellow
    }
    return icons.beachPinRed
  }

  selectGardenIcon(e: Entity) {
    //helper
    const value = e.accessibility
    if (value == ACCESSIBILITY.HIGH) {
      return icons.gardenPinGreen
    }
    else if (value == ACCESSIBILITY.MEDIUM) {
      return icons.gardenPinYellow
    }
    return icons.gardenPinRed
  }

  // helper
  private addMovingPointMarkers(
    arr: BeachEntity[] | GardenEntity[] | BikeHireDockingStationEntity[] | PublicTransportStopEntity[] | VehicleEntity[],
    map: any
  ) {
    arr.forEach(e => {
      const lat = e.location.value.coordinates[0];
      const lon = e.location.value.coordinates[1];
      console.log("placing marker on coordinates (", lat, ", ", lon, ")");

      const currentIcon = L.icon({
        iconUrl: icons.busPin,
        iconSize: [30, 50],
        iconAnchor: [15, 30],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });

      // const marker = L.marker([lat, lon], { icon: currentIcon, alt: e.type });
      const marker = L.marker([lat, lon], { icon: currentIcon, alt: e.id });
      this.vehicleMarkers.push(marker);
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

    this.addPointMarkers(this.beaches, map);
    this.addPointMarkers(this.gardens, map);
    this.addPointMarkers(this.bikeHireDockingStations, map);
    this.addPointMarkers(this.publicTransportStops, map);
    this.addMovingPointMarkers(this.vehicles, map);

    this.addLineMarkers(this.bikeLanes, map); // TODO

    map.addLayer(this.markerClusters);
    this.setupVehicleUpdates(map);

  }



  // helper
  private addLineMarkers(
    arr: BikeLaneEntity[],
    map: any
  ) {
    arr.forEach(e => {
      let pointsArr: L.LatLng[] = []
      e.location.value.coordinates.forEach(point => {
        pointsArr.push(L.latLng({lat: point[0], lng: point[1]} ))
      })
      //Draw Start Point
      const startPoint = L.circle(pointsArr[0],{fill: true, fillOpacity: 1,fillColor:bikeLaneColorFill, color: bikeLanePointColor,radius: bikeLanePointLength})
      //Draw End Point
      const endPoint = L.circle(pointsArr[pointsArr.length-1],{fill: true, fillOpacity: 1,fillColor:bikeLaneColorFill, color: bikeLanePointColor,radius: bikeLanePointLength})
      //Draw Line
      let laneColor;
      if(e.laneOccupancy.value > 5){
        laneColor = bikeLaneColorRed
      }
      else if(e.laneOccupancy.value > 2){
        laneColor = bikeLaneColorYellow
      }
      else laneColor = bikeLaneColorGreen

      const path = L.polyline(pointsArr, {color: laneColor, weight: bikeLaneStroke})
      path.addTo(map);
      startPoint.addTo(map);
      endPoint.addTo(map);

    })
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

    interval(1000)
      .subscribe(() => {
        this.entityService.getVehicleEntities().subscribe({
          next: (vehicles) => {
            // clean everything
            this.vehicles = [];

            this.vehicleMarkers.forEach((marker) => {
              marker.removeFrom(map);
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
