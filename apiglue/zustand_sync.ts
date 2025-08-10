import { create } from "zustand"

// --- Zustand store for notifications
export const notificationMessages = create<{
  messages: string[]
  last_show_time: number
  viewing_as_last_index: number
  addMessage: (message: string) => void
}>((set, get) => ({
  messages: [],
  last_show_time: 0,
  viewing_as_last_index: 0,
  addMessage: (message: string) => {
    const { messages } = get()
    const newMessages = [...messages, message]
    set({
      messages: newMessages,
      viewing_as_last_index: newMessages.length - 1,
    })
  },
}))

// Helper function for immutable array item deletion by ID
function deleteArrayItemImmutable(obj: any, pathParts: string[], idToDelete: number) {
  if (!obj || pathParts.length === 0) {
    return obj
  }

  const [head, ...rest] = pathParts

  if (rest.length === 0) {
    // We are at the array property
    if (Array.isArray(obj[head])) {
      return {
        ...obj,
        [head]: obj[head].filter((item: any) => item.id !== idToDelete),
      }
    } else {
      // If it's not an array at the expected path, return original object
      console.warn(`deleteArrayItemImmutable: Expected array at path part "${head}", but found non-array.`)
      return obj
    }
  }

  // Recursively update nested object
  return {
    ...obj,
    [head]: deleteArrayItemImmutable(obj[head], rest, idToDelete),
  }
}

// --- Handle mutable updates from server
export function handle_server_sync(j: any) {
  console.log("in handle_server_sync", j)

  switch (j.type) {
    case "populate-slot": {
      const slotElement = document.getElementById("slot")
      if (slotElement) {
        slotElement.innerHTML = j.html
      }
      break
    }

    case "mutable-state-sender": {
      if (typeof window !== "undefined") {
        const store = (window as any)[j.key]
        if (store) {
          store.setState((prev: any) => {
            return { ...prev, state: j.data }
          })
        }
      }
      break
    }

    case "mutable-append": {
      console.log("handling mutable-append", j)
      if (typeof window !== "undefined") {
        const store = (window as any)[j.key]
        if (store) {
          store.setState((prev: any) => {
            if (j.path === "") {
              return { state: [...prev.state, j.new_data] }
            }

            const split_path = j.path.split(".")
            const last = split_path.pop()
            const target = { ...prev } as any
            let cursor = target.state

            for (const part of split_path) {
              if (!(part in cursor)) cursor[part] = {}
              else cursor[part] = { ...cursor[part] }
              cursor = cursor[part]
            }

            const existing = cursor[last!] ?? []
            cursor[last!] = [...existing, j.new_data]
            return target
          })
        }
      }
      break
    }

    case "mutable-update": {
      console.log("handling mutable-update", j)
      if (typeof window !== "undefined") {
        const store = (window as any)[j.key]
        if (store) {
          store.setState((prev: any) => {
            if (j.path === "") {
              return { state: j.new_data }
            }

            const split_path = j.path.split(".")
            const last = split_path.pop()
            const target = { ...prev } as any
            let cursor = target.state

            for (const part of split_path) {
              if (!(part in cursor)) cursor[part] = {}
              else cursor[part] = { ...cursor[part] }
              cursor = cursor[part]
            }

            cursor[last!] = j.new_data
            return target
          })
        }
      }
      break
    }

    case "mutable-delete": {
      console.log("handling mutable-delete", j)
      if (typeof window !== "undefined") {
        const store = (window as any)[j.key]
        if (store) {
          store.setState((prev: any) => {
            if (j.path === "") {
              // If path is empty, clear the entire state (or handle as per backend spec)
              return { state: {} }
            }

            const pathParts = j.path.split(".")
            const lastPart = pathParts[pathParts.length - 1]
            const idToDelete = Number.parseInt(lastPart)

            if (!isNaN(idToDelete)) {
              // This is an array item deletion by ID (e.g., "tasks.1" or "comments.5")
              const arrayPath = pathParts.slice(0, -1) // Path to the array itself (e.g., ['tasks'] or ['comments'])
              const newState = deleteArrayItemImmutable(prev.state, arrayPath, idToDelete)
              return { ...prev, state: newState }
            } else {
              // This is a property deletion from an object (e.g., "someProperty")
              const newState = { ...prev }
              let cursor = newState.state
              const propToDelete = pathParts.pop() // Get the property name to delete

              for (const part of pathParts) {
                // Traverse to the parent object
                if (!(part in cursor)) return prev // Path doesn't exist, return original state
                cursor[part] = { ...cursor[part] } // Ensure immutability
                cursor = cursor[part]
              }
              if (propToDelete && propToDelete in cursor) {
                delete cursor[propToDelete]
              }
              return newState
            }
          })
        }
      }
      break
    }
  }
}
