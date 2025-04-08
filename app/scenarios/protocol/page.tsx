'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtocolForm from '@/components/forms/ProtocolForm';
import ScenarioForm from '@/components/forms/ScenarioForm';
import { supabase } from '@/lib/supabaseClient';

export default function ProtocolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  const [scenario, setScenario] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string>('');
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

      // Get company ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) {
        setError('Error fetching user data');
        setLoading(false);
        return;
      }

      setCompanyId(userData.company_id);

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

  const handleScenarioCreated = (newScenario: any) => {
    setScenario(newScenario);
    router.push(`/scenarios/protocol?id=${newScenario.id}`);
  };

  const handleProtocolUpdated = () => {
    // Refresh scenario data
    if (scenarioId) {
      const fetchScenario = async () => {
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', scenarioId)
          .single();

        if (!error && data) {
          setScenario(data);
        }
      };

      fetchScenario();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // If we have a scenario, show protocol form. Otherwise, show create scenario form.
  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {scenario ? (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{scenario.name} - Protocol Elements</h2>
          <ProtocolForm 
            scenario={scenario} 
            onSuccess={handleProtocolUpdated} 
          />
        </>
      ) : projectId ? (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Scenario</h2>
          <ScenarioForm 
            projectId={projectId}
            companyId={companyId}
            onSuccess={handleScenarioCreated}
            onCancel={() => router.push('/dashboard')}
          />
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Please select a project first to create a scenario.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
} 