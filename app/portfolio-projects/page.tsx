'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { handleStringChange } from '@/lib/formUtils';
import { fetchProjects, createProject } from '@/lib/dataUtils';
import { Project } from '@/lib/types';
import eventBus from '@/lib/eventBus';

export default function PortfolioProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCompanySelector, setShowCompanySelector] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error("No active session found");
          window.location.href = '/auth/login';
          return;
        }
        
        console.log("Session found, user ID:", session.user.id);
        setUserId(session.user.id);
        
        // Get user's company ID - DEBUG: Log the raw query results
        console.log("Fetching user data for user ID:", session.user.id);
        
        // Try to directly query the users table
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id);
          
        console.log("Raw users data:", usersData);
        console.log("Users error:", usersError);
        
        if (usersError) {
          console.error("Error fetching users data:", usersError);
          setError('Error fetching user data: ' + usersError.message);
          setLoading(false);
          return;
        }
        
        // Check if we found any user records
        if (!usersData || usersData.length === 0) {
          console.error("No user record found");
          setError('Your user account is not properly set up. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Use the first record we found (should only be one)
        const userData = usersData[0];
        
        // Check if the user has a company_id
        if (!userData.company_id) {
          console.error("No company ID found for user");
          setError('No company associated with your account. Please contact support.');
          setLoading(false);
          return;
        }
        
        console.log("Company ID found:", userData.company_id);
        setCompanyId(userData.company_id);
        
        // Fetch projects for this company after we have the company ID
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', userData.company_id)
          .order('name', { ascending: true });
          
        if (projectsError) {
          console.error("Error loading projects:", projectsError);
          setError('Error loading projects: ' + projectsError.message);
          setLoading(false);
          return;
        }
        
        console.log(`Loaded ${projectsData?.length || 0} projects successfully`);
        setProjects(projectsData || []);
        setLoading(false);
        
      } catch (err: any) {
        console.error("Error in initialization:", err);
        setError('Error initializing page: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    getUser();
  }, []);
  
  const loadProjects = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!companyId) {
        console.error("Company ID is null or undefined");
        
        // Try to recover company ID if user ID is available
        if (userId) {
          console.log("Attempting to recover company ID for user:", userId);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('company_id')
            .eq('user_id', userId)
            .single();
            
          if (userError || !userData || !userData.company_id) {
            console.error("Could not recover company ID:", userError);
            setError("Unable to load projects: missing company information. Please try refreshing the page.");
            setLoading(false);
            return;
          }
          
          console.log("Recovered company ID:", userData.company_id);
          setCompanyId(userData.company_id);
        } else {
          setError("Unable to load projects: missing company information. Please try refreshing the page.");
          setLoading(false);
          return;
        }
      }
      
      console.log(`Loading projects for company ID: ${companyId}`);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error loading projects:", error);
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} projects successfully`);
      setProjects(data || []);
    } catch (err: any) {
      console.error("Project loading error:", err);
      setError(err.message || 'Error loading projects');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !startDate || !userId || !companyId) {
      setError('Missing required fields');
      return;
    }
    
    setCreateLoading(true);
    setError(null);
    
    try {
      const { data, error: createError } = await createProject({
        name,
        description,
        start_date: startDate,
        company_id: companyId,
        created_by: userId
      });
      
      if (createError) throw new Error(createError);
      
      // Reset form
      setName('');
      setDescription('');
      setStartDate('');
      setShowCreateForm(false);
      
      // Add new project to the list
      setProjects([...projects, data]);
      setCreateSuccess(true);
      
      // Emit an event to notify other components that a project was added
      console.log('Emitting project-added event');
      eventBus.emit('project-added', data);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error creating project');
    } finally {
      setCreateLoading(false);
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [projectId]: true }));
      
      // Check if there are scenarios for this project
      const { data: scenarios, error: scenariosError } = await supabase
        .from('scenarios')
        .select('id')
        .eq('project_id', projectId);
        
      if (scenariosError) throw scenariosError;
      
      if (scenarios && scenarios.length > 0) {
        setError('Cannot delete project with existing scenarios. Please delete all scenarios first.');
        return;
      }
      
      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      setDeleteSuccess(`Project deleted successfully`);
      
      // Emit an event to notify other components that a project was deleted
      console.log('Emitting project-deleted event');
      eventBus.emit('project-deleted', projectId);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Error deleting project');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleManualCompanySelection = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setCompanies(data || []);
      setShowCompanySelector(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Error loading companies:", err);
      setError(`Failed to load companies: ${err.message}`);
      setLoading(false);
    }
  };

  const applyCompanySelection = async () => {
    if (!selectedCompanyId || !userId) {
      setError("Please select a company and ensure you're logged in");
      return;
    }
    
    try {
      setLoading(true);
      
      // First check if user record exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId);
        
      if (existingUser && existingUser.length > 0) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({ company_id: selectedCompanyId })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new user record
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user?.email || '';
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            user_id: userId, 
            company_id: selectedCompanyId,
            email: email
          }]);
          
        if (insertError) throw insertError;
      }
      
      // Set company ID and reload
      setCompanyId(selectedCompanyId);
      setShowCompanySelector(false);
      
      // Load projects with new company ID
      await loadProjects();
      
    } catch (err: any) {
      console.error("Error setting company:", err);
      setError(`Failed to set company: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Portfolio & Projects</h1>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {error && error.includes('missing company information') && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Company Information Missing</h2>
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">We couldn't find your company information.</p>
              <p>This is required to manage projects in the system.</p>
            </div>
            <p className="mb-6 text-gray-600">
              Your user account appears to be set up correctly, but we couldn't find an associated company. 
              This could be due to one of the following reasons:
            </p>
            <ul className="list-disc text-left mx-auto max-w-md mb-6 text-gray-600">
              <li className="mb-2">Your company hasn't been properly set up in the system</li>
              <li className="mb-2">Your user account hasn't been linked to your company</li>
              <li className="mb-2">There may be a temporary system issue</li>
            </ul>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <a
                href="mailto:support@confyde.com?subject=Missing%20Company%20Information&body=I'm%20experiencing%20an%20issue%20with%20missing%20company%20information%20in%20the%20Portfolio%20%26%20Projects%20page."
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Contact Support
              </a>
              <button
                onClick={handleManualCompanySelection}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Select Company
              </button>
            </div>
          </div>
        )}
        
        {showCompanySelector && (
          <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Select Your Company</h3>
            <p className="mb-4 text-sm text-gray-600">
              This will associate your user account with the selected company.
            </p>
            
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCompanySelector(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={applyCompanySelection}
                disabled={!selectedCompanyId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                Apply Selection
              </button>
            </div>
          </div>
        )}
        
        {error && !error.includes('missing company information') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {deleteSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {deleteSuccess}
          </div>
        )}
        
        {createSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Project created successfully!
          </div>
        )}
        
        {!error && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Manage Projects</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-[#0c323d] text-white rounded-md hover:bg-[#1c4653] text-sm flex items-center"
              >
                {showCreateForm ? 'Cancel' : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                  </>
                )}
              </button>
            </div>
            
            {showCreateForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Project</h3>
                
                <form onSubmit={handleCreateProject}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name*
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => handleStringChange(e, setName)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date*
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStringChange(e, setStartDate)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => handleStringChange(e, setDescription)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      disabled={createLoading}
                    >
                      {createLoading ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading projects...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No projects found. Create a new project to get started.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(project.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                          {project.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-900 ml-3"
                            disabled={deleteLoading[project.id]}
                          >
                            {deleteLoading[project.id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Note:</strong> When you delete a project, all associated scenarios will also be deleted.
              </p>
            </div>
        </div>
        )}
      </main>
    </div>
  );
} 