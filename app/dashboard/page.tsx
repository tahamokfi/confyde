'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { handleStringChange } from '@/lib/formUtils';

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

// DashboardContent component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('project');
  
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for scenario creation
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // New state for scenario deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<Scenario | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Check authentication and get user
  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);
      
      // Get user's company ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();
        
      if (!userError && userData) {
        setCompanyId(userData.company_id);
      }
      
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
        
        // If no project in URL, check localStorage
        const savedProjectId = localStorage.getItem('selectedProjectId');
        if (savedProjectId) {
          const projectFromStorage = data.find(p => p.id === savedProjectId);
          if (projectFromStorage) {
            setSelectedProject(projectFromStorage);
            fetchScenarios(projectFromStorage.id);
            return;
          }
        }
        
        // If not in URL or localStorage, use the first one
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
  
  // Handler for creating a new scenario
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !scenarioName) {
      setError('Project and scenario name are required');
      return;
    }
    
    setCreateLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert([
          { 
            name: scenarioName,
            description: scenarioDesc,
            project_id: selectedProject.id,
            company_id: companyId,
            start_date: new Date().toISOString().split('T')[0],
            // Add default values for required fields
            sample_size: 0
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new scenario to the list
      setScenarios([...scenarios, data]);
      
      // Reset form and close modal
      setScenarioName('');
      setScenarioDesc('');
      setShowNewScenarioModal(false);
      setCreateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || 'Error creating scenario');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handler for deleting a scenario
  const handleDeleteScenario = async () => {
    if (!scenarioToDelete) return;
    
    setDeleteLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenarioToDelete.id);
        
      if (error) throw error;
      
      // Remove the deleted scenario from the list
      setScenarios(scenarios.filter(s => s.id !== scenarioToDelete.id));
      
      // Close modal
      setScenarioToDelete(null);
      setShowDeleteModal(false);
      setDeleteSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || 'Error deleting scenario');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Function to open delete confirmation modal
  const confirmDelete = (scenario: Scenario, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setScenarioToDelete(scenario);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!selectedProject && projects.length === 0 && !loading) {
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
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Confyde</h2>
            <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
            <button
              onClick={() => router.push('/portfolio-projects')}
              className="px-4 py-2 bg-[#0c323d] text-white rounded-md hover:bg-[#1c4653] focus:outline-none"
            >
              Manage Projects
            </button>
          </div>
        </main>
      </div>
    );
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
        
        {createSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Scenario created successfully!
          </div>
        )}
        
        {deleteSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Scenario deleted successfully!
          </div>
        )}

        {selectedProject && (
          <>
            <div className="mb-6">
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
                    onClick={() => setShowNewScenarioModal(true)}
                    className="px-4 py-2 bg-[#0c323d] text-white rounded-md text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add scenario
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scenarios.length > 0 ? (
                      scenarios.map((scenario, index) => (
                        <tr 
                          key={scenario.id}
                          className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          onClick={() => router.push(`/scenarios/protocol?id=${scenario.id}`)}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={(e) => confirmDelete(scenario, e)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
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
      </main>
      
      {/* New Scenario Modal */}
      {showNewScenarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Scenario</h3>
              <button 
                onClick={() => setShowNewScenarioModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateScenario}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={scenarioName}
                  onChange={(e) => handleStringChange(e, setScenarioName)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={scenarioDesc}
                  onChange={(e) => handleStringChange(e, setScenarioDesc)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewScenarioModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Scenario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delete Scenario</h3>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">Are you sure you want to delete this scenario?</p>
              <p className="font-medium mt-1">{scenarioToDelete?.name}</p>
              <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteScenario}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component wrapped with Suspense
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 