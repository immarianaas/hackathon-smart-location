import { Entity, PointLocation } from "./entity";

export interface BikeHireDockingStationEntity extends Entity {
    availableBikeNumber: { value: number };
    freeSlotNumber: { value: number };
    totalSlotNumber: { value: number };
    location: PointLocation;
}