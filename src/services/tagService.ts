
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebaseClient';
import type { Tag } from '@/types';

const TAGS_COLLECTION = 'tags';

const getCurrentUserId = (): string => {
  // In a real app, you'd get this from your auth state
  return "demoUser123";
};

export const getTags = async (): Promise<Tag[]> => {
  if (!db) {
    console.warn('Firestore is not initialized. Cannot fetch tags. Please check Firebase configuration in .env.local or deployment environment.');
    return [];
  }
  const userId = getCurrentUserId();
  const tagsCollection = collection(db, TAGS_COLLECTION);
  const q = query(tagsCollection, where('userId', '==', userId), orderBy('order', 'asc'));
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      
      let createdAtDate: Date;
      if (data.createdAt && typeof (data.createdAt as Timestamp).toDate === 'function') {
        createdAtDate = (data.createdAt as Timestamp).toDate();
      } else if (data.createdAt instanceof Date) {
        createdAtDate = data.createdAt;
      } else {
        // Fallback if createdAt is missing or not a recognized type
        createdAtDate = new Date(); 
      }

      const order = typeof data.order === 'number' ? data.order : 0;

      return {
        id: docSnap.id,
        userId: data.userId || userId, // Fallback for userId
        name: data.name || '未命名標籤', 
        content: data.content || '',
        order: order,
        category: data.category || '未分類',
        createdAt: createdAtDate,
      } as Tag;
    });
  } catch (error) {
    console.error("Error fetching tags from Firestore:", error);
    // Propagate the error so react-query can handle it
    throw error;
  }
};

export const addTag = async (tagData: Omit<Tag, 'id' | 'userId' | 'createdAt'>): Promise<Tag> => {
  if (!db) {
    console.error('Firestore is not initialized. Cannot add tag. Please check Firebase configuration.');
    throw new Error('Firestore is not initialized. Database operation failed.');
  }
  const userId = getCurrentUserId();
  const newTagWithMeta = {
    ...tagData, 
    userId,
    createdAt: Timestamp.now(),
    category: tagData.category || '未分類', // Ensure category has a default
    order: typeof tagData.order === 'number' ? tagData.order : 0, // Ensure order is a number
  };
  const docRef = await addDoc(collection(db, TAGS_COLLECTION), newTagWithMeta);
  return {
    id: docRef.id,
    ...newTagWithMeta,
    createdAt: newTagWithMeta.createdAt.toDate() // Convert Timestamp to Date for consistency
  };
};

export const updateTag = async (tagId: string, tagData: Partial<Omit<Tag, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  if (!db) {
    console.error('Firestore is not initialized. Cannot update tag. Please check Firebase configuration.');
    throw new Error('Firestore is not initialized. Database operation failed.');
  }
  const tagDocRef = doc(db, TAGS_COLLECTION, tagId);
  const updateData = { ...tagData };
  if (updateData.category === '') { // Handle empty string for category
    updateData.category = '未分類';
  }
  await updateDoc(tagDocRef, updateData);
};

export const deleteTag = async (tagId: string): Promise<void> => {
  if (!db) {
    console.error('Firestore is not initialized. Cannot delete tag. Please check Firebase configuration.');
    throw new Error('Firestore is not initialized. Database operation failed.');
  }
  const tagDocRef = doc(db, TAGS_COLLECTION, tagId);
  await deleteDoc(tagDocRef);
};

export const updateTagOrders = async (tagsToUpdate: { id: string; order: number }[]): Promise<void> => {
  if (!db) {
    console.error('Firestore is not initialized. Cannot update tag orders. Please check Firebase configuration.');
    throw new Error('Firestore is not initialized. Database operation failed.');
  }
  const batch = writeBatch(db);
  tagsToUpdate.forEach(tag => {
    const tagRef = doc(db, TAGS_COLLECTION, tag.id);
    batch.update(tagRef, { order: tag.order });
  });
  await batch.commit();
};
