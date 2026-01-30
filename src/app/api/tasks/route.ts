import { NextRequest, NextResponse } from 'next/server'
import { supabase, Task } from '@/lib/supabase'

// GET /api/tasks - List tasks with optional filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const since = searchParams.get('since') // ISO timestamp for polling new tasks
  const overnight = searchParams.get('overnight') // Filter for overnight tasks
  
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (priority) {
    query = query.eq('priority', priority)
  }
  
  if (since) {
    query = query.gt('created_at', since)
  }
  
  if (overnight !== null) {
    query = query.eq('overnight', overnight === 'true')
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ tasks: data })
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newTask = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      due_date: body.due_date || null,
      assigned_to: body.assigned_to || 'lumen',
      created_by: body.created_by || 'ben',
      notes: body.notes || null,
      overnight: body.overnight || false, // Autonomous overnight work - no pings
    }
    
    if (!newTask.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ task: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
