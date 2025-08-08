"use client"

import { useEffect, useState } from "react"
import { useTodosStore } from "../generated/mutables"
import { add_todo, delete_todo, get_todos, update_todo } from "../generated/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, Clock, Edit2, Check, X } from 'lucide-react'

export default function TodosPage() {
  const { state: todos } = useTodosStore()
  const [newTodo, setNewTodo] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  useEffect(() => {
    get_todos()
  }, [])

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      add_todo(newTodo.trim())
      setNewTodo("")
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    get_todos()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleToggleDone = (id: number, done: boolean) => {
    update_todo(id, { done: !done })
  }

  const handleStartEdit = (id: number, title: string) => {
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      update_todo(editingId, { title: editingTitle.trim() })
      setEditingId(null)
      setEditingTitle("")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const completedCount = todos.filter(todo => todo.done).length
  const totalCount = todos.length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Todo Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {completedCount} of {totalCount} completed
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add Todo Form */}
      <Card className="mb-6 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="pt-6">
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 text-lg"
            />
            <Button type="submit" disabled={!newTodo.trim()} className="px-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl mb-2">No todos yet!</p>
                <p className="text-sm">Add your first todo above to get started.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card 
              key={todo.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                todo.done ? 'opacity-60 bg-gray-50' : 'hover:shadow-lg'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={() => handleToggleDone(todo.id, todo.done)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit()
                              if (e.key === 'Escape') handleCancelEdit()
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-lg ${
                              todo.done ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {todo.title}
                            </p>
                            {!todo.done && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(todo.id, todo.title)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(todo.created_at).toLocaleDateString()}
                            </span>
                            {todo.estimated_time && (
                              <Badge variant="secondary" className="text-xs">
                                {todo.estimated_time}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => delete_todo(todo.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {totalCount > 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
