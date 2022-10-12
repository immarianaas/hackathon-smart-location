import { Entity, PointLocation } from "./entity";

export interface PublicTransportStopEntity extends Entity {
    location: PointLocation;
    name: { value: string };
    peopleCount: {value: number };
    transportationType: { value: number };
}