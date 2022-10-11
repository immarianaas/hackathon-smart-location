import { Entity, Location } from "./entity";

export interface BeachEntity extends Entity {
    name: {
        value: string;
    }
    location: Location;
    occupationRate: {
        value: string;
    }
    beachType: [{
      value: string;  
    }]
}