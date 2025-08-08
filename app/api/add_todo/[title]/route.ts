import { NextResponse } from 'next/server';
import type { Todo } from '../../../../generated/mutables';

// In-memory storage (same reference as get_todos)
let todos: Todo[] = [
  {"title":"Learn Next.js","done":false,"id":1,"estimated_time":"2h","created_at":"2025-08-08 06:36:54"},
  {"title":"Build todo app","done":false,"id":2,"estimated_time":"4h","created_at":"2025-08-08 06:36:54"},
  {"title":"Deploy to production","done":true,"id":3,"estimated_time":"1h","created_at":"2025-08-08 06:36:54"}
];

function createTodo(title: string): Todo {
  return {
    title,
    done: false,
    id: Math.max(...todos.map(t => t.id), 0) + 1,
    estimated_time: "",
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
}

export async function POST(
  request: Request,
  { params }: { params: { title: string } }
) {
  const title = decodeURIComponent(params.title);
  const newTodo = createTodo(title);
  
  todos.push(newTodo);

  const syncMessage = {
    type: "mutable-append",
    key: "Todos",
    path: "",
    new_data: newTodo
  };

  const response = NextResponse.json({ 
    message: "todo added",
    todo: newTodo 
  });
  
  response.headers.set('sync', JSON.stringify(syncMessage));
  
  return response;
}
