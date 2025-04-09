import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Get user's company details without requiring auth
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }
    
    // Get company name
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', userData.company_id)
      .single();
      
    if (companyError) {
      return NextResponse.json({ error: 'Company data not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      companyId: userData.company_id,
      companyName: companyData.name
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 