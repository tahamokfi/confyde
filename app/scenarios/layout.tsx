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
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication and get projects
  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) {
        setError('Error fetching user data');
        return;
      }

      fetchProjects();
    };

    getUserData();
  }, [projectId]);
  
  // Fetch projects for the user's company
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setProjects(data || []);
      
      if (projectId && data) {
        const project = data.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          fetchScenarios(project.id);
        } else if (data.length > 0) {
          setSelectedProject(data[0]);
          fetchScenarios(data[0].id);
        }
      } else if (scenarioId && data) {
        // If we have a scenario ID but no project ID, fetch the scenario to get its project
        const { data: scenarioData, error: scenarioError } = await supabase
          .from('scenarios')
          .select('project_id, name, id, created_at')
          .eq('id', scenarioId)
          .single();
          
        if (!scenarioError && scenarioData) {
          const project = data.find(p => p.id === scenarioData.project_id);
          if (project) {
            setSelectedProject(project);
            fetchScenarios(project.id);
            setSelectedScenario({
              id: scenarioData.id,
              name: scenarioData.name,
              project_id: scenarioData.project_id,
              created_at: scenarioData.created_at
            });
          } else if (data.length > 0) {
            setSelectedProject(data[0]);
            fetchScenarios(data[0].id);
          }
        }
      } else if (data && data.length > 0) {
        setSelectedProject(data[0]);
        fetchScenarios(data[0].id);
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching projects');
    } finally {
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
    } catch (error: any) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // Force a full page reload by using window.location.href
    window.location.href = `/scenarios?project=${project.id}`;
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsScenarioDropdownOpen(false);
    
    // Get current path and update the URL with the selected scenario
    const basePath = pathname.split('?')[0];
    router.push(`${basePath}?id=${scenario.id}`);
  };

  const getTabClassName = (isActive: boolean) => {
    return `px-4 py-2 text-sm font-medium ${
      isActive 
        ? 'border-b-2 border-blue-500 text-blue-600' 
        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  };

  // Determine active tab based on pathname
  const isProtocolActive = !pathname.includes('/schema');
  const isSchemaActive = pathname.includes('/schema');

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
            {selectedScenario ? selectedScenario.name : 'Scenarios'}
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
              <div className="text-sm text-gray-500">Scenario 1</div>
              <div className="flex items-center mt-1">
                <div className="w-1 h-5 bg-teal-500 mr-2"></div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
              </div>
              <p className="text-gray-600 mt-1">{selectedProject.description || 'Lorem ipsum dolor sit amet consectetur. Nisi massa augue id sed lectus turpis tortor diam. Sem facilisis justo feugiat diam ullamcorper.'}</p>
            </div>

            <div className="flex justify-between items-center mt-4 mb-1">
              <div className="relative">
                <button
                  onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  {selectedScenario ? selectedScenario.name : 'Select Scenario'}
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isScenarioDropdownOpen && (
                  <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {scenarios.length > 0 ? (
                        scenarios.map((scenario) => (
                          <button
                            key={scenario.id}
                            onClick={() => handleScenarioSelect(scenario)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedScenario?.id === scenario.id
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {scenario.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No scenarios available</div>
                      )}
                      <button
                        onClick={() => {
                          setIsScenarioDropdownOpen(false);
                          router.push(`/scenarios/protocol?project=${selectedProject.id}`);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 border-t border-gray-100"
                      >
                        + Create New Scenario
                      </button>
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
                <div className="text-lg font-medium text-gray-700">
                  Tasks and collaboration
                </div>
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
          </nav>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 