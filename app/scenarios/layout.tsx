'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
}

interface Scenario {
  id: string;
  name: string;
  project_id: string;
  created_at?: string;
}

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication and get project data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }
      
      if (projectId) {
        fetchProjectDetails(projectId);
      } else if (scenarioId) {
        fetchScenarioProject(scenarioId);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [projectId, scenarioId]);
  
  // Fetch project details when projectId changes
  const fetchProjectDetails = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedProject(data);
        fetchScenarios(data.id);
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching project details');
      setIsLoading(false);
    }
  };
  
  // Fetch project details from scenario
  const fetchScenarioProject = async (scenarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('project_id, name, id, created_at')
        .eq('id', scenarioId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setSelectedScenario({
          id: data.id,
          name: data.name,
          project_id: data.project_id,
          created_at: data.created_at
        });
        
        fetchProjectDetails(data.project_id);
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching scenario details');
      setIsLoading(false);
    }
  };

  // Fetch scenarios for the selected project
  const fetchScenarios = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, name, project_id, created_at')
        .eq('project_id', projectId)
        .order('name', { ascending: true });

      if (error) throw error;

      setScenarios(data || []);
      
      // If we're looking at a scenario, make sure it's selected
      if (scenarioId) {
        const scenario = data?.find(s => s.id === scenarioId);
        if (scenario) {
          setSelectedScenario(scenario);
        } else if (data && data.length > 0) {
          // If no scenario is selected but we have scenarios, select the first one
          setSelectedScenario(data[0]);
        } else {
          setSelectedScenario(null);
        }
      } else if (data && data.length > 0) {
        // If no scenario is selected but we have scenarios, select the first one
        setSelectedScenario(data[0]);
      } else {
        setSelectedScenario(null);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching scenarios:', error);
      setIsLoading(false);
    }
  };

  const getTabClassName = (isActive: boolean) => {
    return `px-4 py-2 text-sm font-medium ${
      isActive 
        ? 'border-b-2 border-blue-500 text-blue-600' 
        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  };

  // Determine active tab based on pathname
  const isProtocolActive = pathname.includes('/protocol');
  const isSchemaActive = pathname.includes('/schema');
  const isSampleSizeActive = pathname.includes('/sample-size');

  // Update selected scenario when scenario ID changes
  useEffect(() => {
    if (scenarioId && scenarios.length > 0) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        setSelectedScenario(scenario);
      }
    }
  }, [scenarioId, scenarios]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Scenario Design
          </h1>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-6">
            {error}
          </div>
        )}

        {selectedProject && (
          <div className="p-6 pb-2">
            <div className="mb-2">
              <div className="flex items-center mt-1">
                <div className="w-1 h-5 bg-teal-500 mr-2"></div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
              </div>
              <p className="text-gray-600 mt-1">{selectedProject.description}</p>
            </div>

            <div className="flex justify-between items-center mt-4 mb-1">
              <div>
                {selectedScenario && (
                  <div className="flex items-center">
                    <div className="w-1 h-5 bg-blue-500 mr-2"></div>
                    <div className="text-lg font-medium text-gray-700">
                      <span className="text-blue-500">Scenario:</span> {selectedScenario.name}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-[#0c323d] border border-[#0c323d] rounded-md mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-6">
            <Link
              href={`/scenarios/protocol?${scenarioId ? `id=${scenarioId}` : `project=${selectedProject?.id}`}`}
              className={getTabClassName(isProtocolActive)}
            >
              Protocol Elements
            </Link>
            <Link
              href={`/scenarios/schema?${scenarioId ? `id=${scenarioId}` : `project=${selectedProject?.id}`}`}
              className={getTabClassName(isSchemaActive)}
            >
              Schema
            </Link>
            <Link
              href={`/scenarios/sample-size?${scenarioId ? `id=${scenarioId}` : `project=${selectedProject?.id}`}`}
              className={getTabClassName(isSampleSizeActive)}
            >
              Sample Size
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 