import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error) {
    console.warn("Firestore connection check:", error);
  }
}
testConnection();

// Generic helper to subscribe to a Firestore collection
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  defaultItems?: T[]
) {
  const colRef = collection(db, collectionName);
  let seeded = false;

  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      if (defaultItems && defaultItems.length > 0 && !seeded) {
        seeded = true;
        // Seed default items if collection is empty
        defaultItems.forEach((item) => {
          if (item && item.id) {
            setDoc(doc(db, collectionName, item.id), item, { merge: true }).catch((err) =>
              console.error(`Error seeding ${collectionName}:`, err)
            );
          }
        });
        onData(defaultItems);
      }
    } else {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      onData(items);
    }
  }, (error) => {
    console.error(`Firestore subscribe error for ${collectionName}:`, error);
  });
}

// Helper to save or update an item in Firestore
export async function saveDocItem<T extends { id: string }>(
  collectionName: string,
  item: T
) {
  try {
    await setDoc(doc(db, collectionName, item.id), item, { merge: true });
  } catch (err) {
    console.error(`Error saving doc to ${collectionName}:`, err);
  }
}

// Helper to save entire list (bulk save/sync)
export async function syncCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  try {
    for (const item of items) {
      await setDoc(doc(db, collectionName, item.id), item, { merge: true });
    }
  } catch (err) {
    console.error(`Error syncing collection ${collectionName}:`, err);
  }
}

// Helper to delete an item from Firestore
export async function deleteDocItem(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Error deleting doc from ${collectionName}:`, err);
  }
}
