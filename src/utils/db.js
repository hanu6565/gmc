// IndexedDB Utility to store large media assets (videos) locally in the browser.

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GeumMakchangDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets');
      }
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
};

export const saveAsset = async (key, blob) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('assets', 'readwrite');
    const store = transaction.objectStore('assets');
    const request = store.put(blob, key);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const getAsset = async (key) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('assets', 'readonly');
    const store = transaction.objectStore('assets');
    const request = store.get(key);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};
