'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ProtocolFormProps {
  scenario: any;
  onSuccess: () => void;
}

export default function ProtocolForm({ scenario, onSuccess }: ProtocolFormProps) {
  const [inclusionCriteria, setInclusionCriteria] = useState(scenario?.inclusion_criteria || '');
  const [sampleSize, setSampleSize] = useState(scenario?.sample_size?.toString() || '0');
  const [investigationalArm, setInvestigationalArm] = useState(scenario?.investigational_arm || '');
  const [controlArm, setControlArm] = useState(scenario?.control_arm || '');
  const [primaryEndPoint, setPrimaryEndPoint] = useState(scenario?.primary_end_point || '');
  const [secondaryEndPoint, setSecondaryEndPoint] = useState(scenario?.secondary_end_point || '');
  const [exploratoryEndPoint, setExploratoryEndPoint] = useState(scenario?.exploratory_end_point || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('scenarios')
        .update({
          inclusion_criteria: inclusionCriteria,
          sample_size: parseInt(sampleSize) || 0,
          investigational_arm: investigationalArm,
          control_arm: controlArm,
          primary_end_point: primaryEndPoint,
          secondary_end_point: secondaryEndPoint,
          exploratory_end_point: exploratoryEndPoint
        })
        .eq('id', scenario.id);

      if (error) {
        throw error;
      }

      setSuccess(true);
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating the scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Protocol elements saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="inclusionCriteria" className="block text-sm font-medium text-gray-700 mb-1">
            Inclusion Criteria
          </label>
          <textarea
            id="inclusionCriteria"
            value={inclusionCriteria}
            onChange={(e) => setInclusionCriteria(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-700 mb-1">
            Sample Size
          </label>
          <input
            id="sampleSize"
            type="number"
            min="0"
            value={sampleSize}
            onChange={(e) => setSampleSize(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="investigationalArm" className="block text-sm font-medium text-gray-700 mb-1">
            Investigational Arm
          </label>
          <textarea
            id="investigationalArm"
            value={investigationalArm}
            onChange={(e) => setInvestigationalArm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="controlArm" className="block text-sm font-medium text-gray-700 mb-1">
            Control Arm
          </label>
          <textarea
            id="controlArm"
            value={controlArm}
            onChange={(e) => setControlArm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="primaryEndPoint" className="block text-sm font-medium text-gray-700 mb-1">
            Primary End Point
          </label>
          <textarea
            id="primaryEndPoint"
            value={primaryEndPoint}
            onChange={(e) => setPrimaryEndPoint(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="secondaryEndPoint" className="block text-sm font-medium text-gray-700 mb-1">
            Secondary End Point
          </label>
          <textarea
            id="secondaryEndPoint"
            value={secondaryEndPoint}
            onChange={(e) => setSecondaryEndPoint(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="exploratoryEndPoint" className="block text-sm font-medium text-gray-700 mb-1">
            Exploratory End Point
          </label>
          <textarea
            id="exploratoryEndPoint"
            value={exploratoryEndPoint}
            onChange={(e) => setExploratoryEndPoint(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Protocol Elements'}
          </button>
        </div>
      </form>
    </div>
  );
} 