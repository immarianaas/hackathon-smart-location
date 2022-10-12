export interface Entity {
    id: string;
    type: string;
    location: PointLocation | MultiPointLocation;
    iconPath: string;

    accessibility?: ACCESSIBILITY;
}

export enum EntityType {
    BEACH,
    VEHICLE,
    PUBLIC_TRANSPORT_STOP,
    GARDEN,
    BIKE_LANE,
    BIKE_HIRE_DOCKING_STATION
}

export enum ACCESSIBILITY {
    LOW,
    MEDIUM,
    HIGH
}

export interface PointLocation {
    value: {
        coordinates: number[];
    }
}

export interface MultiPointLocation {
    value: {
        coordinates: number[][];
    }
}