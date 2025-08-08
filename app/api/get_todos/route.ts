import { NextResponse } from 'next/server';
import type { Todo } from '../../../generated/mutables';

// In-memory storage (in real app, this would be your database)
let todos: Todo[] = [
  {"title":"Learn Next.js","done":false,"id":1,"estimated_time":"2h","created_at":"2025-08-08 06:36:54"},
  {"title":"Build todo app","done":false,"id":2,"estimated_time":"4h","created_at":"2025-08-08 06:36:54"},
  {"title":"Deploy to production","done":true,"id":3,"estimated_time":"1h","created_at":"2025-08-08 06:36:54"}
];

export async function GET() {
  const syncMessage = {
    type: "mutable-state-sender",
    key: "Todos",
    data: todos
  };

  const response = NextResponse.json({ 
    message: "todos fetched",
    count: todos.length 
  });
  
  response.headers.set('sync', JSON.stringify(syncMessage));
  
  return response;
}
