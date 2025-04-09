'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function SchemaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    eligibility: true,
    investigational: true,
    control: true,
    primary: true,
    secondary: true,
    exploratory: true
  });

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

  // Helper function to split text into bullet points
  const renderBulletPoints = (text: string) => {
    if (!text) return <p className="text-gray-400 italic">Not specified</p>;
    
    // Split by new lines or bullet markers
    const lines = text.split(/\n+|•/).filter(line => line.trim() !== '');
    
    if (lines.length <= 1) {
      return <p className="text-gray-800 whitespace-pre-wrap">{text}</p>;
    }
    
    return (
      <ul className="list-disc pl-5 space-y-2">
        {lines.map((line, index) => {
          // Remove asterisks (*) from the beginning of the line
          const cleanedLine = line.trim().replace(/^\s*\*\s*/, '');
          return <li key={index} className="text-gray-800">{cleanedLine}</li>;
        })}
      </ul>
    );
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render a collapsible section
  const renderSection = (
    id: string, 
    title: string, 
    content: React.ReactNode, 
    className: string = "",
    headerClass: string = "bg-gray-800 text-white"
  ) => {
    return (
      <div className={`bg-gray-50 rounded-lg shadow-sm overflow-hidden mb-4 ${className}`}>
        <div 
          className={`${headerClass} p-3 flex justify-between items-center cursor-pointer`}
          onClick={() => toggleSection(id)}
        >
          <h3 className="font-medium">{title}</h3>
          {expandedSections[id] ? 
            <ChevronDownIcon className="h-5 w-5" /> : 
            <ChevronRightIcon className="h-5 w-5" />
          }
        </div>
        {expandedSections[id] && (
          <div className="p-5">
            {content}
          </div>
        )}
      </div>
    );
  };

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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* First column - Eligibility */}
            <div className="space-y-4">
              {renderSection(
                'eligibility',
                'Key Eligibility Criteria',
                renderBulletPoints(scenario.inclusion_criteria || ''),
                '',
                'bg-gray-800 text-white'
              )}
            </div>
            
            {/* Middle column - Arms with visual connector */}
            <div className="relative">
              <div className="h-full flex flex-col">
                
                {/* Investigational Arm */}
                <div className="z-10 relative mb-8">
                  {renderSection(
                    'investigational',
                    'Investigational arm',
                    renderBulletPoints(scenario.investigational_arm || ''),
                    '',
                    'bg-gray-800 text-white'
                  )}
                  
                </div>
                
                {/* Control Arm */}
                <div className="z-10 relative">
                  {renderSection(
                    'control',
                    'Control arm',
                    renderBulletPoints(scenario.control_arm || ''),
                    '',
                    'bg-gray-800 text-white'
                  )}

                  {/* Study Design Overview */}
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-wrap items-center justify-center gap-4 my-3">
                      <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg flex items-center">
                        <span className="font-medium text-lg">Sample Size = {scenario.sample_size || '0'}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-teal-600 text-white px-4 py-2 rounded-lg mx-2">
                          <span className="font-medium">R 1:1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  

                </div>
              </div>
            </div>
            
            {/* Right column - Endpoints */}
            <div className="space-y-4">
              
              {/* Primary Endpoint */}
              {renderSection(
                'primary',
                'Primary endpoint',
                renderBulletPoints(scenario.primary_end_point || ''),
                '',
                'bg-blue-700 text-white'
              )}
              
              {/* Secondary Endpoint */}
              {renderSection(
                'secondary',
                'Secondary endpoint',
                renderBulletPoints(scenario.secondary_end_point || ''),
                '',
                'bg-blue-600 text-white'
              )}
              
              {/* Exploratory Endpoint */}
              {renderSection(
                'exploratory',
                'Exploratory endpoint',
                renderBulletPoints(scenario.exploratory_end_point || ''),
                '',
                'bg-blue-500 text-white'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 