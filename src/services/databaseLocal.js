import { haveData } from './funcoes';
import { EnviromentVars } from '../config/env';

function startImageDb(database, table) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.open(database);

    dbRequest.onerror = function (event) {
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      var database = event.target.result;
      var objectStore = database.createObjectStore(table, {
        autoIncrement: true,
        keyPath: 'id',
      });
      objectStore.createIndex('uniqueid', 'uniqueid', { unique: false });
      objectStore.createIndex('filename', 'filename', { unique: false });
      objectStore.createIndex('imageData', 'imageData', { unique: false });
      objectStore.createIndex('synced', 'synced', { unique: false });

      dbRequest.transaction.oncomplete = function (event) {
        resolve(database);
      };
    };

    dbRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

function startWorkingDB(database, table) {
  return new Promise(function (resolve, reject) {
    //console.log('startWorkingDb -> Database', database);
    //console.log('startWorkingDb -> Table', table);
    var dbRequest = indexedDB.open(database);

    dbRequest.onerror = function (event) {
      alert('IndexedDB database error');
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      var database = event.target.result;
      var objectStore = database.createObjectStore(table, {
        autoIncrement: true,
        keyPath: 'id',
      });
      objectStore.createIndex('name', 'name', { unique: false });
      objectStore.createIndex('data', 'data', { unique: false });

      dbRequest.transaction.oncomplete = function (event) {
        resolve(database);
      };
    };

    dbRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

export function startGpsDB(database, table) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.open(database);

    dbRequest.onerror = function (event) {
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      var database = event.target.result;
      var objectStore = database.createObjectStore(table, {
        autoIncrement: true,
        keyPath: 'id',
      });
      objectStore.createIndex('latitude', 'latitude', { unique: false });
      objectStore.createIndex('longitude', 'longitude', { unique: false });
      objectStore.createIndex('dateTime', 'dateTime', { unique: false });
      objectStore.createIndex('synced', 'synced', { unique: false });

      dbRequest.transaction.oncomplete = function (event) {
        resolve(database);
      };
    };

    dbRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

export function startErrorsDB(database, table) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.open(database);

    dbRequest.onerror = function (event) {
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      var database = event.target.result;
      var objectStore = database.createObjectStore(table, {
        autoIncrement: true,
        keyPath: 'id',
      });
      objectStore.createIndex('message', 'message', { unique: false });

      dbRequest.transaction.oncomplete = function (event) {
        resolve(database);
      };
    };

    dbRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

export function startScheduleDataDB(database, table) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.open(database);

    dbRequest.onerror = function (event) {
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      var database = event.target.result;
      var objectStore = database.createObjectStore(table, {
        autoIncrement: true,
        keyPath: 'id',
      });
      objectStore.createIndex('data', 'data', { unique: false });

      dbRequest.transaction.oncomplete = function (event) {
        resolve(database);
      };
    };

    dbRequest.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

export function deleteDB(database) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.deleteDatabase(database);

    dbRequest.onerror = function (event) {
      reject(Error('Error deleting database'));
    };

    dbRequest.onsuccess = function (event) {
      resolve('Database deleted.');
    };
  });
}

export function saveObject(database, table, object) {
  return new Promise(function (resolve, reject) {
    //console.log('saveObject -> Table', table);
    var tz = database.transaction(table, 'readwrite');

    tz.onerror = function (event) {
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);

    var request = store.add(object);

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

export function deleteObject(database, table, id) {
  return new Promise(function (resolve, reject) {
    var tz = database.transaction(table, 'readwrite');

    tz.onerror = function (event) {
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);

    store.delete(id).onsuccess = function (event) {
      resolve(event);
    };
  });
}

export function putObject(database, table, obj, id) {
  return new Promise(function (resolve, reject) {
    var tz = database.transaction(table, 'readwrite');

    tz.onerror = function (event) {
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);
    var request = store.put(obj);

    request.onsuccess = function (event) {
      resolve(event);
    };
  });
}

export function updateObject(database, table, id, updatedObject) {
  return new Promise(function (resolve, reject) {
    // Inicia uma transação em modo 'readwrite'
    var tz = database.transaction(table, 'readwrite');

    tz.onerror = function (event) {
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);

    // Recupera o objeto pelo ID para verificar sua existência
    var getRequest = store.get(id);

    getRequest.onsuccess = function (event) {
      if (!event.target.result) {
        reject(Error('No object found with the provided ID'));
        return;
      }

      // Atualiza o objeto no banco de dados
      var request = store.put({ ...event.target.result, ...updatedObject });

      request.onsuccess = function (event) {
        resolve(event.target.result); // Retorna o ID do objeto atualizado
      };

      request.onerror = function (event) {
        reject(event.target.error);
      };
    };

    getRequest.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

function getObject(database, table, fieldKey, id) {
  return new Promise(function (resolve, reject) {
    var tz = database.transaction(table, 'readwrite');

    tz.onerror = function (event) {
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);

    var request = store.index(fieldKey);
    request.get(id).onsuccess = function (event) {
      if (typeof event.target.result == 'undefined') {
        resolve(undefined);
      } else {
        resolve(event.target.result);
      }
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

export function getObjectAll(database, table) {
  return new Promise(function (resolve, reject) {
    // //console.log('getObjectAll -> Table', table);
    var tz = database.transaction(table, 'readonly');

    tz.onerror = function (event) {
      alert('Transaction Error');
      reject(Error('Transaction Error'));
    };

    var store = tz.objectStore(table);

    if ('getAll' in store) {
      // IDBObjectStore.getAll() will return the full set of items in our store.
      store.getAll().onsuccess = function (event) {
        if (typeof event.target.result == 'undefined') {
          resolve(undefined);
        } else {
          resolve(event.target.result);
        }
      };
    } else {
      // Fallback to the traditional cursor approach if getAll isn't supported.
      var result = [];
      store.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          result.push(cursor.value);
          cursor.continue();
        } else {
          resolve(result);
        }
      };
    }
  });
}

// IMAGE DB
export const setLocalImage = async (uniqueid, imageData, fileName) => {
  if (!haveData(imageData)) {
    return;
  }
  let data = { uniqueid, fileName, imageData };
  let database = await startImageDb(EnviromentVars.imageDB, EnviromentVars.imageTable);
  if (database) {
    let obj = await getObject(database, EnviromentVars.imageTable, 'uniqueid', uniqueid);
    if (obj) {
      data.id = obj.id;
      await putObject(database, EnviromentVars.imageTable, data, obj.id);
    } else {
      await saveObject(database, EnviromentVars.imageTable, data);
    }
  }
};

export const delLocalImage = async (uniqueid) => {
  let database = await startImageDb(EnviromentVars.imageDB, EnviromentVars.imageTable);
  if (database) {
    let obj = await getObject(database, EnviromentVars.imageTable, 'uniqueid', uniqueid);
    if (obj) {
      await deleteObject(database, EnviromentVars.imageTable, obj.id);
    }
  }
};

export const getLocalImage = async (uniqueid) => {
  if (uniqueid === undefined || uniqueid === '' || uniqueid === 'limpar' || uniqueid == null) {
    return undefined;
  }
  let database = await startImageDb(EnviromentVars.imageDB, EnviromentVars.imageTable);
  if (database) {
    let obj = await getObject(database, EnviromentVars.imageTable, 'uniqueid', uniqueid);
    if (obj) {
      return obj.imageData;
    } else {
      return undefined;
    }
  }
};

export const getAllImages = async () => {
  let database = await startImageDb(EnviromentVars.imageDB, EnviromentVars.imageTable);
  if (database) {
    let obj = await getObjectAll(database, EnviromentVars.imageTable);
    return obj;
  }
};

export const getLocalImageRegistry = async (uniqueid) => {
  if (uniqueid === undefined || uniqueid === '' || uniqueid === 'limpar' || uniqueid == null) {
    return undefined;
  }
  let database = await startImageDb(EnviromentVars.imageDB, EnviromentVars.imageTable);
  if (database) {
    return await getObject(database, EnviromentVars.imageTable, 'uniqueid', uniqueid);
  }
};

// WORKING DB
export const setSchedules = async (objectName, objectValue) => {
  if (!haveData(objectValue)) {
    return;
  }
  let data = { name: objectName, data: objectValue };
  let database = await startWorkingDB(EnviromentVars.workingDB, EnviromentVars.workingTable);
  if (database) {
    let objects = await getObjectAll(database, EnviromentVars.workingTable);
    let workingDayItem = undefined;
    if (objects !== undefined) {
      for (const obj of objects) {
        if (obj.name === objectName) {
          workingDayItem = obj;
          break;
        }
      }
    }

    if (haveData(workingDayItem)) {
      data.id = workingDayItem.id;
      await putObject(database, EnviromentVars.workingTable, data, workingDayItem.id);
    } else {
      await saveObject(database, EnviromentVars.workingTable, data);
    }
  }
};

export const delSchedule = async (objectName) => {
  let database = await startWorkingDB(EnviromentVars.workingDB, EnviromentVars.workingTable);
  if (database) {
    let objects = await getObjectAll(database, EnviromentVars.workingTable);
    let finded = undefined;
    if (objects !== undefined) {
      for (const obj of objects) {
        if (obj.name === objectName) {
          finded = obj;
          break;
        }
      }
    }
    if (finded) {
      await deleteObject(database, EnviromentVars.workingTable, finded.id);
    }
  }
};

export const getSchedule = async (objectName) => {
  let database = await startWorkingDB(EnviromentVars.workingDB, EnviromentVars.workingTable);
  if (database) {
    let objects = await getObjectAll(database, EnviromentVars.workingTable);
    let finded = undefined;
    if (objects !== undefined) {
      for (const obj of objects) {
        if (obj.name === objectName) {
          finded = obj;
          break;
        }
      }
    }
    return finded;
  }
};

export const getScheduleDay = async (objectName) => {
  let database = await startWorkingDB(EnviromentVars.workingDB, EnviromentVars.workingTable);
  if (database) {
    let objects = await getObjectAll(database, EnviromentVars.workingTable);
    return objects;
  }
};

// GPS
export const setGps = async (latitude, longitude) => {
  if (!haveData(latitude) || !haveData(longitude)) {
    return;
  }
  let data = { latitude, longitude, dateTime: new Date(), synced: 0 };
  let database = await startGpsDB(EnviromentVars.gpsDB, EnviromentVars.gpsTable);
  if (database) {
    await saveObject(database, EnviromentVars.gpsTable, data);
  }
};

export const getGps = async () => {
  let database = await startGpsDB(EnviromentVars.gpsDB, EnviromentVars.gpsTable);
  if (database) {
    let objects = await getObjectAll(database, EnviromentVars.gpsTable);

    return objects;
  }
};

export const deleteGpsDb = async () => {
  deleteDB(EnviromentVars.gpsDB);
};

const asyncLocalStorage = {
  setItem: function (key, value) {
    return Promise.resolve().then(function () {
      localStorage.setItem(key, value);
    });
  },
  getItem: function (key) {
    return Promise.resolve(localStorage.getItem(key)).then((value) => {
      return value;
    });
  },
};

export const getLocalObject = async (objectName, local) => {
  // //console.log('getLocalObject -> ', local);
  // let record = await getSchedule(objectName);
  // if (haveData(record)){
  //   return record.data;
  // } else {
  //   return undefined;
  // }
  // let data = localStorage.getItem(objectName);
  let data = await asyncLocalStorage.getItem(objectName);
  if (data !== undefined && data != null) {
    data = Buffer.from(data, 'base64').toString('utf8');
    data = JSON.parse(data);
    return data;
  } else {
    return undefined;
  }
};

export const delLocalObject = async (objectName) => {
  // await delSchedule(objectName);
  localStorage.removeItem(objectName);
};

export const setLocalObject = async (objectName, objectValue) => {
  // await setSchedules(objectName, objectValue);
  try {
    var _data = JSON.stringify(objectValue);
    if (_data === undefined) {
      return;
    }
    delLocalObject(objectName);
    _data = Buffer.from(_data.toString()).toString('base64');
    await asyncLocalStorage.setItem(objectName, _data);
    // localStorage.setItem(objectName, _data);
  } catch (error) {
    //console.log('erro setLocalObject no localStorage');
    //console.log(error);
  }
};
