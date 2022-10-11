import { Entity, Location } from "./entity";

export interface BikeLaneEntity extends Entity {
    laneOccupancy: number,
    location:Location
}