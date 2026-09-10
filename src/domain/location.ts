// Location domain: pure types and repository contract.

export interface Location {
  city: string;
  state: string;
  state_code: string;
  region: string;
  bioclimatic_zone: string;
  climate: string;
  latitude: number;
  longitude: number;
  source: string;
  disclaimer: string;
}

export interface LocationRepository {
  resolveByCoordinates(lat: number, lon: number): Promise<Location>;
}
