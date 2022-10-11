import { Entity, Location } from "./entity";

export interface GardenEntity extends Entity {
    location: Location,
    name: string
}