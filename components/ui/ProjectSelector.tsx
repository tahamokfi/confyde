'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import eventBus from '@/lib/eventBus';

interface Project {
  id: string;
  name: string;
  description?: string;
}

// Skeleton loader for the ProjectSelector
function ProjectSelectorSkeleton() {
  return (
    <div className="px-4 py-2">
      <div className="w-full h-8 bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}

// Inner component that uses useSearchParams - will be wrapped in Suspense
function ProjectSelectorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on component mount and set up event listeners
  useEffect(() => {
    fetchProjects();
    
    // Subscribe to project events
    const addedUnsubscribe = eventBus.on('project-added', () => {
      console.log('ProjectSelector: Received project-added event');
      fetchProjects();
    });
    
    const deletedUnsubscribe = eventBus.on('project-deleted', (projectId) => {
      console.log('ProjectSelector: Received project-deleted event', projectId);
      
      // If the deleted project is the currently selected one, clear localStorage first
      if (selectedProject && selectedProject.id === projectId) {
        console.log('Currently selected project was deleted, clearing localStorage selection');
        localStorage.removeItem('selectedProjectId');
      }
      
      fetchProjects();
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      addedUnsubscribe();
      deletedUnsubscribe();
    };
  }, []); // Remove selectedProject from dependencies to prevent infinite loops

  // Check URL for project param on mount and when searchParams changes
  useEffect(() => {
    const urlProjectId = searchParams.get('project');
    if (urlProjectId && projects.length > 0) {
      const projectFromUrl = projects.find(p => p.id === urlProjectId);
      if (projectFromUrl && (!selectedProject || selectedProject.id !== urlProjectId)) {
        setSelectedProject(projectFromUrl);
        localStorage.setItem('selectedProjectId', urlProjectId);
      }
    }
  }, [searchParams, projects, selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setProjects(data || []);
      if (data && data.length > 0) {
        // Try to get project from URL first
        const urlProjectId = searchParams.get('project');
        const projectFromUrl = urlProjectId 
          ? data.find(p => p.id === urlProjectId)
          : null;
          
        // If not in URL, try localStorage
        const savedProjectId = localStorage.getItem('selectedProjectId');
        const projectFromStorage = !projectFromUrl && savedProjectId 
          ? data.find(p => p.id === savedProjectId)
          : null;
        
        setSelectedProject(projectFromUrl || projectFromStorage || data[0]);
        
        // Save to localStorage if found a project
        if (projectFromUrl) {
          localStorage.setItem('selectedProjectId', projectFromUrl.id);
        } else if (projectFromStorage) {
          localStorage.setItem('selectedProjectId', projectFromStorage.id);
        } else {
          localStorage.setItem('selectedProjectId', data[0].id);
        }
      } else {
        // No projects available, clear selection
        setSelectedProject(null);
        localStorage.removeItem('selectedProjectId');
      }
    } catch (error: any) {
      setError(error.message || 'Error fetching projects');
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    if (selectedProject?.id === project.id) {
      setIsOpen(false);
      return;
    }
    
    setSelectedProject(project);
    setIsOpen(false);
    localStorage.setItem('selectedProjectId', project.id);
    
    // Get current URL and search params
    const currentPath = window.location.pathname;
    const currentSearchParams = new URLSearchParams(window.location.search);
    
    // Update the project ID
    currentSearchParams.set('project', project.id);
    
    // Remove scenario ID if present to force a refresh of scenarios for the new project
    // This is crucial - when changing projects we want to see scenarios for the new project
    if (currentSearchParams.has('id')) {
      currentSearchParams.delete('id');
    }
    
    // Use router.push to navigate with the updated search params
    router.push(`${currentPath}?${currentSearchParams.toString()}`);
    
    // Use router.refresh() to ensure the page rerenders with new data
    router.refresh();
  };

  const handleCreateProject = () => {
    router.push('/dashboard?create=true');
  };

  if (loading) return <div className="text-sm text-gray-500 px-4">Loading projects...</div>;
  if (error) return <div className="text-sm text-red-500 px-4">Error: {error}</div>;
  if (projects.length === 0) return (
    <div className="px-4 py-2">
      <div className="text-sm text-gray-400">No projects available</div>
    </div>
  );

  return (
    <div className="px-4 py-2 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm text-white bg-[#1c4653] rounded p-2 hover:bg-[#265463]"
      >
        <span className="truncate">{selectedProject?.name || 'Select Project'}</span>
        <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 mx-4 bg-[#0c323d] border border-[#1c4653] rounded-md shadow-lg z-10">
          <div className="max-h-48 overflow-y-auto py-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className={`block w-full text-left px-3 py-2 text-sm ${
                  selectedProject?.id === project.id
                    ? 'bg-[#1c4653] text-white'
                    : 'text-gray-300 hover:bg-[#1c4653]'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the wrapped component with Suspense
export default function ProjectSelector() {
  return (
    <Suspense fallback={<ProjectSelectorSkeleton />}>
      <ProjectSelectorInner />
    </Suspense>
  );
} 