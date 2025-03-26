interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

const DB_NAME = 'historyWordsDB';
const STORE_NAME = 'words';
const DB_VERSION = 3; // Increment version to trigger schema update

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      // Create store with auto-incrementing id
      const store = db.createObjectStore(STORE_NAME, { autoIncrement: true });
      // Add index for battle field
      store.createIndex('battle', 'battle', { unique: false });
    };
  });
};

export const getWordsByBattle = async (battle: string): Promise<Word[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('battle');
    const request = index.getAll(battle);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const saveToIndexedDB = async (data: Word[]): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Process and add each item without the id field
    data.forEach(item => {
      const { id, ...wordWithoutId } = item;
      store.add(wordWithoutId);
    });

    transaction.oncomplete = () => {
      console.log(`Added ${data.length} words to database`);
      resolve();
    };
    transaction.onerror = (error) => {
      console.error('Transaction error:', error);
      reject(transaction.error);
    };
  });
};