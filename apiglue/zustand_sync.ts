import { create } from "zustand";

// --- Zustand store for notifications
export const notificationMessages = create<{
  messages: string[];
  last_show_time: number;
  viewing_as_last_index: number;
  addMessage: (message: string) => void;
}>((set, get) => ({
  messages: [],
  last_show_time: 0,
  viewing_as_last_index: 0,
  addMessage: (message: string) => {
    const { messages } = get();
    const newMessages = [...messages, message];
    set({
      messages: newMessages,
      viewing_as_last_index: newMessages.length - 1,
    });
  },
}));

// --- Handle mutable updates from server
export function handle_server_sync(j: any) {
  console.log('in handle_server_sync', j);
  
  switch (j.type) {
    case 'populate-slot': {
      const slotElement = document.getElementById('slot');
      if (slotElement) {
        slotElement.innerHTML = j.html;
      }
      break;
    }
    
    case 'mutable-state-sender': {
      if (typeof window !== 'undefined') {
        const store = (window as any)[j.key];
        if (store) {
          store.setState((prev: any) => {
            return { ...prev, state: j.data };
          });
        }
      }
      break;
    }
    
    case 'mutable-append': {
      console.log('handling mutable-append', j);
      if (typeof window !== 'undefined') {
        const store = (window as any)[j.key];
        if (store) {
          store.setState((prev: any) => {
            if (j.path === '') {
              return { state: [...prev.state, j.new_data] };
            }
            
            const split_path = j.path.split('.');
            const last = split_path.pop();
            let target = { ...prev } as any;
            let cursor = target.state;
            
            for (const part of split_path) {
              if (!(part in cursor)) cursor[part] = {};
              else cursor[part] = { ...cursor[part] };
              cursor = cursor[part];
            }
            
            const existing = cursor[last!] ?? [];
            cursor[last!] = [...existing, j.new_data];
            return target;
          });
        }
      }
      break;
    }
    
    case 'mutable-update': {
      console.log('handling mutable-update', j);
      if (typeof window !== 'undefined') {
        const store = (window as any)[j.key];
        if (store) {
          store.setState((prev: any) => {
            if (j.path === '') {
              return { state: j.new_data };
            }
            
            const split_path = j.path.split('.');
            const last = split_path.pop();
            let target = { ...prev } as any;
            let cursor = target.state;
            
            for (const part of split_path) {
              if (!(part in cursor)) cursor[part] = {};
              else cursor[part] = { ...cursor[part] };
              cursor = cursor[part];
            }
            
            cursor[last!] = j.new_data;
            return target;
          });
        }
      }
      break;
    }
    
    case "mutable-delete": {
      console.log('handling mutable-delete', j);
      if (typeof window !== 'undefined') {
        const store = (window as any)[j.key];
        if (store) {
          store.setState((prev: any) => {
            if (j.path === '') {
              return { state: [] };
            }
            
            const split_path = j.path.split('.');
            const last = split_path.pop();
            let target = { ...prev } as any;
            let cursor = target.state;
            
            for (const part of split_path) {
              if (!(part in cursor)) cursor[part] = {};
              else cursor[part] = { ...cursor[part] };
              cursor = cursor[part];
            }
            
            // For array deletion by id
            if (Array.isArray(cursor) && last) {
              const id = parseInt(last);
              cursor = cursor.filter((item: any) => item.id !== id);
              return { state: cursor };
            }
            
            delete cursor[last!];
            return target;
          });
        }
      }
      break;
    }
  }
}
