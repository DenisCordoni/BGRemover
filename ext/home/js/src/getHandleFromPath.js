export async function getHandleFromPath(rootHandle, pathString) {

  const parts = pathString.split('/').filter(p => p.trim() !== '');
  let currentHandle = rootHandle;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    try {
      // Prova prima come directory
      currentHandle = await currentHandle.getDirectoryHandle(part);
    } 
    catch (dirErr) {
      if (i === parts.length - 1) {
        // Se siamo alla fine, potrebbe essere un file
        try {
          currentHandle = await currentHandle.getFileHandle(part);
        } 
        catch (fileErr) {
          throw new Error(`Elemento non trovato: ${part}`);
        }
      } else {
        throw new Error(`Directory non trovata: ${part}`);
      }
    }
  }

  return currentHandle;

}