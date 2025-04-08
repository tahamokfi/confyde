'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
}

interface NavbarProps {
  projects: Project[];
  selectedProject?: Project | null;
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
}

export default function Navbar({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  onCreateProject 
}: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <span className="ml-2 text-gray-900 font-medium">Confyde</span>
            </Link>
            
            <div className="ml-6 flex space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/scenarios" 
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Scenarios
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {selectedProject ? selectedProject.name : 'Select Project'}
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          onProjectSelect(project);
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedProject?.id === project.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {project.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onCreateProject();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      + Create New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 