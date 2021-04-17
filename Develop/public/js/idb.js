let db;

const request = indexedDB.open('moble-bank', 1);

//  event to signal the need to create a DB
request.onupgradeneeded = function(cvent) {
  // save reference to the DB
  const db = event.target.result;
  // create Object Store(table) "moble-bank"
  db.createObjectStore('new_bank', { autoIncrement: true});
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
   
    uploadBank();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(event.target.errorCode);
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

function uploadBank() {
  // open a transaction on your pending db
  const transaction = db.transaction(['new_bank'], 'readwrite');

  // access your pending object store
  const bankObjectStore = transaction.objectStore('new_bank');

  // get all records from store and set to a variable
  const getAll = bankObjectStore.getAll();

  getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_bank'], 'readwrite');
          const bankObjectStore = transaction.objectStore('new_bank');
          // clear all items in your store
          bankObjectStore.clear();
        })
        .catch(err => {
          // set reference to redirect back here
          console.log(err);
        });
    }
  };
}
// listen for app coming back online
window.addEventListener('online', uploadBank);