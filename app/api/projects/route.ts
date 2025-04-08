import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/projects - Get projects
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
    
    // Query projects for the company
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', userData.company_id)
      .order('name', { ascending: true });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
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
    const { name, description, start_date } = body;
    
    if (!name || !start_date) {
      return NextResponse.json({ error: 'Name and start date are required' }, { status: 400 });
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
    
    // Create the project
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { 
          name, 
          description, 
          start_date,
          company_id: userData.company_id,
          created_by: session.user.id
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