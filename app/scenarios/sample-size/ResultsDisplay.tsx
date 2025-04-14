import React from 'react';

export interface StageResult {
  informationRates: number;
  cumulativeEventsPerStage: number;
  analysisTime: number;
  cumulativeAlphaSpent: number;
  cumulativePower?: number;
  criticalValuesEffectScale: number;
  maxNumberOfSubjects?: number;
}

export interface CalculationResult {
  stages: {
    [key: string]: StageResult;
  };
}

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: CalculationResult | null;
  maxSubjects: string;
  orderedStageKeys: string[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  loading,
  error,
  results,
  maxSubjects,
  orderedStageKeys,
}) => {

  // Row definitions for the results table
  const resultTableRows = [
    { label: 'Info. Fraction', key: 'informationRates', digits: 3 },
    { label: 'Cum. Events', key: 'cumulativeEventsPerStage', digits: 0 },
    { label: 'Analysis Time (Mo)', key: 'analysisTime', digits: 1 },
    { label: 'Cum. Alpha Spent', key: 'cumulativeAlphaSpent', digits: 4 },
    { label: 'Cum. Power', key: 'cumulativePower', digits: 4, optional: true },
    { label: 'Critical Value (HR)', key: 'criticalValuesEffectScale', digits: 4 },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Results</h2>

      {loading && <p className="text-center text-gray-500 py-8">Loading results...</p>}

      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <pre className="text-sm whitespace-pre-wrap break-words">{error}</pre>
        </div>
      )}

      {results && !loading && !error && (
        <div className="overflow-x-auto">
          {/* Summary */}
          <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
            <p className="text-base font-medium text-blue-800">
              Maximum Required Sample Size: <span className="text-lg font-bold">{maxSubjects}</span>
            </p>
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">Metric</th>
                {orderedStageKeys.map(stageKey => (
                  <th key={stageKey} className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Stage {stageKey}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resultTableRows.map((row, rowIndex) => {
                 // Skip optional row if data isn't present in any stage
                if (row.optional && !orderedStageKeys.some(key => results.stages[key]?.[row.key as keyof StageResult] !== undefined)) {
                  return null;
                }
                return (
                  <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 z-10" style={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#F9FAFB' }}>{row.label}</td>
                    {orderedStageKeys.map(stageKey => (
                      <td key={stageKey} className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-center">
                        {(typeof results.stages[stageKey]?.[row.key as keyof StageResult] === 'number')
                          ? (results.stages[stageKey]?.[row.key as keyof StageResult] as number).toFixed(row.digits)
                          : (results.stages[stageKey]?.[row.key as keyof StageResult]?.toString() ?? 'N/A')
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-gray-500">
            Table shows key metrics per analysis stage. 'Max Sample Size' is the total subjects needed if the trial runs to completion.
          </p>
        </div>
      )}
      {/* Initial Placeholder */}
      {!loading && !error && !results && (
        <p className="text-center text-gray-500 py-8">Enter parameters and click calculate to see results.</p>
      )}
    </div>
  );
};

export default ResultsDisplay;