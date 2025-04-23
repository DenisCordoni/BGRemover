export function waitForFileToBeDeleted(fileHandle, interval = 500) {
  return new Promise((resolve, reject) => {
    const handler = setInterval(async () => {
      try {
        await fileHandle.getFile(); // Il file esiste ancora: non facciamo nulla
      } catch (err) {
        if (err.name === "NotFoundError") {
          clearInterval(handler);
          resolve(true); // Il file è stato eliminato
        } else {
          clearInterval(handler);
          reject("Errore durante il controllo esistenza del file: " + err.message);
        }
      }
    }, interval);
  });
}