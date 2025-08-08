import { handle_server_sync } from "../apiglue/zustand_sync";

const API_BASE = process.env.NODE_ENV === 'production' ? '' : '';

export function get_todos() {
  fetch(`${API_BASE}/api/get_todos`, { credentials: 'include' })
    .then(response => {
      const syncHeader = response.headers.get("sync");
      if (syncHeader) {
        handle_server_sync(JSON.parse(syncHeader));
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

export function add_todo(title: string) {
  fetch(`${API_BASE}/api/add_todo/${encodeURIComponent(title)}`, { 
    credentials: 'include',
    method: 'POST'
  })
    .then(response => {
      const syncHeader = response.headers.get("sync");
      if (syncHeader) {
        handle_server_sync(JSON.parse(syncHeader));
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

export function delete_todo(id: number) {
  fetch(`${API_BASE}/api/delete_todo/${id}`, { 
    credentials: 'include',
    method: 'DELETE'
  })
    .then(response => {
      const syncHeader = response.headers.get("sync");
      if (syncHeader) {
        handle_server_sync(JSON.parse(syncHeader));
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

export function update_todo(id: number, updates: Partial<{title: string, done: boolean, estimated_time: string}>) {
  fetch(`${API_BASE}/api/update_todo/${id}`, { 
    credentials: 'include',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  })
    .then(response => {
      const syncHeader = response.headers.get("sync");
      if (syncHeader) {
        handle_server_sync(JSON.parse(syncHeader));
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}
