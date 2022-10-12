import { Entity, PointLocation } from "./entity";

export interface BeachEntity extends Entity {
    name: { value: string; };
    location: PointLocation;
    occupationRate: { value: string; };
    beachType: [{
        value: string;
    }];
}