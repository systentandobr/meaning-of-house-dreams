import { getJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { Location, LocationRepository } from '../domain/location';

class LocationServiceImpl implements LocationRepository {
  async resolveByCoordinates(lat: number, lon: number): Promise<Location> {
    return getJson<Location>(API_ENDPOINTS.location, { lat, lon });
  }
}

export const locationService = new LocationServiceImpl();
