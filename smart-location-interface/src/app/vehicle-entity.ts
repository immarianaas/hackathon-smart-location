import { Entity, PointLocation } from "./entity";

export interface VehicleEntity extends Entity {
    category: { value: string };
    location: PointLocation;
    vehicleType: { value: string };
}