$(document).ready(async function() {

	let response = await chrome.runtime.sendMessage({type: "authReq"});

	if(!response.authorized) {
		console.log("I am not authorized");
		return;
	}

	console.log("Oh, let's go, I am authorized!");

	let selectors={
		uploadWrapper: ".Styles_uploadBtnInputDiv__rucrS",
		uploadBtn: "#inputFile",
		mainDownloadBtn: ".styles_mainHeaderDownload__RpKfb",
		subDownloadBtn: ".styles_downloadBtns__g4cL3"
	};

	let coordinates = getScreenCoordinates($(selectors["uploadWrapper"])[0]);
	console.log(coordinates);

	coordinates = {x: 877, y: 737};

	response = await chrome.runtime.sendMessage({type: "clickReq", coordinates: coordinates});

	if(!response.clicked) {
		if(response.error) {
			console.error(response.error);
			return;
		}
		console.error("Qualcosa è andato storto con il click");
		return;		
	}	

	console.log("Upload cliccato!");

	response = await chrome.runtime.sendMessage({type: "fillReq"});
	if(!response.filled) {
		if(response.error) {
			console.error(response.error);
			return;
		}
		console.error("Qualcosa è andato storto con il filling");
		return;		
	}

	console.log("filling avvenuto, aspettiamo che compaia il bottone di download principale");

	let mainDownloadBtn = await waitForElementToAppear(selectors["mainDownloadBtn"]);

	console.log("bottone download principale comparso. Aspettiamo qualche secondo perché si carichi l'immagine");

	await delay(15000);

	console.log("clicco sul bottone download principale");

	mainDownloadBtn.click();

	await delay(1500);

	let subDownloadBtn = await waitForElementToAppear(selectors["subDownloadBtn"]);

	console.log("clicco sul bottone secondario");

	subDownloadBtn.click();

	//il download sarà intercettato dal service worker che provvederà a fare il refresh della pagina

});


function delay(ms) {
	return(new Promise((resolve, reject)=>{
		setTimeout(()=>{resolve();},ms);
	}));
}


function waitForElementToAppear(selector,interval=1000,maxTrials=60) {

	return(new Promise(function(resolve,reject) {

		let handler = setInterval(function() {

			let element = $(selector);
			if(!element.length) {
				maxTrials--;
				if(!maxTrials) {
					reject("Il selettore "+selector+" non funziona più");
					clearInterval(handler);
				}
				return;
			}

			resolve(element);
			clearInterval(handler);

		},
		interval);

	}));

}


function getScreenCoordinates(element) {
  if (!element) {
    console.warn("Elemento non definito");
    return null;
  }

  const rect = element.getBoundingClientRect();

  const screenX = window.screenX + rect.left;
  const screenY = window.screenY + rect.top;

  return {
    x: screenX,
    y: screenY
  };
}
