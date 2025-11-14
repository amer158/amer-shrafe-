/* Extremely small IndexedDB helper with migration */

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('tasks-db', 2);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      const old = e.oldVersion;

      if (old < 1) {
        db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      }
      if (old < 2) {
        // Migration: ensure each task has createdAt
        const store = req.transaction.objectStore('tasks');
        store.getAll().onsuccess = (ev) => {
          ev.target.result.forEach(t => {
            if (!t.createdAt) t.createdAt = new Date().toISOString();
            store.put(t);
          });
        };
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
