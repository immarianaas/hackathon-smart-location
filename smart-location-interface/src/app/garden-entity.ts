import { Entity, PointLocation } from "./entity";

export interface GardenEntity extends Entity {
    location: PointLocation;
    name: { value: string };
}