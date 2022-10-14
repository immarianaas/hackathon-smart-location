import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EntityService } from '../entity.service';
import { BeachEntity } from '../beach-entity';
import { GardenEntity } from '../garden-entity';
import { VehicleEntity } from '../vehicle-entity';
import { PublicTransportStopEntity } from '../public-transport-stop-entity';
import { BikeLaneEntity } from '../bike-lane-entity';
import { BikeHireDockingStationEntity } from '../bike-hire-docking-station-entity';
import { EntityType } from '../entity';
import * as L from 'leaflet';
import { MarkerService } from '../marker.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  showLegend: boolean = false;

  constructor(
    private entityService: EntityService,
    private markerService: MarkerService
  ) {
  }

  ngOnInit(): void {
    this.initMap();
  }

  private map: any;

  private initMap(): void {
    this.map = L.map('map', {
      center: [40.641320, -8.653570],
      zoom: 14
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    this.markerService.addAllMarkers( this.map );

  }

  ngAfterViewInit(): void {
  }


}
