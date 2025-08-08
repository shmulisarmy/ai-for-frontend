import { create } from 'zustand'

export type Todo = {
  title: string;
  done: boolean;
  id: number;
  estimated_time: string;
  created_at: string;
}

export type Person = {
  name: string;
  age: number;
  email: string;
}

export const usePersonsStore = create<{
  state: Person[]
}>((set) => ({
  state: [
    {"name":"shmuli","age":21,"email":"shmuli@shmuli.com"},
    {"name":"berel","age":25,"email":"berel@shmuli.com"}
  ],
}))

if (typeof window !== 'undefined') {
  (window as any).Persons = usePersonsStore
}

export const useTodosStore = create<{
  state: Todo[]
}>((set) => ({
  state: [
    {"title":"todo 1","done":false,"id":1,"estimated_time":"","created_at":"2025-08-08 06:36:54"},
    {"title":"todo 2","done":false,"id":2,"estimated_time":"","created_at":"2025-08-08 06:36:54"}
  ],
}))

if (typeof window !== 'undefined') {
  (window as any).Todos = useTodosStore
}
