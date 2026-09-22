let db;
const DB_NAME = "VKU_Survey_DB";
const DB_VERSION = 1;
const STORE_NAME = "surveys";

// Khởi tạo IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

// Hàm lưu khảo sát vào IndexedDB
async function saveSurvey(survey) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(survey);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Hàm lấy tất cả bản ghi chưa đồng bộ (synced: false)
async function getUnsyncedSurveys() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const unsynced = (request.result || []).filter(item => !item.synced);
      resolve(unsynced);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

// Hàm cập nhật trạng thái synced: true
async function markSurveyAsSynced(id) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.synced = true;
        store.put(item);
      }
      resolve();
    };

    getReq.onerror = (e) => reject(e.target.error);
  });
}

// Tự động mở DB khi web vừa load
initDB();