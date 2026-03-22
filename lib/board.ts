import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export interface SavedEntry {
  id: number;
  nums: number[];
  mode: string;
  modeLabel: string;
  date: string;
}

export async function getBoard(pin: string): Promise<SavedEntry[]> {
  const docRef = doc(db, "boards", pin);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().saved || [];
  }
  return [];
}

export async function addToBoard(pin: string, entry: SavedEntry) {
  const docRef = doc(db, "boards", pin);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    await setDoc(docRef, { saved: [entry] });
  } else {
    await updateDoc(docRef, { saved: arrayUnion(entry) });
  }
}

export async function removeFromBoard(pin: string, entry: SavedEntry) {
  const docRef = doc(db, "boards", pin);
  await updateDoc(docRef, { saved: arrayRemove(entry) });
}
