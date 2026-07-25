import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Read initial timestamp from localStorage
  const getLocalUpdatedAt = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const ts = window.localStorage.getItem(`${key}_updatedAt`);
      return ts ? parseInt(ts, 10) : 0;
    } catch {
      return 0;
    }
  };

  // Read initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const localUpdatedAtRef = useRef<number>(getLocalUpdatedAt());
  const isSelfUpdateRef = useRef<boolean>(false);
  const isFirstRender = useRef<boolean>(true);

  // Firestore -> Local Sync
  useEffect(() => {
    const docRef = doc(db, 'app_state', key);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const remoteValue = data.value as T;
          const remoteUpdatedAt = (data.updatedAt as number) || 0;

          // Only accept remote update if remote is strictly newer than local
          if (remoteUpdatedAt > localUpdatedAtRef.current) {
            isSelfUpdateRef.current = true;
            localUpdatedAtRef.current = remoteUpdatedAt;
            setStoredValue(remoteValue);
            try {
              window.localStorage.setItem(key, JSON.stringify(remoteValue));
              window.localStorage.setItem(`${key}_updatedAt`, String(remoteUpdatedAt));
            } catch (e) {
              console.warn(`Error saving remote update to localStorage for "${key}":`, e);
            }
          } else if (remoteUpdatedAt < localUpdatedAtRef.current && localUpdatedAtRef.current > 0) {
            // Local is newer than cloud -> push local data to cloud
            setDoc(docRef, { value: storedValue, updatedAt: localUpdatedAtRef.current }, { merge: true }).catch(() => {});
          }
        } else {
          // Cloud document does not exist yet. Upload local data to cloud
          const currentLocalTs = localUpdatedAtRef.current || Date.now();
          localUpdatedAtRef.current = currentLocalTs;
          try {
            window.localStorage.setItem(`${key}_updatedAt`, String(currentLocalTs));
          } catch {}
          setDoc(docRef, { value: storedValue, updatedAt: currentLocalTs }, { merge: true }).catch(() => {});
        }
      },
      (error) => {
        // Silently handle Firestore errors (e.g. offline, unauthenticated) without touching local state
        console.warn(`Firestore snapshot listener warning for "${key}":`, error.message);
      }
    );

    return () => unsubscribe();
  }, [key]);

  // Local -> Firestore Sync (only when storedValue changes via user action)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isSelfUpdateRef.current) {
      isSelfUpdateRef.current = false;
      return;
    }

    const now = Date.now();
    localUpdatedAtRef.current = now;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      window.localStorage.setItem(`${key}_updatedAt`, String(now));
      
      const docRef = doc(db, 'app_state', key);
      setDoc(docRef, { value: storedValue, updatedAt: now }, { merge: true }).catch(err => {
        console.warn(`Firestore setDoc sync warning for "${key}":`, err.message);
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
