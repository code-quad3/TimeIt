// db.js

const DB_NAME = "ExtensionDB";
const DB_VERSION = 2; // Increment the version to trigger onupgradeneeded
const FAVICON_STORE = "favicons";
const DOMAIN_TIME_STORE = "domainTimeStore";

let db;

export async function openFaviconDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const tempDb = event.target.result;
            if (!tempDb.objectStoreNames.contains(FAVICON_STORE)) {
                tempDb.createObjectStore(FAVICON_STORE, { keyPath: "domain" });
                console.log(`[db.js] Store '${FAVICON_STORE}' created.`);
            }
            if (!tempDb.objectStoreNames.contains(DOMAIN_TIME_STORE)) {
                tempDb.createObjectStore(DOMAIN_TIME_STORE, { keyPath: "domain" });
                console.log(`[db.js] Store '${DOMAIN_TIME_STORE}' created.`);
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log(`[db.js] DB '${DB_NAME}' opened.`);
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("[db.js] Failed to open DB:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Favicon operations
export async function saveFavicon(domain, iconBase64) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FAVICON_STORE], "readwrite");
        const store = transaction.objectStore(FAVICON_STORE);
        const request = store.put({
            domain,
            // Now we save the Base64 string directly
            icon: iconBase64,
            updatedAt: Date.now(),
        });
        request.onsuccess = () => {
            console.log(`[db.js] Saved icon for ${domain}`);
            resolve();
        };
        request.onerror = (event) => {
            console.error(`[db.js] Failed to save icon for ${domain}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

export async function getFavicon(domain) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FAVICON_STORE], "readonly");
        const store = transaction.objectStore(FAVICON_STORE);
        const request = store.get(domain);
        request.onsuccess = (event) => {
            const result = event.target.result;
            // Now we resolve with the Base64 string directly, not an array
            resolve(result ? result.icon : null);
        };
        request.onerror = (event) => {
            console.error(`[db.js] Failed to get icon for ${domain}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

export async function cleanupOldFavicons(days) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FAVICON_STORE], "readwrite");
        const store = transaction.objectStore(FAVICON_STORE);
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        const request = store.openCursor();
        let count = 0;
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.updatedAt < cutoff) {
                    cursor.delete();
                    count++;
                }
                cursor.continue();
            } else {
                console.log(`[db.js] Cleanup complete. Deleted ${count} old favicons.`);
                resolve();
            }
        };
        request.onerror = (event) => {
            console.error("[db.js] Cleanup failed:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Domain time operations
export async function getDomainTimeEntry(domain) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DOMAIN_TIME_STORE], "readonly");
        const store = transaction.objectStore(DOMAIN_TIME_STORE);
        const request = store.get(domain);
        request.onsuccess = (event) => {
            resolve(event.target.result || {
                domain,
                daily: {},
                weekly: {},
                monthly: {}
            });
        };
        request.onerror = (event) => {
            console.error(`[db.js] Failed to get time for ${domain}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

export async function saveDomainTimeEntry(domain, data) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DOMAIN_TIME_STORE], "readwrite");
        const store = transaction.objectStore(DOMAIN_TIME_STORE);
        const request = store.put({ domain, ...data });
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            console.error(`[db.js] Failed to save time for ${domain}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

export async function getAllDomainTimeEntries() {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DOMAIN_TIME_STORE], "readonly");
        const store = transaction.objectStore(DOMAIN_TIME_STORE);
        const request = store.getAll();
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("[db.js] Failed to get all domain time entries:", event.target.error);
            reject(event.target.error);
        };
    });
}

export async function cleanupOldTimeEntries(cutoffDate) {
    if (!db) await openFaviconDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DOMAIN_TIME_STORE], "readwrite");
        const store = transaction.objectStore(DOMAIN_TIME_STORE);
        const request = store.openCursor();
        let count = 0;
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const domainData = cursor.value;
                if (domainData.daily[cutoffDate]) {
                    delete domainData.daily[cutoffDate];
                    cursor.update(domainData);
                    count++;
                }
                cursor.continue();
            } else {
                console.log(`[db.js] Cleanup complete. Deleted daily data for ${count} domains.`);
                resolve();
            }
        };
        request.onerror = (event) => {
            console.error("[db.js] Cleanup failed:", event.target.error);
            reject(event.target.error);
        };
    });
}