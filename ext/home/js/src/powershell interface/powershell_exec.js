import {listened_script_name} from "./config.js";
import {listened_script_folder_path} from "./config.js";
import {listened_script_src_folder_path} from "./config.js";
import {getHandleFromPath} from "../getHandleFromPath.js";
import {waitForFileToBeDeleted} from "../waitForFileToBeDeleted.js";

export async function powershell_exec(folderHandle, scriptName, parameters) {

  //questa funzione preleva lo script desiderato dalla cartella in cui sono posizionati
  //gli script powershell da essa eseguibili, ne crea una copia impostandone i parametri
  //e poi la deposita nell'apposita cartella di esecuzione a guardia della quale sta uno
  //script listener appositamente lanciato prima di utilizzare l'estensione, che esegue
  //lo script depositato, dopodiché lo elimina. L'eliminazione è considerato come segnale
  //di avvenuta esecuzione da parte di questa funzione.

  let ext = scriptName.split(".").pop();
  if(ext != "ps1") {
    scriptName += ".ps1";
  }

  let listened = listened_script_name;
  ext = listened.split(".").pop();
  if(ext != "ps1") {
    listened += ".ps1";
  }  

  const srcScriptHandle = await getHandleFromPath(folderHandle, `${listened_script_src_folder_path}/${scriptName}`);
  const file = await srcScriptHandle.getFile();
  let content = await file.text();

  for (let key in parameters) {

    let placeholder = "£"+key;
    content = content.replace(new RegExp(placeholder, 'g'), parameters[key]);

  }

  //Scriviamo il nuovo file nella cartella preimpostata
  const desFolderHandle = await getHandleFromPath(folderHandle, listened_script_folder_path);
  const desScriptHandle = await desFolderHandle.getFileHandle(listened, { create: true });
  const writable = await desScriptHandle.createWritable();
  await writable.write(content);
  await writable.close();

  //Aspettiamo che il listener esegua lo script appena scritto (lo elimina una volta eseguito)

  const executed = await waitForFileToBeDeleted(desScriptHandle);

  return(executed);

}