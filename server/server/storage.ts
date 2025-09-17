import { randomUUID } from "crypto";

// Interface for future database storage if needed
export interface IStorage {
  // Currently using in-memory storage for downloads
  // Can be extended for user sessions, download history, etc.
}

export class MemStorage implements IStorage {
  constructor() {
    // In-memory storage implementation
  }
}

export const storage = new MemStorage();
