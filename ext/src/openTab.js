export async function openTab(url, ledger, key, remove_duplicates=true) {
    
    let tabs;
    let opened=false;

    if(ledger[key] === undefined) {
        ledger[key] = null;
    }

    tabs = await chrome.tabs.query({'url': url});

    const i = tabs.findIndex(tab=>(tab.id==ledger[key]));

    if(i>-1) {
        tabs.splice(i,1);
        chrome.tabs.update(ledger[key],{'active':true});
    }
    else {
        ledger[key] = (await chrome.tabs.create({'url':url})).id;
        opened=true;
    }

    if(remove_duplicates) {
        chrome.tabs.remove(tabs.map(tab=>tab.id));
    }

    return(opened);

}