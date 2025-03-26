interface Word {
  id?: number;
  battle: string;
  en: string;
  bn: string;
  sentence: string;
  bnSentence: string;
}

interface Battle {
  id?: number;
  name: string;
}

const DB_NAME = "historyWordsDB";
const WORDS_STORE = "words";
const BATTLES_STORE = "battles";
const DB_VERSION = 4; // Increment version for new store

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create or recreate words store
      if (db.objectStoreNames.contains(WORDS_STORE)) {
        db.deleteObjectStore(WORDS_STORE);
      }
      const wordsStore = db.createObjectStore(WORDS_STORE, {
        autoIncrement: true,
      });
      wordsStore.createIndex("battle", "battle", { unique: false });

      // Create or recreate battles store
      if (db.objectStoreNames.contains(BATTLES_STORE)) {
        db.deleteObjectStore(BATTLES_STORE);
      }
      const battlesStore = db.createObjectStore(BATTLES_STORE, {
        autoIncrement: true,
      });
      battlesStore.createIndex("name", "name", { unique: true });
    };
  });
};

export const getWordsByBattle = async (battle: string): Promise<Word[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(WORDS_STORE, "readonly");
    const store = transaction.objectStore(WORDS_STORE);
    const index = store.index("battle");
    const request = index.getAll(battle);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const saveBattle = async (battleName: string): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BATTLES_STORE, "readwrite");
    const store = transaction.objectStore(BATTLES_STORE);

    const request = store.add({ name: battleName });

    request.onsuccess = () => resolve();
    request.onerror = () => {
      // Ignore if battle already exists
      if (request.error?.name === "ConstraintError") {
        resolve();
      } else {
        reject(request.error);
      }
    };
  });
};

export const saveToIndexedDB = async (data: Word[]): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [WORDS_STORE, BATTLES_STORE],
      "readwrite"
    );
    const wordsStore = transaction.objectStore(WORDS_STORE);
    const battlesStore = transaction.objectStore(BATTLES_STORE);

    // Extract unique battles and save them
    const uniqueBattles = new Set(data.map((word) => word.battle));
    uniqueBattles.forEach((battleName) => {
      battlesStore.add({ name: battleName });
    });

    // Save words
    data.forEach((item) => {
      const { id, ...wordWithoutId } = item;
      wordsStore.add(wordWithoutId);
    });

    transaction.oncomplete = () => {
      console.log(
        `Added ${data.length} words and ${uniqueBattles.size} battles`
      );
      resolve();
    };
    transaction.onerror = (error) => {
      console.error("Transaction error:", error);
      reject(transaction.error);
    };
  });
};

export const getAllBattles = async (): Promise<Battle[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BATTLES_STORE, "readonly");
    const store = transaction.objectStore(BATTLES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};
