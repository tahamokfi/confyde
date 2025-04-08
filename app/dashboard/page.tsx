'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  sample_size: number;
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('project');
  
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and get user
  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);
      fetchProjects();
    };

    getUserData();
  }, [router, urlProjectId]); // Add urlProjectId as dependency to reload when project changes

  // Fetch projects and scenarios
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setProjects(data || []);
      
      if (data && data.length > 0) {
        // Check if there's a project ID in the URL
        if (urlProjectId) {
          const projectFromUrl = data.find(p => p.id === urlProjectId);
          if (projectFromUrl) {
            setSelectedProject(projectFromUrl);
            fetchScenarios(projectFromUrl.id);
            return;
          }
        }
        
        // If no project in URL or not found, use the first one
        setSelectedProject(data[0]);
        fetchScenarios(data[0].id);
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch scenarios for the selected project
  const fetchScenarios = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true });

      if (error) throw error;

      setScenarios(data || []);
    } catch (error: any) {
      setError(error.message || 'Error fetching scenarios');
    }
  };

  // Handler for project selection (for any internal dashboard project selector)
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    fetchScenarios(project.id);
    // Update URL without reloading
    router.push(`/dashboard?project=${project.id}`, { scroll: false });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {selectedProject && (
          <>
            <div className="mb-6">
              <div className="text-sm text-gray-500">Scenario 1</div>
              <div className="flex items-center mt-1.5">
                <div className="w-1 h-5 bg-teal-500 mr-2"></div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
              </div>
              <p className="mt-2 text-gray-600">{selectedProject.description || 'Lorem ipsum dolor sit amet consectetur. Nisi massa augue id sed lectus turpis tortor diam. Sem facilisis justo feugiat diam ullamcorper.'}</p>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-gray-900">0.74</div>
                <div className="text-sm text-gray-500 mt-1">HR</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-gray-900">58%</div>
                <div className="text-sm text-gray-500 mt-1">PTS</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-gray-900">42%</div>
                <div className="text-sm text-gray-500 mt-1">PRS</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-gray-900">$300m</div>
                <div className="text-sm text-gray-500 mt-1">eNPV</div>
              </div>
            </div>

            {/* Scenarios section */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Scenarios</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={() => router.push(`/scenarios?project=${selectedProject.id}`)}
                    className="px-4 py-2 bg-[#0c323d] text-white rounded-md text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add scenario
                  </button>
                  <button className="px-4 py-2 border border-[#0c323d] text-[#0c323d] rounded-md text-sm">
                    Add summary
                  </button>
                </div>
              </div>

              {/* Scenarios table */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scenario #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key Endpoints
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Study Budget
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Launch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PTS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scenarios.length > 0 ? (
                      scenarios.map((scenario, index) => (
                        <tr 
                          key={scenario.id}
                          className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          onClick={() => router.push(`/scenarios?id=${scenario.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {scenario.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            PFS and OS (ITT; dual primary)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {scenario.sample_size || 800}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $330m
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            3Q27
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            58%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No scenarios yet. Create your first scenario!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedProject && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Confyde</h2>
            <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
            <button
              onClick={() => router.push('/dashboard?create=true')}
              className="px-4 py-2 bg-[#0c323d] text-white rounded-md hover:bg-[#1c4653] focus:outline-none"
            >
              Create Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 