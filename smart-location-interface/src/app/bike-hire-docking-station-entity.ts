import { Entity, Location } from "./entity";

export interface BikeHireDockingStationEntity extends Entity {
    availableBikeNumber: number,
    freeSlotNumber: number,
    totalSlotNumber: number,
    location: Location
}