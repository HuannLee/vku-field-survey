const DB_NAME = "VKUFieldSurveyDB";
const DB_VERSION = 1;
const STORE_NAME = "surveys";


function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

function saveSurvey(survey) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );
            const store =
                transaction.objectStore(
                    STORE_NAME
                );
            store.put(survey);

            transaction.oncomplete =
                function () {
                    resolve();
                };

            transaction.onerror =
                function () {
                    reject(transaction.error);
                };
        });

    });
}


function getAllSurveys() {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );
            const store =
                transaction.objectStore(
                    STORE_NAME
                );
            const request =
                store.getAll();

            request.onsuccess =
                function () {
                    resolve(request.result);
                };

            request.onerror =
                function () {
                    reject(request.error);
                };
        });
    });
}
