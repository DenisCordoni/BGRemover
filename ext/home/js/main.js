import {background_replacer_url} from "../../src/global_config.js"
import {image_formats} from "../../src/global_config.js";
import {powershell_exec} from "./src/powershell interface/powershell_exec.js";
import {openTab} from "../../src/openTab.js";

const mem={

	tabIds:{

		backgroundReplacerTab: null

	}

};

let images_root_full_path;
let images_root_handle;
let images_root_picked=false;
let powershell_root_picked=false;
let images_root_subfolders=[];
let powershell_root_handle;

let subfolders_index=0;
let images_index=0;
let current_subfolder;
let current_image;

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {

    //qui vengono intercettati TUTTI i download, non solo quelli avviati da parte
    //del content script, e non c'è modo di accedere all'id. Quindi non si possono
    //far partire altri download per non inteferire con l'estensione. Ma tanto
    //questa estensione prende il controllo di tutto il pc, quindi poco male.

    if(!current_subfolder) {
        console.log("cartella corrente non definita");
        return;
    }

    let filename = `${current_subfolder.name}/${current_image.name}.png`;
    console.log(filename);

    suggest({ filename: filename }); //se l'opzione "Chiedi dove salvare il file prima di scaricarlo" è disabilitata, questo suggest è silente proprio come vogliamo
    
    nextImage();

    chrome.tabs.reload(mem.tabIds.backgroundReplacerTab);

});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(!sender.tab) {
        console.log("Only listening for tab messages here");
        return;
    }

    (async function() {

          if(request.type=="authReq") {


                if(sender.tab.id==mem.tabIds.backgroundReplacerTab) {
                    sendResponse({authorized: true});
                    return;
                }
                sendResponse({authorized: false});
                return;

          }

          if(request.type=="clickReq") {


                if(!current_subfolder) {
                    sendResponse({type: "clickRes", clicked: false, error: "No more images"});
                    return;
                }
                const clicked = await powershell_exec(powershell_root_handle, "clicker", {x:request.coordinates.x, y:request.coordinates.y});
                sendResponse({type: "clickRes", clicked: clicked});
                return;

          }

          if(request.type=="fillReq") {

                if(!current_subfolder) {
                    sendResponse({type: "fillRes", filled: false, error: "No more images"});
                    return;
                }

                const path = images_root_full_path+"\\"+current_subfolder.name+"\\"+current_image.name+"."+current_image.format;
                console.log(path);
                const filled = await powershell_exec(powershell_root_handle, "filler", {path: path});
                sendResponse({type: "fillRes", filled: filled});
                return;

          }

    })();

    return(true);

});


$(document).ready(async function() {

	//Per evitare di chiudere accidentalmente la pagina
    window.addEventListener("beforeunload", function (e) {

      	e.preventDefault();					// Alcuni browser non mostrano più il messaggio personalizzato,
      	e.returnValue = ''; 				// ma il ritorno di questa funzione attiva comunque il prompt di conferma.
       										// Non necessario in tutti i browser, ma buona pratica
    });  									// Stringa vuota necessaria per attivare il messaggio di conferma

    $("#images_root_inserter").click(()=>{

        images_root_full_path=prompt("Inserisci il full path della cartella che selezionerai (stile backslash - no backslash finale");

    });

    $("#images_root_picker").click(async ()=>{

        if(!images_root_full_path) {
            alert("Devi prima inserire il full path della cartella che selezionerai!");
            return;
        }

        images_root_handle = await window.showDirectoryPicker({mode:"readwrite"});
        images_root_subfolders = await imagesPopulation(images_root_handle,image_formats);
        images_root_picked=true;
        if(images_root_subfolders.length) {
        	current_subfolder=images_root_subfolders[0];
        	current_image=current_subfolder.images[0]; //le cartelle che non contengono immagini non vengono inserite nell'array da imagesPopulation
        }
        console.log(images_root_subfolders);

    });

    $("#powershell_root_picker").click(async ()=>{

        if(!images_root_picked) {
            alert("Devi prima svolgere i passaggi precedenti!");
            return;
        }

        powershell_root_handle = await window.showDirectoryPicker({mode:"readwrite"});
        powershell_root_picked = true;

    });


    $("#background_replacer_opener").click(async ()=>{


        if(!powershell_root_picked) {
            alert("Devi prima svolgere i passaggi precedenti!");
            return;
        }

        openTab(background_replacer_url, mem.tabIds, "backgroundReplacerTab",false);

    });

});

async function imagesPopulation(images_root_handle,image_formats) {

  let images_root_subfolders = [];

  for await (const [folder_name, folder_handle] of images_root_handle.entries()) {
    if (folder_handle.kind == "directory") {
      let folder={
          name: folder_name,
          images: []
      };
      for await (let [image_name, image_handle] of folder_handle.entries()) {
        if (image_handle.kind === "file") {
          const parts=image_name.split(".");
          const format=parts.pop().toLowerCase();
          if (image_formats.includes(format)) {
              folder.images.push({
              	name: parts.join("."),
              	format: format
              });
          }
        }
      }
      if(folder.images.length) {
      	images_root_subfolders.push(folder);
      }
    }
  }

  return(images_root_subfolders);

}

function nextImage() {

    if(images_index<(current_subfolder.images.length-1)) {
        images_index++;
        current_image=current_subfolder.images[images_index];
        return;
    }

    if(subfolders_index<(images_root_subfolders.length-1)) {
        subfolders_index++;
        images_index=0; //le cartelle che non contengono immagini non vengono inserite nell'array da imagesPopulation
        current_subfolder=images_root_subfolders[subfolders_index];
        current_image=current_subfolder.images[images_index];
        return;
    }
    
    current_subfolder=false;

}