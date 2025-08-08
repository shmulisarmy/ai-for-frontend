import { NextResponse } from 'next/server';
import type { Todo } from '../../../../generated/mutables';

// In-memory storage (same reference as other routes)
let todos: Todo[] = [
  {"title":"Learn Next.js","done":false,"id":1,"estimated_time":"2h","created_at":"2025-08-08 06:36:54"},
  {"title":"Build todo app","done":false,"id":2,"estimated_time":"4h","created_at":"2025-08-08 06:36:54"},
  {"title":"Deploy to production","done":true,"id":3,"estimated_time":"1h","created_at":"2025-08-08 06:36:54"}
];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const updates = await request.json();
  
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  todos[todoIndex] = { ...todos[todoIndex], ...updates };

  const syncMessage = {
    type: "mutable-state-sender",
    key: "Todos",
    data: todos
  };

  const response = NextResponse.json({ 
    message: "todo updated",
    todo: todos[todoIndex]
  });
  
  response.headers.set('sync', JSON.stringify(syncMessage));
  
  return response;
}
