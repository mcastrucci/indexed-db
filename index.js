import { openDB } from "https://unpkg.com/idb?module";

document.addEventListener("DOMContentLoaded", async () => {
  const version = 1;
  const dbName = "code_pen_db";
  const storeName = "codePenStore";

  /* Indexed DB methods */

  //@Gets Indexed Data base from browser
  const getDb = async () => {
    const db = await openDB(dbName, version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(storeName)) {
          return db.createObjectStore(storeName);
        } else {
          return db.transaction(storeName).objectStore(storeName);
        }
      }
    });
    return db;
  };

  //not used gets all Keys in the DB
  const aGetAllKeys = async () => {
    return await store
      .transaction(storeName)
      .objectStore(storeName)
      .getAllKeys();
  };

  //used to insert an element after a button is pressed
  const aInsertNewElement = async (val) => {
    let id = await aGetCurrentID(); //we get the currentID from the IDB
    const tx = db.transaction(storeName, "readwrite");
    await tx.objectStore(storeName).put(val, `el${id}`);
    await tx.done;
  };

  //get the current ID from the IDB
  const aGetCurrentID = async () => {
    let currentID = await db
      .transaction(storeName)
      .objectStore(storeName)
      .get("id");
    await db.transaction(storeName).done;
    return currentID;
  };

  //get an specific element FROM DB, it requires a key
  const aGetElementFromDb = async (elem) => {
    let element = await db
      .transaction(storeName)
      .objectStore(storeName)
      .get(`el${elem}`);
    await db.transaction(storeName).done;
    return element;
  };

  //increase the ID from IDB
  const aIncreaseID = async () => {
    let currentId = await aGetCurrentID();
    const tx = db.transaction(storeName, "readwrite");

    const store = await tx.objectStore(storeName);
    let nextID;
    if (currentId) nextID = currentId + 1;
    else nextID = 1;
    const value = await store.put(nextID, "id");
    await tx.done;
    console.log("the new id is ", nextID);
  };

  //used to remove all keys from DB
  const resetDataBase = async () => {
    //lets reset de dataBase
    let id = await aGetCurrentID(); // current ID to iterate

    //we prepare the transaction
    const tx = db.transaction(storeName, "readwrite");
    const store = await tx.objectStore(storeName);

    for (let i = 1; i < id; i++) {
      await store.delete("el" + i);
    }
    await store.put(0, "id");
    await tx.done;
  };

  let db = await getDb();
  /* End indexed DB Methods*/

  //makes screen changes after adding into the db and
  //when entering into the pen
  const refreshScreen = async () => {
    //first lets clear all components
    const resultsTable = document.querySelector(".results-table");
    while (resultsTable.firstChild) {
      resultsTable.removeChild(resultsTable.lastChild);
    }

    //now lets see what our db Has
    let id = await aGetCurrentID();
    for (let i = 1; i <= id; i++) {
      let elem = await aGetElementFromDb(i);
      //we add an element for each IDB entry
      resultsTable.insertAdjacentHTML(
        "beforeend",
        `<div class="result-element ${
          elem == 1 ? "gdt" : elem == 10 ? "p8p" : elem == 100 ? "tt" : "reb"
        }">${elem}</div>`
      );
    }

    //const resultsTable = document.querySelector(".results-table");
    //resultsTable.insertAdjacentHTML('beforeend', `<div>test</div>`);
  };

  //content loaded
  const el1 = document.querySelector("#el1");
  const el10 = document.querySelector("#el10");
  const el100 = document.querySelector("#el100");
  const el1000 = document.querySelector("#el1000");
  const resetButton = document.querySelector("#reset-button");

  
  //generic click event that requires a parameter key for DB
  const handleClickEvent = async (incr) => {
    await aIncreaseID();
    try {
      await aInsertNewElement(incr);
      await refreshScreen();
    } catch (ex) {
      console.log(ex);
    }
  };

  el1.addEventListener("click", () => handleClickEvent(1));

  el10.addEventListener("click", () => handleClickEvent(10));

  el100.addEventListener("click", () => handleClickEvent(100));

  el1000.addEventListener("click", () => handleClickEvent(1000));

  resetButton.addEventListener("click", async () => {
    await resetDataBase();
    await refreshScreen();
  });

  //first refreshScreenCall on begining
  refreshScreen();
});
