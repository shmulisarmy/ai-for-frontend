"use client"

import { useEffect, useState } from "react"
import { useTodosStore } from "../../generated/mutables"
import { add_todo, delete_todo, get_todos } from "../../generated/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, Clock } from 'lucide-react'

export default function TodosPage() {
  const { state: todos } = useTodosStore()
  const [newTodo, setNewTodo] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

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
    // Add a small delay for UX
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const completedCount = todos.filter(todo => todo.done).length
  const totalCount = todos.length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Todo List</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newTodo.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg mb-2">No todos yet!</p>
                <p className="text-sm">Add your first todo above to get started.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className={`transition-all ${todo.done ? 'opacity-60' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={todo.done}
                      className="mt-1"
                      // Note: In your system, you'd probably have an update_todo function
                      // For now, this is just visual since we don't have that route
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${todo.done ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </p>
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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => delete_todo(todo.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
