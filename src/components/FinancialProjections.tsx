'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Sankey, Scatter
} from 'recharts';
import { FinancialModel, ProjectionScenario, FundingRound, Stakeholder } from '../types/projections';

interface Props {
  terms: {
    valuationCap: number;
    discountRate: number;
    investmentAmount: number;
  };
  onScenarioChange: (scenario: ProjectionScenario) => void;
}

const FinancialProjections: React.FC<Props> = ({ terms, onScenarioChange }) => {
  // Initial state setup
  const [model, setModel] = useState<FinancialModel>({
    scenarios: [],
    assumptions: {
      sharePrice: 1,
      initialShares: 10000000, // 10M shares
      employeePoolSize: 0.1, // 10% employee pool
      expectedGrowthRate: 0.5, // 50% year-over-year growth
      timingToExit: 5 // 5 years to exit
    },
    currentScenario: 'base'
  });

  // Calculate dilution across funding rounds
  const calculateDilution = (rounds: FundingRound[], initialStakeholders: Stakeholder[]) => {
    let currentShares = model.assumptions.initialShares;
    let currentStakeholders = [...initialStakeholders];
    
    return rounds.map(round => {
      const newShares = round.type === 'equity' 
        ? (round.amount / round.valuation) * currentShares
        : (terms.investmentAmount / Math.min(terms.valuationCap, round.valuation * (1 - terms.discountRate/100))) * currentShares;
      
      currentShares += newShares;
      
      // Update stakeholder ownership
      currentStakeholders = currentStakeholders.map(stakeholder => ({
        ...stakeholder,
        ownership: (stakeholder.initialShares / currentShares) * 100
      }));

      return {
        round,
        stakeholders: currentStakeholders,
        totalShares: currentShares,
        postMoneyValuation: round.valuation
      };
    });
  };

  // Generate exit scenarios
  const generateExitScenarios = (rounds: FundingRound[]) => {
    const baseValue = rounds[rounds.length - 1]?.valuation || terms.valuationCap;
    const scenarios = [0.5, 1, 2, 3, 5].map(multiple => {
      const exitValue = baseValue * multiple;
      const probability = multiple <= 1 ? 0.4 : multiple <= 3 ? 0.4 : 0.2;
      
      return {
        exitValue,
        timing: `Year ${Math.round(model.assumptions.timingToExit * (multiple < 1 ? 0.7 : multiple > 3 ? 1.3 : 1))}`,
        probability,
        stakeholderReturns: calculateStakeholderReturns(exitValue, rounds)
      };
    });

    return scenarios;
  };

  // Calculate returns for each stakeholder at exit
  const calculateStakeholderReturns = (exitValue: number, rounds: FundingRound[]) => {
    const lastDilution = calculateDilution(rounds, [
      { name: 'Founders', role: 'founder', initialShares: model.assumptions.initialShares * 0.8, ownership: 80 },
      { name: 'Employee Pool', role: 'employee', initialShares: model.assumptions.initialShares * 0.1, ownership: 10 }
    ]).pop();

    if (!lastDilution) return {};

    return lastDilution.stakeholders.reduce((acc, stakeholder) => {
      acc[stakeholder.name] = {
        shares: stakeholder.initialShares,
        ownership: stakeholder.ownership,
        value: (stakeholder.ownership / 100) * exitValue,
        multiple: stakeholder.role === 'investor' 
          ? ((stakeholder.ownership / 100) * exitValue) / terms.investmentAmount 
          : 0
      };
      return acc;
    }, {} as Record<string, any>);
  };

  // Generate new scenario
  const generateScenario = (name: string, growthMultiple: number = 1): ProjectionScenario => {
    const fundingRounds: FundingRound[] = [
      {
        name: 'SAFE Round',
        type: 'safe',
        amount: terms.investmentAmount,
        valuation: terms.valuationCap,
        date: new Date().toISOString()
      },
      {
        name: 'Series A',
        type: 'equity',
        amount: terms.investmentAmount * 4,
        valuation: terms.valuationCap * 2 * growthMultiple,
        date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Series B',
        type: 'equity',
        amount: terms.investmentAmount * 8,
        valuation: terms.valuationCap * 4 * growthMultiple,
        date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const dilutionScenarios = calculateDilution(fundingRounds, [
      { name: 'Founders', role: 'founder', initialShares: model.assumptions.initialShares * 0.8, ownership: 80 },
      { name: 'Employee Pool', role: 'employee', initialShares: model.assumptions.initialShares * 0.1, ownership: 10 }
    ]);

    const exitOutcomes = generateExitScenarios(fundingRounds);

    const probabilityWeighted = {
      expectedValue: exitOutcomes.reduce((sum, outcome) => sum + outcome.exitValue * outcome.probability, 0),
      founderOwnership: dilutionScenarios[dilutionScenarios.length - 1].stakeholders
        .find(s => s.role === 'founder')?.ownership || 0,
      investorMultiple: exitOutcomes.reduce((sum, outcome) => {
        const investorReturn = Object.values(outcome.stakeholderReturns)
          .find(r => r.multiple > 0)?.multiple || 0;
        return sum + investorReturn * outcome.probability;
      }, 0)
    };

    return {
      name,
      description: `${name} case scenario with ${growthMultiple}x growth multiple`,
      fundingRounds,
      dilutionScenarios,
      exitOutcomes,
      probabilityWeighted
    };
  };

  // Generate all scenarios when terms change
  useMemo(() => {
    const scenarios = [
      generateScenario('Conservative', 0.7),
      generateScenario('Base', 1),
      generateScenario('Optimistic', 1.5)
    ];
    setModel(prev => ({ ...prev, scenarios }));
  }, [terms.valuationCap, terms.discountRate, terms.investmentAmount]);

  const currentScenario = model.scenarios.find(s => s.name === model.currentScenario) || model.scenarios[0];

  return (
    <div className="space-y-8">
      {/* Scenario Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Scenario Analysis</h3>
        <div className="flex space-x-4">
          {model.scenarios.map(scenario => (
            <button
              key={scenario.name}
              onClick={() => {
                setModel(prev => ({ ...prev, currentScenario: scenario.name }));
                onScenarioChange(scenario);
              }}
              className={`px-4 py-2 rounded-md ${
                model.currentScenario === scenario.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dilution Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Ownership Dilution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={currentScenario?.dilutionScenarios.map(ds => ({
              round: ds.round.name,
              ...ds.stakeholders.reduce((acc, s) => ({ ...acc, [s.name]: s.ownership }), {})
            }))}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" />
            <YAxis tickFormatter={value => `${Math.round(value * 100)}%`} />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return `${(value * 100).toFixed(1)}%`;
                }
                const num = Number(value);
                if (!isNaN(num)) {
                  return `${(num * 100).toFixed(1)}%`;
                }
                return '0%';
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Founders"
              stackId="1"
              stroke="#4F46E5"
              fill="#818CF8"
            />
            <Area
              type="monotone"
              dataKey="Employee Pool"
              stackId="1"
              stroke="#059669"
              fill="#34D399"
            />
            <Area
              type="monotone"
              dataKey="Investors"
              stackId="1"
              stroke="#DC2626"
              fill="#F87171"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Exit Scenarios */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Exit Scenarios</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Return Multiple Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentScenario?.exitOutcomes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timing" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'multiple'
                      ? `${Number(value).toFixed(1)}x`
                      : `$${(Number(value) / 1000000).toFixed(1)}M`,
                    name === 'multiple' ? 'Return Multiple' : 'Exit Value'
                  ]}
                />
                <Bar
                  dataKey="exitValue"
                  fill="#818CF8"
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Probability-Weighted Returns</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Expected Exit Value</p>
                <p className="text-lg font-semibold">
                  ${(currentScenario?.probabilityWeighted.expectedValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Expected Investor Multiple</p>
                <p className="text-lg font-semibold">
                  {currentScenario?.probabilityWeighted.investorMultiple.toFixed(1)}x
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Final Founder Ownership</p>
                <p className="text-lg font-semibold">
                  {currentScenario?.probabilityWeighted.founderOwnership.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProjections; 