export interface BeachEntity {
    id: string;
    type: string;
    name: {
        value: string;
    }
    location: Location;
    occupationRate: {
        value: string;
    }
    beachType: [{
      value: string;  
    }]
}