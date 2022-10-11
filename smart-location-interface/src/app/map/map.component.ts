import { Component, OnInit } from '@angular/core';
import { EntityService } from '../entity.service';
import { BeachEntity } from '../beach-entity';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  beaches: BeachEntity[];

  constructor(
    private entityService : EntityService
  ) { 
    this.beaches = [];
  }

  ngOnInit(): void {
    this.entityService.getEntities().subscribe({
      next: (entities) => { 
        entities.forEach( e => this.beaches.push(e) );
        console.log("entities.length= ", entities.length)
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => console.log("done")
  });
  }

}
