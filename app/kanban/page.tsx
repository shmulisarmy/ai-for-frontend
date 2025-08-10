"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useKanbanStore, type Task } from "../../generated/mutables"
import { api_kanban_get_board, api_kanban_create_task, api_kanban_move_task } from "../../generated/routes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, User, Clock, CalendarDays, GripVertical } from "lucide-react"
import { ConnectionStatus } from "../../components/connection-status"

export default function KanbanBoardPage() {
  const { state: kanbanBoard } = useKanbanStore()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskAuthor, setNewTaskAuthor] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  useEffect(() => {
    api_kanban_get_board()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    api_kanban_get_board()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCreateTask = (list: string) => (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() && newTaskAuthor.trim() && newTaskDeadline.trim()) {
      api_kanban_create_task(newTaskTitle.trim(), list, newTaskAuthor.trim(), newTaskDeadline.trim())
      setNewTaskTitle("")
      setNewTaskAuthor("")
      setNewTaskDeadline("")
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id.toString()) // Store task ID
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetList: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.list !== targetList) {
      api_kanban_move_task(draggedTask.id, targetList)
    }
    setDraggedTask(null)
  }

  const getTasksForList = (listName: string) => {
    return kanbanBoard.tasks.filter((task) => task.list === listName)
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Kanban Board
        </h1>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Board
        </Button>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kanbanBoard.lists.map((listName) => (
          <Card
            key={listName}
            className="flex flex-col bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, listName)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {listName} ({getTasksForList(listName).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {/* Task List */}
              <div className="space-y-3 min-h-[100px]">
                {" "}
                {/* Min height for drop target */}
                {getTasksForList(listName).map((task) => (
                  <Card
                    key={task.id}
                    className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-grab"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-base">{task.title}</h3>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.author}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(task.time).toLocaleDateString()}
                        </Badge>
                        {task.deadline && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(task.deadline).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Task Form */}
              <form
                onSubmit={handleCreateTask(listName)}
                className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <Input
                  type="text"
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Author"
                  value={newTaskAuthor}
                  onChange={(e) => setNewTaskAuthor(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  placeholder="Deadline"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
