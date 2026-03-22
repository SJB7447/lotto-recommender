import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit } from "firebase/firestore";
import { LottoDraw } from "../types/lotto";

const COLLECTION_NAME = "draws";
const CACHE_KEY = "draws_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1시간

export async function getAllDraws(): Promise<LottoDraw[]> {
  // sessionStorage.getItem을 호출하기 전에 브라우저 환경인지 확인 (Next.js SSR 에러 방지)
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        // 데이터가 비어있는 상태로 잘못 캐싱된 경우(시딩 전 접속) 무시
        if (Date.now() - timestamp < CACHE_TTL && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        // 캐시 파싱 에러 시 무시하고 새로 가져오기
        console.warn("Failed to parse draws cache:", e);
      }
    }
  }

  // Firestore에서 전체 조회 (내림차순)
  const q = query(collection(db, COLLECTION_NAME), orderBy("drawNo", "desc"));
  const snapshot = await getDocs(q);
  
  const data = snapshot.docs.map(docSnap => docSnap.data() as LottoDraw);

  // 새로 가져온 데이터를 로컬에 캐싱
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  }

  return data;
}

export async function getLatestDraw(): Promise<LottoDraw | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("drawNo", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return snapshot.docs[0].data() as LottoDraw;
}

export async function getDrawByNo(drawNo: number): Promise<LottoDraw | null> {
  const docRef = doc(db, COLLECTION_NAME, String(drawNo));
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return snapshot.data() as LottoDraw;
  }
  
  return null;
}

export async function upsertDraw(draw: LottoDraw): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, String(draw.drawNo));
  // merge: true 옵션으로 문서가 없으면 생성, 있으면 병합 업데이트 수행
  await setDoc(docRef, draw, { merge: true });
}

export async function getLatestDrawNo(): Promise<number> {
  const latestDraw = await getLatestDraw();
  return latestDraw ? latestDraw.drawNo : 0;
}
