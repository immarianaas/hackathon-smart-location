export interface Entity {
    id: string;
    type: string;
}

export enum EntityType {
    BEACH,VEHICLE,PUBLIC_TRANSPORT_STOP,GARDEN,BIKE_LANE,BIKE_HIRE_DOCKING_STATION
}

export interface Location {
    value: {
        coordinates: number[];
    }
}