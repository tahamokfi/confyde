'use client';

import React, { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { handleInputChange, handleArrayInputChange, handleSliderChange } from '@/lib/formUtils';
import { FormData as GenericFormData } from '@/lib/types';

// Define interfaces for the form data
interface FormData extends GenericFormData {
  sided: number;
  alpha: number;
  beta: number;
  kMax: number;
  informationRates: number[];
  design: string;
  measure: number;
  value1: number;
  value2: number;
  dropoutRate1: number;
  dropoutRate2: number;
  accrualTime: number[];
  accrualIntensity: number[];
}

export default function SampleSizePage() {
  const [formData, setFormData] = useState<FormData>({
    sided: 1, alpha: 0.025, beta: 0.1, kMax: 3,
    informationRates: [0.5, 0.7, 1.0], design: "asOF", measure: 1,
    value1: 10.5, value2: 8.0, dropoutRate1: 10.0, dropoutRate2: 10.0,
    accrualTime: [0, 18, 30], accrualIntensity: [15, 40]
  });
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);

  // Using the shared utility functions with the proper arguments
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleInputChange(e, setFormData, formData);
  };

  const handleFormArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleArrayInputChange(e, setFormData, formData);
  };

  const handleFormSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSliderChange(e, setFormData, formData);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiKeyMissing(false);

    const apiKey = process.env.NEXT_PUBLIC_HEROKU_HASH;
    
    if (!apiKey) {
      setApiKeyMissing(true);
      setLoading(false);
      setError("API key is missing. Please set the NEXT_PUBLIC_HEROKU_HASH environment variable.");
      return;
    }

    try {
      const response = await axios.post<{ summary: string | object }>(
        'https://drug-discovery-platform-7e07460be23d.herokuapp.com/calculate',
        formData,
        { headers: { 'x-access-secret': apiKey } }
      );

      const summary = response.data.summary;
      setResults(typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2));
    } catch (err) {
      const error = err as AxiosError<any>;
      const detail = error.response?.data;
      
      console.error('API Error:', error);
      if (typeof detail === 'string') {
        setError(detail);
      } else if (typeof detail === 'object') {
        setError(JSON.stringify(detail, null, 2));
      } else {
        setError("An error occurred while calculating sample size. Please check the API endpoint and credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Sample Size for Group Sequential Design with one Survival Endpoint</h1>

      {apiKeyMissing && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <p className="font-bold">Configuration Error</p>
          <p>The API key is missing. Please contact your administrator to set the NEXT_PUBLIC_HEROKU_HASH environment variable.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Design Features */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Design Features</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternative hypothesis</label>
                <select 
                  name="sided" 
                  value={formData.sided} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={1}>One-sided</option>
                  <option value={2}>Two-sided</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type I error (alpha)</label>
                <select 
                  name="alpha" 
                  value={formData.alpha} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={0.025}>2.5%</option>
                  <option value={0.05}>5%</option>
                  <option value={0.1}>10%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type II error (1 - power)</label>
                <select 
                  name="beta" 
                  value={formData.beta} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={0.05}>5%</option>
                  <option value={0.1}>10%</option>
                  <option value={0.15}>15%</option>
                  <option value={0.2}>20%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of stages</label>
                <select 
                  name="kMax" 
                  value={formData.kMax} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={2}>Two</option>
                  <option value={3}>Three</option>
                  <option value={4}>Four</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Information fraction</label>
                <input 
                  type="text" 
                  name="informationRates" 
                  value={formData.informationRates.join(',')} 
                  onChange={handleFormArrayInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of design</label>
                <select 
                  name="design" 
                  value={formData.design} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="asOF">O'Brien & Fleming type alpha spending</option>
                  <option value="OF">O'Brien & Fleming</option>
                  <option value="P">Pocock</option>
                  <option value="HP">Haybittle & Peto</option>
                  <option value="WToptimum">Optimum design within Wang & Tsiatis class</option>
                  <option value="asP">Pocock type alpha spending</option>
                  <option value="asKD">Kim & DeMets alpha spending</option>
                  <option value="asHSD">Hwang, Shi & DeCani alpha spending</option>
                  <option value="asUser">User defined alpha spending</option>
                  <option value="noEarlyEfficacy">No early efficacy stop</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Assumptions</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
                <select 
                  name="measure" 
                  value={formData.measure} 
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={1}>Median survival</option>
                  <option value={2}>Hazard rate (lambda)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment arm</label>
                <input 
                  type="number" 
                  name="value1" 
                  value={formData.value1} 
                  onChange={handleFormInputChange}
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Control arm</label>
                <input 
                  type="number" 
                  name="value2" 
                  value={formData.value2} 
                  onChange={handleFormInputChange}
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual dropout percent of treatment: {formData.dropoutRate1}%
                </label>
                <input 
                  type="range" 
                  name="dropoutRate1" 
                  min="0" 
                  max="100" 
                  value={formData.dropoutRate1} 
                  onChange={handleFormSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual dropout percent of control: {formData.dropoutRate2}%
                </label>
                <input 
                  type="range" 
                  name="dropoutRate2" 
                  min="0" 
                  max="100" 
                  value={formData.dropoutRate2} 
                  onChange={handleFormSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment month ranges</label>
                <input 
                  type="text" 
                  name="accrualTime" 
                  value={formData.accrualTime.join(',')} 
                  onChange={handleFormArrayInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly enrollment</label>
                <input 
                  type="text" 
                  name="accrualIntensity" 
                  value={formData.accrualIntensity.join(',')} 
                  onChange={handleFormArrayInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Results area */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Results</h2>
            
            <button 
              type="submit" 
              className="w-full bg-[#0c323d] text-white py-2 px-4 rounded hover:bg-[#0a2830] transition-colors duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || apiKeyMissing}
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
            
            {loading && <p className="text-gray-600 text-sm">Calculating sample size. This may take a moment...</p>}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                {error}
              </div>
            )}
            
            {results && (
              <div className="bg-gray-50 p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
                {results}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 