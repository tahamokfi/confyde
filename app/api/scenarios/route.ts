import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/scenarios - Get scenarios for a project
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's company ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('user_id', session.user.id)
      .single();
      
    if (userError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }
    
    // Query scenarios for the project or all scenarios for the company
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('company_id', userData.company_id);
      
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/scenarios - Create a new scenario
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      start_date, 
      project_id,
      sample_size = 0,
      inclusion_criteria = '',
      investigational_arm = '',
      control_arm = '',
      primary_end_point = '',
      secondary_end_point = '',
      exploratory_end_point = ''
    } = body;
    
    if (!name || !start_date || !project_id) {
      return NextResponse.json({ error: 'Name, start date, and project ID are required' }, { status: 400 });
    }
    
    // Get user's company ID and verify project belongs to company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('user_id', session.user.id)
      .single();
      
    if (userError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }
    
    // Verify project exists and belongs to user's company
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('company_id', userData.company_id)
      .single();
      
    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }
    
    // Create the scenario
    const { data, error } = await supabase
      .from('scenarios')
      .insert([
        { 
          name, 
          description, 
          start_date,
          project_id,
          company_id: userData.company_id,
          sample_size,
          inclusion_criteria,
          investigational_arm,
          control_arm,
          primary_end_point,
          secondary_end_point,
          exploratory_end_point
        }
      ])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/scenarios/:id - Update a scenario
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get('id');
  
  if (!scenarioId) {
    return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
  }
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Get user's company ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('user_id', session.user.id)
      .single();
      
    if (userError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }
    
    // Verify scenario exists and belongs to user's company
    const { data: scenarioData, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenarioId)
      .eq('company_id', userData.company_id)
      .single();
      
    if (scenarioError || !scenarioData) {
      return NextResponse.json({ error: 'Scenario not found or unauthorized' }, { status: 404 });
    }
    
    // Update the scenario
    const { data, error } = await supabase
      .from('scenarios')
      .update(body)
      .eq('id', scenarioId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 