'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SchemaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      if (scenarioId) {
        // Fetch scenario data
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', scenarioId)
          .single();

        if (error) {
          setError('Error fetching scenario data');
        } else {
          setScenario(data);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [scenarioId, projectId, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Check if protocol data is available
  const isProtocolDataEmpty = !scenario || (
    !scenario.inclusion_criteria &&
    !scenario.sample_size &&
    !scenario.investigational_arm &&
    !scenario.control_arm &&
    !scenario.primary_end_point &&
    !scenario.secondary_end_point &&
    !scenario.exploratory_end_point
  );

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isProtocolDataEmpty ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">
            {scenarioId ? 
              'Protocol elements are not defined yet. Please define them in the Protocol Elements tab.' : 
              'Please select a scenario to view its schema.'}
          </p>
          {scenarioId && (
            <button
              onClick={() => router.push(`/scenarios/protocol?id=${scenarioId}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Protocol Elements
            </button>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{scenario.name} - Schema</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Inclusion Criteria</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.inclusion_criteria ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.inclusion_criteria}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Sample Size</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-800 text-xl">{scenario.sample_size || '0'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Investigational Arm</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.investigational_arm ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.investigational_arm}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Control Arm</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.control_arm ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.control_arm}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Primary End Point</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.primary_end_point ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.primary_end_point}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Secondary End Point</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.secondary_end_point ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.secondary_end_point}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Exploratory End Point</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                  {scenario.exploratory_end_point ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{scenario.exploratory_end_point}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-end">
              <button
                onClick={() => router.push(`/scenarios/protocol?id=${scenario.id}`)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Edit Protocol Elements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 