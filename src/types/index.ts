import type { Timestamp } from "firebase/firestore";

export interface Tag {
  id: string;
  category: string;
  name: string;
  content: string;
  order: number;
  // userId: string; // No longer user-specific for passcode auth
  createdAt: Timestamp | Date;
}
