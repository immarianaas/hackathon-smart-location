import { Entity, Location } from "./entity";

export interface PublicTransportStopEntity extends Entity {
    location:Location,
    name: string,
    peopleCount: number,
    transportationType: number
}