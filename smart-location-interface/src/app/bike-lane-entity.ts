import { Entity, MultiPointLocation } from "./entity";

export interface BikeLaneEntity extends Entity {
    laneOccupancy: { value: number };
    location: MultiPointLocation;
}