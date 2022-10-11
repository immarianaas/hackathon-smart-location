export interface Entity {
    id: string;
    type: string;
}

export enum EntityType {
    BEACH,
}

export interface Location {
    value: {
        coordinates: number[];
    }
}