import { getJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  Catalog,
  Material,
  MaterialRepository,
} from '../domain/material';

class MaterialServiceImpl implements MaterialRepository {
  async getCatalog(): Promise<Catalog> {
    return getJson<Catalog>(API_ENDPOINTS.materials);
  }

  async recommendMaterials(
    region: string,
    climate: string,
    maxPrice?: number,
  ): Promise<Material[]> {
    const res = await getJson<{ materials: Material[] }>(
      API_ENDPOINTS.materialsRecommend,
      { region, climate, max_price: maxPrice },
    );
    return res.materials;
  }
}

export const materialService = new MaterialServiceImpl();
