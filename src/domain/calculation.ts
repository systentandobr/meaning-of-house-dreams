// Calculation domain: pure types and repository contract for CBS/IGO.

export interface CBSScore {
  material_id: string;
  score: number;
  educational_only: boolean;
}

export interface IGOInput {
  location: number;
  cost: number;
  time: number;
  sustainability: number;
  quality: number;
}

export interface IGOScore {
  score: number;
  educational_only: boolean;
}

export interface CalculationRepository {
  calculateCBS(materialId: string, region: string): Promise<CBSScore>;
  calculateIGO(input: IGOInput): Promise<IGOScore>;
}
