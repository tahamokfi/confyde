'use client';

import React, { useState, ChangeEvent, FormEvent, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { useSearchParams } from 'next/navigation';

// Import the components
import DesignFeaturesForm from '@/components/forms/DesignFeaturesForm';
import AssumptionsForm from '@/components/forms/AssumptionsForm';
import ResultsDisplay from './ResultsDisplay';
import type { CalculationResult } from './ResultsDisplay';

const secret = process.env.NEXT_PUBLIC_ACCESS_SECRET;

// --- Interfaces ---
export interface FormData {
  sided: number;
  alpha: number;
  beta: number;
  kMax: number;
  // **** CHANGE: informationRates is now number[] ****
  informationRates: number[];
  design: string;
  measure: number;
  value1: number;
  value2: number;
  dropoutRate1: number;
  dropoutRate2: number;
  accrualTime: string; // Keep string for input flexibility
  accrualIntensity: string; // Keep string for input flexibility
}


// --- Default generation function ---
const getDefaultInformationRates = (kMax: number): number[] => {
    return Array.from({ length: kMax }, (_, i) =>
      i === kMax - 1 ? 1.0 : Math.round(((i + 1) / kMax) * 100) / 100 // Default to evenly spaced, rounded
    );
};


// --- Initial State ---
const initialKMax = 3;
const initialFormData: FormData = {
  sided: 1,
  alpha: 0.025,
  beta: 0.1,
  kMax: initialKMax,
  // **** CHANGE: Initialize with default rates array ****
  informationRates: getDefaultInformationRates(initialKMax),
  design: "asOF",
  measure: 1,
  value1: 10.5,
  value2: 8.0,
  dropoutRate1: 10.0,
  dropoutRate2: 10.0,
  accrualTime: "0, 18, 30",
  accrualIntensity: "15, 40",
};

function SampleSizePage() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // --- Input Handling (Standard fields) ---
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Exclude informationRates as it has a special handler
    if (name.startsWith('infoRate-')) return;

    const isNumericField = ['sided', 'alpha', 'beta', 'kMax', 'measure', 'value1', 'value2', 'dropoutRate1', 'dropoutRate2'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || (isNumericField && value !== '') ? parseFloat(value) : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validationErrors]);

  // --- ** NEW: Handler for individual information rate inputs ** ---
  const handleInformationRateChange = useCallback((index: number, value: string) => {
    const newRate = parseFloat(value); // Allow NaN temporarily, validation will catch it

    setFormData(prev => {
        const newRates = [...prev.informationRates]; // Create a copy
        newRates[index] = newRate; // Update the specific rate
        return { ...prev, informationRates: newRates };
    });

    // Clear general informationRates error when any rate is changed
    if (validationErrors.informationRates) {
        setValidationErrors(prev => ({ ...prev, informationRates: '' }));
    }
  }, [validationErrors]); // Depend on validationErrors to clear correctly


  // --- Validation ---
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const currentKMax = Number(formData.kMax);

    // *** CHANGE: Validate informationRates array ***
    const rates = formData.informationRates;
    if (rates.length !== currentKMax) {
        errors.informationRates = `Exactly ${currentKMax} rates required.`;
    } else if (rates.some(isNaN)) {
        errors.informationRates = 'All rates must be valid numbers.';
    } else if (rates.some(r => r < 0 || r > 1)) {
        errors.informationRates = 'Rates must be between 0 and 1.';
    } else if (rates[currentKMax - 1] !== 1.0) {
        errors.informationRates = 'The last rate must be exactly 1.0.';
    } else {
        // Check if rates are increasing (allow non-strict for simplicity, adjust if needed)
        for (let i = 1; i < rates.length; i++) {
            if (rates[i] < rates[i - 1]) {
                 errors.informationRates = 'Rates must be non-decreasing.';
                 break;
            }
        }
    }

    // --- Validation for accrualTime/Intensity (remains mostly the same, parsing strings) ---
    const parseAndValidateStringArray = (value: string | undefined, fieldName: string, required?: boolean, expectedLength?: number, mustStartWith?: number): number[] | null => {
        if (!value?.trim()) { if (required) errors[fieldName] = 'Required'; return null; }
        try {
            const arr = value.split(',').map(s => parseFloat(s.trim()));
            if (arr.some(isNaN)) throw new Error('Contains non-numeric values');
            if (expectedLength !== undefined && arr.length !== expectedLength) throw new Error(`Requires ${expectedLength} values`);
            if (mustStartWith !== undefined && arr[0] !== mustStartWith) throw new Error(`Must start with ${mustStartWith}`);
            return arr;
        } catch (e) { errors[fieldName] = e instanceof Error ? e.message : 'Invalid format'; return null; }
    };

    const accrualTimes = parseAndValidateStringArray(formData.accrualTime, 'accrualTime', true, undefined, 0);
    if (accrualTimes) {
        const expectedIntensityLength = accrualTimes.length > 1 ? accrualTimes.length - 1 : 0;
        if (expectedIntensityLength > 0) { parseAndValidateStringArray(formData.accrualIntensity, 'accrualIntensity', true, expectedIntensityLength); }
        else if (formData.accrualIntensity.trim()) { errors.accrualIntensity = 'Not needed for single time point'; }
    } else { parseAndValidateStringArray(formData.accrualIntensity, 'accrualIntensity'); }

    // --- Other field validations (remain the same) ---
    if (isNaN(formData.value1) || formData.value1 <= 0) errors.value1 = 'Must be positive';
    if (isNaN(formData.value2) || formData.value2 <= 0) errors.value2 = 'Must be positive';
    if (formData.value1 === formData.value2) { errors.value1 = 'Values must differ'; errors.value2 = 'Values must differ'; }

    setValidationErrors(errors);
    return Object.keys(errors).every(key => !errors[key]);
  }, [formData]); // Depends only on formData

  // --- Form Submission ---
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) { 
      setError("Please fix the errors in the form."); 
      return; 
    }

    setLoading(true);
    setError(null);
    setResults(null);
    
    if (!secret) {
      setError("API key is missing. Please check your environment configuration.");
      setLoading(false);
      return;
    }

    let apiPayload;
    try {
      apiPayload = {
        sided: Number(formData.sided), 
        alpha: Number(formData.alpha), 
        beta: Number(formData.beta), 
        kMax: Number(formData.kMax),
        informationRates: formData.informationRates,
        design: formData.design, 
        measure: Number(formData.measure), 
        value1: Number(formData.value1), 
        value2: Number(formData.value2),
        dropoutRate1: Number(formData.dropoutRate1), 
        dropoutRate2: Number(formData.dropoutRate2),
        accrualTime: formData.accrualTime.split(',').map(s => parseFloat(s.trim())),
        accrualIntensity: formData.accrualIntensity.split(',').map(s => parseFloat(s.trim())),
      };

      // Validate parsed numbers
      if (apiPayload.accrualTime.some(isNaN) || apiPayload.accrualIntensity.some(isNaN)) {
        throw new Error("Invalid numeric input in accrual fields.");
      }

      console.log('Sending API request with payload:', apiPayload);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://drug-discovery-platform-7e07460be23d.herokuapp.com/calculate';
      console.log('Using API URL:', apiUrl);

      const response = await axios.post<{ size_result: CalculationResult | string }>(
        apiUrl,
        apiPayload,
        { 
          headers: { 
            'x-access-secret': secret,
            'Content-Type': 'application/json' 
          },
          timeout: 30000 
        }
      );

      console.log('API response:', response.data);

      const result = response.data.size_result;
      if (typeof result === 'string') { 
        setError(`Calculation Error: ${result}`); 
      }
      else if (result?.stages && Object.keys(result.stages).length > 0) { 
        setResults(result); 
      }
      else { 
        setError("Received unexpected or empty result format."); 
        console.warn("Unexpected result format:", result); 
      }
    } catch (err) {
      console.error("API Call failed:", err); 
      const axiosError = err as AxiosError<any>; 
      let message = "An unexpected error occurred.";
      
      if (axiosError.response) { 
        const data = axiosError.response.data; 
        message = `Server Error (${axiosError.response.status}): `; 
        if (data?.detail) { 
          message += typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail); 
        } else if (typeof data === 'string') { 
          message += data; 
      } else {
          message += "Could not process request."; 
        } 
      }
      else if (axiosError.request) { 
        message = "No response from server. Please check if the API server is running."; 
      } else { 
        message = `Request Setup Error: ${axiosError.message}`; 
      } 
      
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, secret]);

  // --- Reset ---
  const handleReset = useCallback(() => {
    setFormData(initialFormData); setResults(null); setError(null); setValidationErrors({});
  }, []);

  // --- kMax Change ---
  const handleKMaxChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const newKMax = parseInt(e.target.value, 10);
    // **** CHANGE: Update state with new default rates array ****
    const newRates = getDefaultInformationRates(newKMax);
    setFormData(prev => ({
        ...prev,
        kMax: newKMax,
        informationRates: newRates,
    }));
    // Clear potential validation error
    if (validationErrors.informationRates) {
        setValidationErrors(prev => ({ ...prev, informationRates: '' }));
    }
  }, [validationErrors]); // Dependency needed

  // --- Memoized Derived Values for Results (remain the same) ---
  const maxSubjects = useMemo(() => {
    if (!results?.stages) return 'N/A'; const keys = Object.keys(results.stages); if (keys.length === 0) return 'N/A';
    const lastKey = keys.sort((a, b) => parseInt(a) - parseInt(b)).pop(); return lastKey ? (results.stages[lastKey]?.maxNumberOfSubjects?.toString() ?? 'N/A') : 'N/A';
   }, [results]);
  const orderedStageKeys = useMemo(() => results?.stages ? Object.keys(results.stages).sort((a, b) => parseInt(a) - parseInt(b)) : [], [results]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Group Sequential Design Sample Size
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Calculate sample size for survival analysis
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pass the new handler to DesignFeaturesForm */}
            <DesignFeaturesForm
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange} // For other fields
              handleKMaxChange={handleKMaxChange}
              handleInformationRateChange={handleInformationRateChange} // New handler
            />

            <AssumptionsForm
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange} // Standard handler is fine here
            />
          </div>

          {/* Action Buttons */}
           <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
            <button 
              type="submit" 
              className={`flex-1 py-2.5 px-4 rounded-md text-white font-medium text-base shadow-sm transition duration-150 ease-in-out ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"} ${Object.values(validationErrors).some(v => v) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || Object.values(validationErrors).some(v => v)}
            >
              {loading ? 'Calculating...' : 'Calculate Sample Size'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 px-4 rounded-md text-gray-700 bg-white border border-gray-300 font-medium text-base shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reset Form
            </button>
          </div>
        </form>

        {/* Results Display with scenarioId */}
        {(loading || error || results) && (
           <ResultsDisplay
             loading={loading} 
             error={error} 
             results={results}
             maxSubjects={maxSubjects} 
             orderedStageKeys={orderedStageKeys}
             scenarioId={scenarioId}
             onSaveSuccess={() => setSaveSuccess(true)}
           />
        )}

        {saveSuccess && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Sample size successfully saved to protocol!
          </div>
        )}

      </div>
    </div>
  );
} 

export default SampleSizePage;

