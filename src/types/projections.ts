export interface FundingRound {
  name: string;
  type: 'safe' | 'equity';
  amount: number;
  valuation: number;
  date: string;
  newShares?: number;
  pricePerShare?: number;
}

export interface Stakeholder {
  name: string;
  role: 'founder' | 'investor' | 'employee';
  initialShares: number;
  ownership: number;
}

export interface DilutionScenario {
  round: FundingRound;
  stakeholders: Stakeholder[];
  totalShares: number;
  postMoneyValuation: number;
}

export interface ExitOutcome {
  exitValue: number;
  timing: string;
  probability: number;
  stakeholderReturns: {
    [key: string]: {
      shares: number;
      ownership: number;
      value: number;
      multiple: number;
    };
  };
}

export interface ProjectionScenario {
  name: string;
  description: string;
  fundingRounds: FundingRound[];
  dilutionScenarios: DilutionScenario[];
  exitOutcomes: ExitOutcome[];
  probabilityWeighted: {
    expectedValue: number;
    founderOwnership: number;
    investorMultiple: number;
  };
}

export interface FinancialModel {
  scenarios: ProjectionScenario[];
  assumptions: {
    sharePrice: number;
    initialShares: number;
    employeePoolSize: number;
    expectedGrowthRate: number;
    timingToExit: number;
  };
  currentScenario: string;
} 