import {openTab} from "../src/openTab.js";
import {user_interface_url} from "../src/global_config.js";

console.log("hello world");

chrome.action.onClicked.addListener(async ()=>{
 
 	const ledger = ( await chrome.storage.session.get({tabIds: {}}) ).tabIds;
    const opened = await openTab(user_interface_url, ledger, "userInterface") //apro l'interfaccia se non è già aperta
    if(opened) {
    	chrome.storage.session.set({'tabIds':ledger});
    }

});