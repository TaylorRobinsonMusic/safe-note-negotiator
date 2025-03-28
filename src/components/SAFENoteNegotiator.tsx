'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Terms, IndustryNormsData, ExitScenario, BellCurveData, CompanyStage, Industry } from '../types/safe';
import PDFUploader from './PDFUploader';

const SAFENoteNegotiator: React.FC = () => {
  // State for negotiable terms
  const [terms, setTerms] = useState<Terms>({
    valuationCap: 5000000,
    discountRate: 20,
    proRataRights: true,
    mfnProvision: true,
    boardObserver: false,
    investmentAmount: 250000
  });

  // State for displaying industry norms
  const [showNorms, setShowNorms] = useState<boolean>(true);
  const [companyStage, setCompanyStage] = useState<CompanyStage>('seed');
  const [industry, setIndustry] = useState<Industry>('software');

  // Add state for PDF uploader
  const [showPDFUploader, setShowPDFUploader] = useState(false);

  // Simulated industry norm data
  const industryNorms: IndustryNormsData = {
    valuationCap: {
      software: {
        pre_seed: { min: 2000000, median: 3500000, max: 5000000 },
        seed: { min: 4000000, median: 6000000, max: 10000000 },
        seriesA: { min: 8000000, median: 15000000, max: 25000000 }
      },
      hardware: {
        pre_seed: { min: 1500000, median: 3000000, max: 4500000 },
        seed: { min: 3500000, median: 5500000, max: 9000000 },
        seriesA: { min: 7000000, median: 12000000, max: 20000000 }
      }
    },
    discountRate: {
      software: {
        pre_seed: { min: 15, median: 20, max: 25 },
        seed: { min: 10, median: 20, max: 25 },
        seriesA: { min: 5, median: 15, max: 20 }
      },
      hardware: {
        pre_seed: { min: 15, median: 20, max: 30 },
        seed: { min: 10, median: 20, max: 25 },
        seriesA: { min: 5, median: 15, max: 20 }
      }
    }
  };

  // Get current norms based on selected industry and stage
  const currentNorms = {
    valuationCap: industryNorms.valuationCap[industry][companyStage],
    discountRate: industryNorms.discountRate[industry][companyStage]
  };

  // Generate bell curve data for visualization
  const generateBellCurveData = (min: number, median: number, max: number, currentValue: number): BellCurveData[] => {
    const range = max - min;
    const step = range / 40; // Increased number of points for smoother curve
    const result: BellCurveData[] = [];
    
    // Generate points for the full curve
    for (let i = min; i <= max; i += step) {
      const distance = Math.abs(i - median);
      const standardDeviation = range / 4;
      const height = Math.exp(-(distance * distance) / (2 * standardDeviation * standardDeviation));
      
      result.push({
        value: i,
        frequency: height,
        isSelected: Math.abs(i - currentValue) < step / 2
      });
    }
    
    // Add the selected point with the same height as the curve at that point
    const selectedPointHeight = Math.exp(
      -(Math.pow(Math.abs(currentValue - median), 2)) / 
      (2 * Math.pow(range / 4, 2))
    );
    
    // Find and update the point closest to the current value
    const selectedIndex = result.findIndex(point => point.isSelected);
    if (selectedIndex !== -1) {
      result[selectedIndex] = {
        value: currentValue,
        frequency: selectedPointHeight,
        isSelected: true
      };
    }
    
    return result;
  };

  // Calculate exit scenarios
  const calculateExitScenarios = (): ExitScenario[] => {
    const { valuationCap, discountRate, investmentAmount } = terms;
    const scenarios: ExitScenario[] = [];
    
    for (let exitValue = 10000000; exitValue <= 100000000; exitValue += 10000000) {
      const capOwnership = (investmentAmount / valuationCap) * 100;
      const discountedPrice = exitValue * (1 - (discountRate / 100));
      const discountOwnership = (investmentAmount / discountedPrice) * 100;
      const ownershipPercentage = Math.max(capOwnership, discountOwnership);
      const investorValue = (ownershipPercentage / 100) * exitValue;
      const multiple = investorValue / investmentAmount;
      
      scenarios.push({
        exitValue,
        exitValueM: exitValue / 1000000,
        ownershipPercentage: ownershipPercentage.toFixed(2),
        investorValue,
        multiple: multiple.toFixed(1)
      });
    }
    
    return scenarios;
  };

  const exitScenarios = calculateExitScenarios();
  const valuationCurveData = generateBellCurveData(
    currentNorms.valuationCap.min,
    currentNorms.valuationCap.median,
    currentNorms.valuationCap.max,
    terms.valuationCap
  );
  const discountCurveData = generateBellCurveData(
    currentNorms.discountRate.min,
    currentNorms.discountRate.median,
    currentNorms.discountRate.max,
    terms.discountRate
  );

  // Handle term changes
  const handleTermChange = (term: keyof Terms, value: number | boolean): void => {
    setTerms(prevTerms => ({ ...prevTerms, [term]: value }));
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Get percentile position
  const getPercentile = (value: number, min: number, median: number, max: number): number => {
    if (value <= median) {
      return Math.round(((value - min) / (median - min)) * 50);
    } else {
      return Math.round(50 + ((value - median) / (max - median)) * 50);
    }
  };

  const valuationPercentile = getPercentile(
    terms.valuationCap,
    currentNorms.valuationCap.min,
    currentNorms.valuationCap.median,
    currentNorms.valuationCap.max
  );

  const discountPercentile = getPercentile(
    terms.discountRate,
    currentNorms.discountRate.min,
    currentNorms.discountRate.median,
    currentNorms.discountRate.max
  );

  // Handle extracted terms from PDF
  const handleTermsExtracted = (extractedTerms: Partial<Terms>) => {
    setTerms(prevTerms => ({
      ...prevTerms,
      ...extractedTerms
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Show PDF uploader modal when active */}
      {showPDFUploader && (
        <PDFUploader
          onTermsExtracted={handleTermsExtracted}
          onClose={() => setShowPDFUploader(false)}
        />
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SAFE Note Negotiator</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPDFUploader(true)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Upload SAFE Note
            </button>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Save Draft
            </button>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              Send to Investor
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Company & Market Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Company Context</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Stage
                  </label>
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm"
                    value={companyStage}
                    onChange={(e) => setCompanyStage(e.target.value as CompanyStage)}
                  >
                    <option value="pre_seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="seriesA">Series A</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                  >
                    <option value="software">Software / SaaS</option>
                    <option value="hardware">Hardware / IoT</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      value={terms.investmentAmount}
                      onChange={(e) => handleTermChange('investmentAmount', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <input
                  id="show-norms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={showNorms}
                  onChange={() => setShowNorms(!showNorms)}
                />
                <label htmlFor="show-norms" className="ml-2 block text-sm text-gray-900">
                  Show industry norms
                </label>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Market Intelligence</h2>
              
              {showNorms && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Valuation Cap</h3>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={valuationCurveData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="colorFrequency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.2}/>
                          </linearGradient>
                          <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        {/* Base curve */}
                        <Area
                          type="monotone"
                          dataKey="frequency"
                          stroke="#60A5FA"
                          fill="url(#colorFrequency)"
                          fillOpacity={1}
                        />
                        {/* Selected point highlight */}
                        {valuationCurveData.map((entry, index) => (
                          entry.isSelected && (
                            <Area
                              key={`selected-${index}`}
                              type="monotone"
                              dataKey="frequency"
                              data={[entry]}
                              stroke="#2563EB"
                              fill="url(#colorSelected)"
                              fillOpacity={1}
                            />
                          )
                        ))}
                        <XAxis
                          dataKey="value"
                          tickFormatter={(value) => formatCurrency(value)}
                          ticks={[
                            currentNorms.valuationCap.min,
                            currentNorms.valuationCap.median,
                            currentNorms.valuationCap.max
                          ]}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Favorable to Founder</span>
                      <span>Favorable to Investor</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Your valuation is </span>
                      <span className={`font-bold ${
                        valuationPercentile < 40 ? 'text-red-600' : 
                        valuationPercentile > 60 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {valuationPercentile < 40 ? 'below average' : 
                         valuationPercentile > 60 ? 'above average' : 'average'}
                      </span>
                      <span className="font-medium"> for {companyStage.replace('_', '-')} stage {industry} companies</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Discount Rate</h3>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={discountCurveData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="colorFrequency2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.2}/>
                          </linearGradient>
                          <linearGradient id="colorSelected2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        {/* Base curve */}
                        <Area
                          type="monotone"
                          dataKey="frequency"
                          stroke="#60A5FA"
                          fill="url(#colorFrequency2)"
                          fillOpacity={1}
                        />
                        {/* Selected point highlight */}
                        {discountCurveData.map((entry, index) => (
                          entry.isSelected && (
                            <Area
                              key={`selected-${index}`}
                              type="monotone"
                              dataKey="frequency"
                              data={[entry]}
                              stroke="#2563EB"
                              fill="url(#colorSelected2)"
                              fillOpacity={1}
                            />
                          )
                        ))}
                        <XAxis
                          dataKey="value"
                          tickFormatter={(value) => `${value}%`}
                          ticks={[
                            currentNorms.discountRate.min,
                            currentNorms.discountRate.median,
                            currentNorms.discountRate.max
                          ]}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Favorable to Founder</span>
                      <span>Favorable to Investor</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Your discount is </span>
                      <span className={`font-bold ${
                        discountPercentile < 40 ? 'text-green-600' : 
                        discountPercentile > 60 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {discountPercentile < 40 ? 'below average' : 
                         discountPercentile > 60 ? 'above average' : 'average'}
                      </span>
                      <span className="font-medium"> for {companyStage.replace('_', '-')} stage {industry} companies</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!showNorms && (
                <p className="text-gray-500 text-sm">Enable "Show industry norms" to see how your terms compare to similar companies.</p>
              )}
            </div>
          </div>

          {/* Center column: Negotiable Terms */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Negotiable Terms</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Valuation Cap
                    </label>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(terms.valuationCap)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2000000}
                    max={20000000}
                    step={500000}
                    value={terms.valuationCap}
                    onChange={(e) => handleTermChange('valuationCap', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(2000000)}</span>
                    <span>{formatCurrency(20000000)}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <p><strong>What it means:</strong> Maximum company valuation for conversion purposes. Higher cap is better for founders; lower cap is better for investors.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Discount Rate
                    </label>
                    <span className="text-sm text-gray-500">
                      {terms.discountRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={terms.discountRate}
                    onChange={(e) => handleTermChange('discountRate', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>30%</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <p><strong>What it means:</strong> Discount applied to the price per share in equity financing. Higher discount benefits investors; lower discount benefits founders.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="pro-rata"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={terms.proRataRights}
                        onChange={(e) => handleTermChange('proRataRights', e.target.checked)}
                      />
                      <label htmlFor="pro-rata" className="ml-2 block text-sm text-gray-900">
                        Pro Rata Rights
                      </label>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      terms.proRataRights ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {terms.proRataRights ? 'Standard' : 'Founder-friendly'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <p><strong>What it means:</strong> Gives investor the right to participate in future financing rounds to maintain their ownership percentage.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="mfn"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={terms.mfnProvision}
                        onChange={(e) => handleTermChange('mfnProvision', e.target.checked)}
                      />
                      <label htmlFor="mfn" className="ml-2 block text-sm text-gray-900">
                        Most Favored Nation Provision
                      </label>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      terms.mfnProvision ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {terms.mfnProvision ? 'Standard' : 'Founder-friendly'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <p><strong>What it means:</strong> If you issue SAFEs with better terms later, this investor gets those terms too.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="board"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={terms.boardObserver}
                        onChange={(e) => handleTermChange('boardObserver', e.target.checked)}
                      />
                      <label htmlFor="board" className="ml-2 block text-sm text-gray-900">
                        Board Observer Rights
                      </label>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      terms.boardObserver ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {terms.boardObserver ? 'Investor-friendly' : 'Standard'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                      <p><strong>What it means:</strong> Allows investor to attend and participate in board meetings without voting rights.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Financial Projections */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Outcome Scenarios</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Return Multiple by Exit Valuation</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={exitScenarios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="exitValueM" 
                        label={{ value: 'Exit Valuation ($M)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis label={{ value: 'Return Multiple', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Return Multiple']}
                        labelFormatter={(value) => `Exit at $${value}M`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="multiple" 
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ownership % by Exit Valuation</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={exitScenarios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="exitValueM" 
                        label={{ value: 'Exit Valuation ($M)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis label={{ value: 'Ownership %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, 'Ownership']}
                        labelFormatter={(value) => `Exit at $${value}M`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ownershipPercentage" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Exit Scenarios</h3>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exit
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ownership
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Multiple
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {exitScenarios.filter((_, index) => index % 3 === 0).map((scenario, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {formatCurrency(scenario.exitValue)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {scenario.ownershipPercentage}%
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {formatCurrency(scenario.investorValue)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {scenario.multiple}x
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs">
                  <p className="font-bold">How to use these projections:</p>
                  <p className="mt-1">These scenarios show potential outcomes at different exit valuations. The investor's ownership percentage is calculated using the more favorable of the valuation cap or discount rate.</p>
                  <p className="mt-1">This tool helps you understand the financial implications of your negotiated terms without needing an accountant.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAFENoteNegotiator; 