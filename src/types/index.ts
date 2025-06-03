
import type { Timestamp } from 'firebase/firestore';

export interface Tag {
  id: string;
  category: string;
  name: string; // Changed from title to name
  content: string;
  order: number;
  userId: string;
  createdAt: Timestamp | Date; // Allow both for local creation and Firestore data
  // Add any other fields if necessary
}
