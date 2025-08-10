import { handle_server_sync } from "../apiglue/zustand_sync"

const API_BASE = "https://scout-k9fna.sevalla.app"

export function api_ws() {
  fetch(`${API_BASE}/api/ws`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error with websocket endpoint:", error))
}

export function api_kanban_move_task(id: number, newList: string) {
  fetch(`${API_BASE}/api/kanban/move_task/${id}/${encodeURIComponent(newList)}`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error moving task:", error))
}

export function api_kanban_create_task(title: string, list: string, author: string, deadline: string) {
  fetch(
    `${API_BASE}/api/kanban/create_task/${encodeURIComponent(title)}/${encodeURIComponent(list)}/${encodeURIComponent(author)}/${encodeURIComponent(deadline)}`,
  )
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error creating task:", error))
}

export function api_kanban_get_board() {
  fetch(`${API_BASE}/api/kanban/get_board`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error getting kanban board:", error))
}

export function api_kanban_add_comment(taskId: number, author: string, body: string) {
  fetch(`${API_BASE}/api/kanban/add_comment/${taskId}/${encodeURIComponent(author)}/${encodeURIComponent(body)}`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error adding comment:", error))
}

// New: Update Task API
export function api_kanban_update_task(id: number, title: string, author: string, deadline: string) {
  fetch(
    `${API_BASE}/api/kanban/update_task/${id}/${encodeURIComponent(title)}/${encodeURIComponent(author)}/${encodeURIComponent(deadline)}`,
  )
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error updating task:", error))
}

// Corrected: Delete Task API now uses API_BASE
export function api_kanban_delete_task(id: number) {
  fetch(`${API_BASE}/api/kanban/delete_task/${id}`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error deleting task:", error))
}

// New: Delete Comment API
export function api_kanban_delete_comment(id: number) {
  fetch(`${API_BASE}/api/kanban/delete_comment/${id}`)
    .then((response) => {
      if (response.headers.get("sync")) {
        handle_server_sync(JSON.parse(response.headers.get("sync")))
      }
      return response.json()
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error deleting comment:", error))
}
