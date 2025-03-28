export interface Terms {
  valuationCap: number;
  discountRate: number;
  proRataRights: boolean;
  mfnProvision: boolean;
  boardObserver: boolean;
  investmentAmount: number;
}

export interface IndustryNorms {
  min: number;
  median: number;
  max: number;
}

export interface IndustryData {
  pre_seed: IndustryNorms;
  seed: IndustryNorms;
  seriesA: IndustryNorms;
}

export interface IndustryNormsData {
  valuationCap: {
    software: IndustryData;
    hardware: IndustryData;
  };
  discountRate: {
    software: IndustryData;
    hardware: IndustryData;
  };
}

export interface ExitScenario {
  exitValue: number;
  exitValueM: number;
  ownershipPercentage: string;
  investorValue: number;
  multiple: string;
}

export interface BellCurveData {
  value: number;
  frequency: number;
  isSelected: boolean;
}

export type CompanyStage = 'pre_seed' | 'seed' | 'seriesA';
export type Industry = 'software' | 'hardware'; 