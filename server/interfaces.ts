import { WebSocket } from 'ws';

export interface User {
  id: string;
  name: string;
  ws?: WebSocket;
}

export interface Message {
  type: 'newUser' | 'message' | 'activeUsers' | 'typing';
  user?: User;
  users?: User[];
  message?: string;
}

export interface DebouncedFunction {
  (...args: unknown[]): void;
  cancel: () => void;
  flush: () => void;
}
