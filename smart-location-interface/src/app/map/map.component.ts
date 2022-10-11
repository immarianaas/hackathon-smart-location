import { Component, OnInit } from '@angular/core';
import { EntityService } from '../entity.service';
import { BeachEntity } from '../beach-entity';
import { EntityType } from '../entity';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  /*
   * NOTA: eu meti a logica de ir buscar dados aqui
   * mas foi só como exemplo, temos de discutir como
   * vamos organizar os componentes e definir qual fica 
   * com essa responsabilidade
   */

  beaches: BeachEntity[];

  constructor(
    private entityService : EntityService
  ) { 
    this.beaches = [];
  }

  ngOnInit(): void {
    this.getAllEntities();
  }

  private getAllEntities(): void {
    // aqui vamos conseguir mapear qualquer tipo que "vier" para
    // o array com o tipo correto
    this.entityService.getAllEntities().subscribe({
      next: (entities) => { 
        entities.forEach( e => {
          // verify 'entities' type
          switch( e.type )
          {
            case "Beach": // TODO change to enum or smth
              this.beaches.push( <BeachEntity> e );
              break;
          }
          
        });
        
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => console.log("done")
  });
  }

}
