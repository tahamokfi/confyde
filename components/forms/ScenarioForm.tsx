'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ScenarioFormProps {
  onSuccess: (newScenario: any) => void;
  onCancel: () => void;
  projectId: string;
  companyId: string;
}

export default function ScenarioForm({ onSuccess, onCancel, projectId, companyId }: ScenarioFormProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !startDate) {
      setError('Scenario name and start date are required');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert([
          { 
            name, 
            description, 
            start_date: startDate,
            project_id: projectId,
            company_id: companyId,
            sample_size: 0,
            inclusion_criteria: '',
            investigational_arm: '',
            control_arm: '',
            primary_end_point: '',
            secondary_end_point: '',
            exploratory_end_point: ''
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      onSuccess(data);
    } catch (error: any) {
      setError(error.message || 'An error occurred while creating the scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Scenario</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Scenario Name*
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date*
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </div>
  );
} 