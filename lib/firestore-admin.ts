import { getAdminDb } from "./firebase-admin";
import { LottoDraw } from "../types/lotto";

const COLLECTION_NAME = "draws";

export async function adminUpsertDraw(draw: LottoDraw): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION_NAME).doc(String(draw.drawNo));
  await docRef.set(draw as unknown as Record<string, unknown>, { merge: true });
}

export async function adminGetLatestDrawNo(): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .orderBy("drawNo", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return 0;
  return (snapshot.docs[0].data() as LottoDraw).drawNo;
}
