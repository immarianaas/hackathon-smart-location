import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EntityService } from '../entity.service';
import { BeachEntity } from '../beach-entity';
import { EntityType } from '../entity';
import * as L from 'leaflet';

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


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  /*
   * NOTA: eu meti a logica de ir buscar dados aqui
   * mas foi só como exemplo, temos de discutir como
   * vamos organizar os componentes e definir qual fica 
   * com essa responsabilidade
   */

  beaches: BeachEntity[];

  constructor(
    private entityService: EntityService
  ) {
    this.beaches = [];
  }

  ngOnInit(): void {
    this.initMap();
    this.getAllEntities();
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

  }

  ngAfterViewInit(): void {
  }

  private getAllEntities(): void {
    // aqui vamos conseguir mapear qualquer tipo que "vier" para
    // o array com o tipo correto
    this.entityService.getAllEntities().subscribe({
      next: (entities) => {
        entities.forEach(e => {
          // verify 'entities' type
          switch (e.type) {
            case "Beach": // TODO change to enum or smth
              this.beaches.push(<BeachEntity>e);
              break;
          }

        });


        this.addBeachMarkers();


      },
      error: (e) => {
        console.log(e);
      },
      complete: () => console.log("done")
    });
  }

  private addBeachMarkers(): void {
    this.beaches.forEach(b => {
      const lat = b.location.value.coordinates[0];
      const lon = b.location.value.coordinates[1];
      console.log("coordinates (", lat, ", ", lon, ")");
      const marker = L.marker([lat, lon]);
      marker.addTo(this.map);
    })

  }

}
