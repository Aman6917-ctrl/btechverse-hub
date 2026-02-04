/**
 * Load branch resources from Firestore (same DB as old BTechVerse).
 * Collection: resources. Fields: title, branch, category, subject, creditName, fileURL, timestamp.
 */
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/integrations/firebase/config";
import type { BranchMaterialsData, MaterialItem } from "@/types/branch-materials";

/** Firestore category values (old app) */
const CATEGORY_HANDWRITTEN = "Handwritten-Notes";
const CATEGORY_PPT = "PPTs";
const CATEGORY_PAPERS = "Previous-Year-Papers";

/** Map our branch code (URL) to Firestore branch value */
const BRANCH_CODE_TO_FIRESTORE: Record<string, string> = {
  CSE: "CSE",
  "AI/ML": "AIML",
  DS: "Data Science",
  CS: "Cyber Security",
  ECE: "ECE",
  EE: "EE",
  ME: "ME",
  CE: "CE",
};

export interface FirestoreResource {
  id: string;
  title: string;
  branch: string;
  category: string;
  subject?: string;
  creditName?: string;
  fileURL: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  timestamp?: Timestamp | { toDate: () => Date };
}

function formatDate(t: FirestoreResource["timestamp"]): string | undefined {
  if (!t) return undefined;
  try {
    const d =
      typeof (t as { toDate?: () => Date }).toDate === "function"
        ? (t as { toDate: () => Date }).toDate()
        : new Date(t as unknown as string);
    return d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return undefined;
  }
}

function toMaterialItem(doc: FirestoreResource): MaterialItem {
  const title = doc.title || doc.fileName || "Resource";
  return {
    name: title.trim(),
    url: doc.fileURL,
    label: doc.subject,
    subject: doc.subject,
    credit: doc.creditName,
    date: formatDate(doc.timestamp),
  };
}

function groupByCategory(docs: FirestoreResource[]): BranchMaterialsData {
  const handwrittenNotes: MaterialItem[] = [];
  const ppt: MaterialItem[] = [];
  const prevYearPapers: MaterialItem[] = [];

  for (const doc of docs) {
    const item = toMaterialItem(doc);
    if (doc.category === CATEGORY_HANDWRITTEN) {
      handwrittenNotes.push(item);
    } else if (doc.category === CATEGORY_PPT) {
      ppt.push(item);
    } else if (doc.category === CATEGORY_PAPERS) {
      prevYearPapers.push(item);
    }
  }

  return {
    handwrittenNotes,
    ppt,
    prevYearPapers,
  };
}

/**
 * Load resources for a branch from Firestore (same as old BTechVerse).
 * Returns null if no data or error.
 */
export async function loadBranchResourcesFromFirestore(
  branchCode: string
): Promise<BranchMaterialsData | null> {
  try {
    const db = getFirestoreDb();
    const firestoreBranch =
      BRANCH_CODE_TO_FIRESTORE[branchCode] ?? branchCode;

    const resourcesRef = collection(db, "resources");
    const q = query(
      resourcesRef,
      where("branch", "==", firestoreBranch),
      limit(500)
    );

    const snapshot = await getDocs(q);
    const docs: FirestoreResource[] = [];

    snapshot.forEach((docSnap) => {
      docs.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreResource, "id">),
      });
    });

    if (docs.length === 0) return null;

    // Sort by timestamp descending (newest first), client-side to avoid composite index
    docs.sort((a, b) => {
      const getTime = (t: FirestoreResource["timestamp"]) => {
        if (!t) return 0;
        const d = typeof (t as { toDate?: () => Date }).toDate === "function"
          ? (t as { toDate: () => Date }).toDate()
          : new Date(t as unknown as string);
        return d.getTime();
      };
      return getTime(b.timestamp) - getTime(a.timestamp);
    });

    return groupByCategory(docs);
  } catch (err) {
    console.error("[Firestore] loadBranchResources error:", err);
    return null;
  }
}
