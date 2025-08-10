"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useKanbanStore, type Task } from "../generated/mutables"
import {
  api_kanban_get_board,
  api_kanban_create_task,
  api_kanban_move_task,
  api_kanban_add_comment,
  api_kanban_update_task, // Import new update task API
  api_kanban_delete_task, // Import new delete task API
} from "../generated/routes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  RefreshCw,
  User,
  Clock,
  CalendarDays,
  GripVertical,
  MessageSquare,
  Send,
  Loader2,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { ConnectionStatus } from "../components/connection-status"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function KanbanBoardPage() {
  const { state: kanbanBoard } = useKanbanStore()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskAuthor, setNewTaskAuthor] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newCommentBody, setNewCommentBody] = useState("")
  const [newCommentAuthor, setNewCommentAuthor] = useState(kanbanBoard.users[0] || "")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isPostingComment, setIsPostingComment] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

  useEffect(() => {
    api_kanban_get_board()
  }, [])

  // Reset editedTask and isEditingTask when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setEditedTask({ ...selectedTask })
      setIsEditingTask(false)
    }
  }, [selectedTask])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await api_kanban_get_board()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCreateTask = (list: string) => async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() && newTaskAuthor.trim() && newTaskDeadline.trim()) {
      setIsAddingTask(true)
      await api_kanban_create_task(newTaskTitle.trim(), list, newTaskAuthor.trim(), newTaskDeadline.trim())
      setNewTaskTitle("")
      setNewTaskAuthor("")
      setNewTaskDeadline("")
      setIsAddingTask(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTask && newCommentBody.trim() && newCommentAuthor.trim()) {
      setIsPostingComment(true)
      await api_kanban_add_comment(selectedTask.id, newCommentAuthor.trim(), newCommentBody.trim())
      setNewCommentBody("")
      setIsPostingComment(false)
    }
  }

  const handleSaveTaskEdit = async () => {
    if (editedTask) {
      setIsEditingTask(false) // Disable editing mode immediately
      await api_kanban_update_task(editedTask.id, editedTask.title, editedTask.author, editedTask.deadline)
      setSelectedTask(null) // Close modal after saving
    }
  }

  const handleDeleteTask = async () => {
    if (selectedTask) {
      setIsDeletingTask(true)
      await api_kanban_delete_task(selectedTask.id)
      setSelectedTask(null) // Close modal after deleting
      setIsDeletingTask(false)
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

  const handleDrop = async (e: React.DragEvent, targetList: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.list !== targetList) {
      await api_kanban_move_task(draggedTask.id, targetList)
    }
    setDraggedTask(null)
  }

  const getTasksForList = (listName: string) => {
    if (!kanbanBoard || !Array.isArray(kanbanBoard.tasks)) {
      return []
    }
    return kanbanBoard.tasks.filter((task) => task.list === listName)
  }

  const getCommentsForTask = (taskId: number) => {
    if (!kanbanBoard || !Array.isArray(kanbanBoard.comments)) {
      return []
    }
    return kanbanBoard.comments.filter((comment) => comment.task_id === taskId)
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Kanban Board
          <Display_data />
        </h1>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Board
        </Button>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(kanbanBoard.lists || []).map((listName) => (
          <Card
            key={listName}
            className="flex flex-col bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-md"
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
                {getTasksForList(listName).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-lg mb-2">No tasks here!</p>
                    <p className="text-sm">Drag tasks here or add a new one below.</p>
                  </div>
                ) : (
                  getTasksForList(listName).map((task) => (
                    <Card
                      key={task.id}
                      className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => setSelectedTask(task)} // Open modal on click
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
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {getCommentsForTask(task.id).length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Add Task Form */}
              <form
                onSubmit={handleCreateTask(listName)}
                className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div>
                  <Label htmlFor={`newTaskTitle-${listName}`} className="text-sm">
                    Task Title
                  </Label>
                  <Input
                    id={`newTaskTitle-${listName}`}
                    type="text"
                    placeholder="Enter task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`newTaskAuthor-${listName}`} className="text-sm">
                    Author
                  </Label>
                  <Input
                    id={`newTaskAuthor-${listName}`}
                    type="text"
                    placeholder="Enter author name"
                    value={newTaskAuthor}
                    onChange={(e) => setNewTaskAuthor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`newTaskDeadline-${listName}`} className="text-sm">
                    Deadline
                  </Label>
                  <Input
                    id={`newTaskDeadline-${listName}`}
                    type="date"
                    placeholder="Select deadline"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isAddingTask}>
                  {isAddingTask ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  {isAddingTask ? "Adding Task..." : "Add Task"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Details Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            {isEditingTask ? (
              <Input
                value={editedTask?.title || ""}
                onChange={(e) => setEditedTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="text-lg font-semibold"
              />
            ) : (
              <DialogTitle>{selectedTask?.title}</DialogTitle>
            )}
            <DialogDescription>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {isEditingTask ? (
                    <Input
                      value={editedTask?.author || ""}
                      onChange={(e) => setEditedTask((prev) => (prev ? { ...prev, author: e.target.value } : null))}
                      className="h-6 text-sm"
                    />
                  ) : (
                    selectedTask?.author
                  )}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedTask?.time ? new Date(selectedTask.time).toLocaleDateString() : "N/A"}
                </Badge>
                {selectedTask?.deadline && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {isEditingTask ? (
                      <Input
                        type="date"
                        value={editedTask?.deadline || ""}
                        onChange={(e) => setEditedTask((prev) => (prev ? { ...prev, deadline: e.target.value } : null))}
                        className="h-6 text-sm"
                      />
                    ) : (
                      new Date(selectedTask.deadline).toLocaleDateString()
                    )}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-semibold mb-2">
              Comments ({selectedTask ? getCommentsForTask(selectedTask.id).length : 0})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {selectedTask && getCommentsForTask(selectedTask.id).length === 0 ? (
                <p className="text-muted-foreground text-sm">No comments yet.</p>
              ) : (
                selectedTask &&
                getCommentsForTask(selectedTask.id).map((comment) => (
                  <div key={comment.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-muted-foreground text-sm mt-1">{comment.body}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 space-y-2">
              <div>
                <Label htmlFor="newCommentBody" className="text-sm">
                  Comment
                </Label>
                <Textarea
                  id="newCommentBody"
                  placeholder="Add a new comment..."
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newCommentAuthor" className="text-sm">
                  Your Name
                </Label>
                <Select
                  value={newCommentAuthor}
                  onValueChange={setNewCommentAuthor}
                  required
                  disabled={(kanbanBoard.users || []).length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {(kanbanBoard.users || []).map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isPostingComment}>
                {isPostingComment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isPostingComment ? "Posting Comment..." : "Post Comment"}
              </Button>
            </form>
          </div>
          <DialogFooter className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="destructive" onClick={handleDeleteTask} disabled={isDeletingTask}>
              {isDeletingTask ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {isDeletingTask ? "Deleting..." : "Delete Task"}
            </Button>
            <div className="flex gap-2">
              {isEditingTask ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditingTask(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTaskEdit}>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingTask(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              )}
              
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




function Display_data() {
  const { state: kanbanBoard } = useKanbanStore()
  return (
    <p className="text-xs text-muted-foreground">
      {JSON.stringify(kanbanBoard)}
    </p>
  )
}