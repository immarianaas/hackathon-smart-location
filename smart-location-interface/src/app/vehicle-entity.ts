import { Entity, Location } from "./entity";

export interface VehicleEntity extends Entity {
    category: string,
    location: Location,
    vehicleType: string
}