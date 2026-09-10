import { postJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  CBSScore,
  IGOInput,
  IGOScore,
  CalculationRepository,
} from '../domain/calculation';

class CalculationServiceImpl implements CalculationRepository {
  async calculateCBS(materialId: string, region: string): Promise<CBSScore> {
    return postJson<CBSScore>(API_ENDPOINTS.calculateCBS, {
      material_id: materialId,
      region,
    });
  }

  async calculateIGO(input: IGOInput): Promise<IGOScore> {
    return postJson<IGOScore>(API_ENDPOINTS.calculateIGO, input);
  }
}

export const calculationService = new CalculationServiceImpl();
