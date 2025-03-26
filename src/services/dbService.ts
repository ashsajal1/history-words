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
    const battlesIndex = battlesStore.index("name");

    // Extract unique battles and save them if they don't exist
    const uniqueBattles = new Set(data.map((word) => word.battle));
    const battlePromises = Array.from(uniqueBattles).map((battleName) => {
      return new Promise<void>((resolveInner, rejectInner) => {
        // Check if battle already exists
        const checkRequest = battlesIndex.get(battleName);

        checkRequest.onsuccess = () => {
          if (!checkRequest.result) {
            // Battle doesn't exist, add it
            const addRequest = battlesStore.add({ name: battleName });
            addRequest.onsuccess = () => resolveInner();
            addRequest.onerror = () => {
              if (addRequest.error?.name === "ConstraintError") {
                resolveInner(); // Ignore duplicate error
              } else {
                rejectInner(addRequest.error);
              }
            };
          } else {
            resolveInner(); // Battle already exists
          }
        };

        checkRequest.onerror = () => rejectInner(checkRequest.error);
      });
    });

    // Wait for all battle checks/additions to complete
    Promise.all(battlePromises)
      .then(() => {
        // Save words
        data.forEach((item) => {
          const { id, ...wordWithoutId } = item;
          wordsStore.add(wordWithoutId);
        });

        transaction.oncomplete = () => {
          console.log(
            `Added ${data.length} words and checked ${uniqueBattles.size} battles`
          );
          resolve();
        };
      })
      .catch((error) => {
        console.error("Error processing battles:", error);
        reject(error);
      });

    transaction.onerror = () => {
      console.error("Transaction error:", transaction.error);
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
