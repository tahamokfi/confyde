'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ScenariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('id');
  const projectId = searchParams.get('project');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If we already have a scenario ID, just redirect to protocol
      if (scenarioId) {
        router.push(`/scenarios/protocol?id=${scenarioId}`);
        return;
      }

      // If we have a project ID but no scenario ID, fetch the first scenario for this project
      if (projectId) {
        try {
          // Get scenarios for this project
          const { data: scenarios, error } = await supabase
            .from('scenarios')
            .select('id')
            .eq('project_id', projectId)
            .order('name', { ascending: true })
            .limit(1);

          if (!error && scenarios && scenarios.length > 0) {
            // Redirect to the first scenario
            router.push(`/scenarios/protocol?id=${scenarios[0].id}`);
          } else {
            // No scenarios found, redirect to create a new one
            router.push(`/scenarios/protocol?project=${projectId}`);
          }
        } catch (error) {
          console.error('Error fetching scenarios:', error);
          router.push(`/scenarios/protocol?project=${projectId}`);
        }
      } else {
        // No project ID, try to get the user's company and fetch any project/scenario
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            router.push('/auth/login');
            return;
          }

          // Get user's company
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('company_id')
            .eq('user_id', session.user.id)
            .single();

          if (userError) {
            router.push('/dashboard');
            return;
          }

          // Get any project for this company
          const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('company_id', userData.company_id)
            .order('name', { ascending: true })
            .limit(1);

          if (!projectError && projects && projects.length > 0) {
            // Get any scenario for this project
            const { data: scenarios, error: scenarioError } = await supabase
              .from('scenarios')
              .select('id')
              .eq('project_id', projects[0].id)
              .order('name', { ascending: true })
              .limit(1);

            if (!scenarioError && scenarios && scenarios.length > 0) {
              // Redirect to the first scenario
              router.push(`/scenarios/protocol?id=${scenarios[0].id}`);
            } else {
              // No scenarios found, redirect to create a new one
              router.push(`/scenarios/protocol?project=${projects[0].id}`);
            }
          } else {
            // No projects found, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          router.push('/dashboard');
        }
      }
    };

    fetchData();
  }, [router, scenarioId, projectId]);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Loading scenarios...</p>
    </div>
  );
} 