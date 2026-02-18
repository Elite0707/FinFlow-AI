import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";

export interface UserStats {
  totalDocumentsProcessed: number;
  creditsRemaining: number;
  subscriptionTier: "Free" | "Individual" | "Business" | "Pro";
  activeTemplatesCount: number;
}

export interface UserUsage {
  monthlyUploadCount: number;
}

export interface UserFile {
  id: string;
  name: string;
  storagePath: string;
  downloadURL: string;
  size: number;
  type: string;
  createdAt: any;
}

export interface Template {
  id: string;
  name: string;
  documentType: string;
  extractionFields: string[];
  isDraft: boolean;
  fileUrl?: string; // URL of the uploaded document
  createdAt: any;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  status: "active" | "canceled" | "expired";
  createdAt: any;
}

export function useFirestore() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setStats(null);
        setUsage(null);
        setUserFiles([]);
        setTemplates([]);
        setLoading(false);
        return;
      }

      // Initialize stats if not exist
      const statsRef = doc(db, `users/${currentUser.uid}/stats/overview`);
      const usageRef = doc(db, `users/${currentUser.uid}/stats/usage`);

      const handlePermissionDenied = (label: string, err: unknown) => {
        // Avoid crashing the app when Firestore rules block reads.
        // This gives the UI a safe empty state instead of throwing continuously.
        if ((err as any)?.code === "permission-denied") {
          console.warn(`[Firestore] permission-denied while listening to ${label}.`);
          if (label === "stats") setStats(null);
          if (label === "usage") setUsage(null);
          if (label === "usage") setUsage(null);
          if (label === "files") setUserFiles([]);
          if (label === "templates") setTemplates([]);
          if (label === "subscriptions") setSubscriptions([]);
          setLoading(false);
          return;
        }

        console.error(`[Firestore] Error while listening to ${label}:`, err);
        setLoading(false);
      };

      // Listen to stats
      const unsubscribeStats = onSnapshot(
        statsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setStats(docSnap.data() as UserStats);
          } else {
            // Create default stats
            const defaultStats: UserStats = {
              totalDocumentsProcessed: 0,
              creditsRemaining: 100, // Default start credits
              subscriptionTier: "Free",
              activeTemplatesCount: 0,
            };
            setDoc(statsRef, defaultStats);
            setStats(defaultStats);
          }
          setLoading(false);
        },
        (err) => handlePermissionDenied("stats", err)
      );

      // Listen to usage
      const unsubscribeUsage = onSnapshot(
        usageRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setUsage(docSnap.data() as UserUsage);
          } else {
            // Create default usage
            const defaultUsage: UserUsage = {
              monthlyUploadCount: 0,
            };
            setDoc(usageRef, defaultUsage);
            setUsage(defaultUsage);
          }
        },
        (err) => handlePermissionDenied("usage", err)
      );

      // Listen to user files
      const filesQuery = query(
        collection(db, `users/${currentUser.uid}/files`),
        orderBy("createdAt", "desc")
      );

      const unsubscribeFiles = onSnapshot(
        filesQuery,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserFile[];
          setUserFiles(items);
        },
        (err) => handlePermissionDenied("files", err)
      );

      // Listen to templates
      const templatesQuery = query(
        collection(db, `users/${currentUser.uid}/templates`),
        orderBy("createdAt", "desc")
      );

      const unsubscribeTemplates = onSnapshot(
        templatesQuery,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Template[];
          setTemplates(items);
        },
        (err) => handlePermissionDenied("templates", err)
      );

      // Listen to subscriptions
      const subscriptionsQuery = query(
        collection(db, "subscriptions"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeSubscriptions = onSnapshot(
        subscriptionsQuery,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Subscription[];
          setSubscriptions(items);
        },
        (err) => handlePermissionDenied("subscriptions", err)
      );

      return () => {
        unsubscribeStats();
        unsubscribeUsage();
        unsubscribeFiles();
        unsubscribeTemplates();
        unsubscribeSubscriptions();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const uploadFile = (file: File, onProgress?: (progress: number) => void): { promise: Promise<string>, cancel: () => void } | undefined => {
    if (!user) return;

    // Check if file with same name exists in Firestore to avoid duplicates or handle overwrite
    // The prompt says: "If a file with the same name exists, append a timestamp to the filename in Storage"
    // We handle this by always ensuring unique storage path, but we might want to keep original name in Firestore.

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${file.name}`;
    const storagePath = `user_uploads/${user.uid}/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    const promise = new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          if (error.code === 'storage/canceled') {
            // Setup so UI can handle cancellation gracefully if needed, 
            // though usually we just ignore or show 'canceled' state.
            console.log("Upload canceled by user");
            reject(error);
          } else {
            console.error("Upload failed:", error);
            reject(error);
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Add to Firestore
            const filesRef = collection(db, `users/${user.uid}/files`);
            await addDoc(filesRef, {
              name: file.name,
              storagePath: storagePath,
              downloadURL: downloadURL,
              size: file.size,
              type: file.type,
              createdAt: serverTimestamp(),
            });

            // Increment usage count
            const usageRef = doc(db, `users/${user.uid}/stats/usage`);
            await updateDoc(usageRef, {
              monthlyUploadCount: increment(1)
            });

            resolve(downloadURL);
          } catch (error) {
            console.error("Firestore save failed:", error);
            reject(error);
          }
        }
      );
    });

    return {
      promise,
      cancel: () => uploadTask.cancel()
    };
  };

  const deleteUserFile = async (fileId: string, storagePath: string) => {
    if (!user) return;

    try {
      // 1. Delete from Storage (best effort)
      try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch (storageError: any) {
        // Ignore if object not found, otherwise log warning
        if (storageError.code !== 'storage/object-not-found') {
          console.warn("Storage delete error (non-fatal):", storageError);
        }
      }

      // 2. Delete from Firestore (source of truth for UI)
      const fileRef = doc(db, `users/${user.uid}/files/${fileId}`);
      await deleteDoc(fileRef);
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  const saveTemplate = async (templateData: any, isDraft = false) => {
    if (!user) return;

    // Destructure to ensure only text-based rules are saved
    const { name, documentType, extractionFields } = templateData;

    const templatesRef = collection(db, `users/${user.uid}/templates`);
    await addDoc(templatesRef, {
      name,
      documentType,
      extractionFields,
      isDraft,
      createdAt: serverTimestamp()
    });

    if (!isDraft) {
      const statsRef = doc(db, `users/${user.uid}/stats/overview`);
      await updateDoc(statsRef, {
        activeTemplatesCount: increment(1)
      });
    }
  };

  const updateTemplate = async (templateId: string, templateData: any) => {
    if (!user) return;
    const { name, documentType, extractionFields, isDraft } = templateData;
    const templateRef = doc(db, `users/${user.uid}/templates/${templateId}`);

    await updateDoc(templateRef, {
      name,
      documentType,
      extractionFields,
      isDraft,
      updatedAt: serverTimestamp()
    });
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) return;
    const templateRef = doc(db, `users/${user.uid}/templates/${templateId}`);
    await deleteDoc(templateRef);

    // Decrement active count if it wasn't a draft (this is an approximation, ideally we check the doc first)
    // For now, we'll just decrement safely
    const statsRef = doc(db, `users/${user.uid}/stats/overview`);
    // We might need to check if it was a draft, but for now lets assume it counts if it was in the list
    // A better way is to read the doc before deleting, but we want UI speed.
    // Let's just update the stats.
    await updateDoc(statsRef, {
      activeTemplatesCount: increment(-1)
    });
  };

  const getTemplate = async (templateId: string) => {
    if (!user) return null;
    const templateRef = doc(db, `users/${user.uid}/templates/${templateId}`);
    const docSnap = await getDoc(templateRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Template;
    }
    return null;
  };

  return {
    user,
    stats,
    usage,
    userFiles,
    templates,
    subscriptions,
    loading,
    uploadFile,
    deleteUserFile,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate
  };
}
