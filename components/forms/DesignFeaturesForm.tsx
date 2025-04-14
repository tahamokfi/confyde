import React, { ChangeEvent } from 'react';
// Assuming interfaces are in App.tsx or a types file and are EXPORTED
import { FormData } from './page';

interface DesignFeaturesFormProps {
  // Use number[] for informationRates
  formData: Pick<
    FormData,
    'sided' | 'alpha' | 'beta' | 'kMax' | 'informationRates' | 'design'
  >;
  validationErrors: Record<string, string>;
  // Standard handler for most inputs
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // Special handler for kMax dropdown
  handleKMaxChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  // New handler specifically for individual information rate inputs
  handleInformationRateChange: (index: number, value: string) => void;
}

const DesignFeaturesForm: React.FC<DesignFeaturesFormProps> = ({
  formData,
  validationErrors,
  handleInputChange, // For sided, alpha, beta, design
  handleKMaxChange,  // For kMax dropdown
  handleInformationRateChange, // For the rate inputs
}) => {
  const kMax = Number(formData.kMax) || 0; // Ensure kMax is a number

  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Design Features</h2>

      {/* Alternative Hypothesis */}
      <div>
        <label htmlFor="sided" className="block text-sm font-medium text-gray-700">Alternative Hypothesis</label>
        <select id="sided" name="sided" value={formData.sided} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value={1}>One-sided</option>
          <option value={2}>Two-sided</option>
        </select>
      </div>

      {/* Type I Error (Alpha) */}
      <div>
        <label htmlFor="alpha" className="block text-sm font-medium text-gray-700">Type I Error (Alpha)</label>
        <select id="alpha" name="alpha" value={formData.alpha} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.alpha ? 'border-red-500' : 'border-gray-300'}`}>
          <option value={0.005}>0.5%</option>
          <option value={0.01}>1%</option>
          <option value={0.025}>2.5%</option>
          <option value={0.05}>5%</option>
          <option value={0.1}>10%</option>
        </select>
        {validationErrors.alpha && <p className="mt-1 text-xs text-red-600">{validationErrors.alpha}</p>}
      </div>

      {/* Type II Error (Beta) */}
      <div>
        <label htmlFor="beta" className="block text-sm font-medium text-gray-700">Type II Error (Beta)</label>
        <select id="beta" name="beta" value={formData.beta} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.beta ? 'border-red-500' : 'border-gray-300'}`}>
          <option value={0.05}>5% (Power: 95%)</option>
          <option value={0.1}>10% (Power: 90%)</option>
          <option value={0.15}>15% (Power: 85%)</option>
          <option value={0.2}>20% (Power: 80%)</option>
        </select>
        {validationErrors.beta && <p className="mt-1 text-xs text-red-600">{validationErrors.beta}</p>}
      </div>

      {/* Number of Stages */}
      <div>
        <label htmlFor="kMax" className="block text-sm font-medium text-gray-700">Number of Stages</label>
        <select id="kMax" name="kMax" value={formData.kMax} onChange={handleKMaxChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          {[2, 3, 4, 5].map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Information Rates - Individual Inputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Information Rates (per Stage)
        </label>
        <div className={`grid grid-cols-2 sm:grid-cols-${kMax > 3 ? '3' : kMax} gap-2`}> {/* Adjust grid cols */}
          {Array.from({ length: kMax }).map((_, index) => (
            <div key={index}>
              <label htmlFor={`infoRate-${index}`} className="sr-only"> {/* Screen reader only label */}
                Stage {index + 1} Information Rate
              </label>
              <input
                type="number"
                id={`infoRate-${index}`}
                name={`infoRate-${index}`} // Unique name/id
                value={
                  formData.informationRates[index] !== undefined && !isNaN(formData.informationRates[index])
                    ? formData.informationRates[index]
                    : '' // Display empty string for undefined or NaN for better control
                }
                onChange={(e) => handleInformationRateChange(index, e.target.value)}
                placeholder={`Stage ${index + 1}`}
                step="0.01" // Allow finer control
                min="0"
                max="1"
                // Disable last input and set to 1? Optional UI choice.
                // disabled={index === kMax - 1}
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  // Apply error styling if general informationRates error exists
                  validationErrors.informationRates ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                aria-describedby="informationRates-error-message" // Link to potential error message
              />
            </div>
          ))}
        </div>
        {/* Display single error message for the group */}
        {validationErrors.informationRates && (
          <p id="informationRates-error-message" className="mt-1 text-xs text-red-600">
            {validationErrors.informationRates}
          </p>
        )}
         <p className="mt-1 text-xs text-gray-500">
            Rates must be between 0 and 1, increasing, and the last stage must be 1.0.
        </p>
      </div>


      {/* Design Type */}
      <div>
        <label htmlFor="design" className="block text-sm font-medium text-gray-700">Design Type</label>
        <select id="design" name="design" value={formData.design} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="asOF">O'Brien & Fleming Alpha Spending</option>
          <option value="OF">O'Brien & Fleming</option>
          <option value="P">Pocock</option>
          <option value="asP">Pocock Alpha Spending</option>
          {/* Add other designs as needed */}
        </select>
      </div>
    </div>
  );
};

export default DesignFeaturesForm;

