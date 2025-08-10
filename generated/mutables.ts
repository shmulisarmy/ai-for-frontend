import { create } from "zustand"

export type Person = {
  name: string
  age: number
  email: string
}

export const usePersonsStore = create<{ state: Person[] }>((set) => ({
  state: [
    { name: "shmuli", age: 21, email: "shmuli@shmuli.com" },
    { name: "berel", age: 25, email: "berel@shmuli.com" },
  ],
}))

if (typeof window !== "undefined") {
  ;(window as any).Persons = usePersonsStore
}

export type Kanban = {
  lists: string[]
  tasks: Task[]
  comments: Comment[]
  users: string[]
}

export type Task = {
  title: string
  list: string
  author: string
  time: string
  deadline: string
  id: number
}

export type Comment = {
  id: number
  body: string
  author: string
  task_id: number
}

export const useKanbanStore = create<{ state: Kanban }>((set) => ({
  state: {
    lists: ["To Do", "In Progress", "Done"],
    tasks: [
      {
        title: "Task 1",
        list: "To Do",
        author: "Shmuli",
        time: "2025-08-09 21:13:09",
        deadline: "2025-08-09 21:13:09",
        id: 1,
      },
      {
        title: "Task 2",
        list: "In Progress",
        author: "Shmuli",
        time: "2025-08-09 21:13:09",
        deadline: "2025-08-09 21:13:09",
        id: 2,
      },
      {
        title: "Task 3",
        list: "Done",
        author: "yosef",
        time: "2025-08-09 21:13:09",
        deadline: "2025-08-09 21:13:09",
        id: 3,
      },
    ],
    comments: [
      { id: 1, body: "Comment 1", author: "Shmuli", task_id: 1 },
      { id: 2, body: "Comment 2", author: "yosef", task_id: 3 },
    ],
    users: ["Shmuli", "yosef"],
  },
}))

if (typeof window !== "undefined") {
  ;(window as any).Kanban = useKanbanStore
}
