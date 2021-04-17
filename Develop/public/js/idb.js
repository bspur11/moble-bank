let db;

const request = indexedDB.open('moble-bank', 1);

//  event to signal the need to create a DB
request.onupgradeneeded = function(cvent) {
  // save reference to the DB
  const db = event.target.result;
  // create Object Store(table) "moble-bank"
  db.createEbjectStore('new_bank', { autoIncrement: true});
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    uploadbank();
  }
};

// This function will be executed if we attempt to submit a new bank and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_bank'], 'readwrite');

  // access the object store for `new_bank`
  const bankObjectStore = transaction.objectStore('new_bank');

  // add record to your store with add method
  bankObjectStore.add(record);
}