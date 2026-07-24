import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export function useLocalStorage<T>(key: string, initialValue: T) {
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

  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const docRef = doc(db, 'app_state', key);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().value as T;
        const currentLocal = window.localStorage.getItem(key);
        if (JSON.stringify(data) !== currentLocal) {
          isRemoteUpdate.current = true;
          setStoredValue(data);
          window.localStorage.setItem(key, JSON.stringify(data));
        }
      }
    });
    return () => unsubscribe();
  }, [key]);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      const docRef = doc(db, 'app_state', key);
      setDoc(docRef, { value: storedValue }, { merge: true }).catch(err => {
        console.error("Firestore sync error:", err);
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
