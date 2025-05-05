$(document).ready(async function() {

	let response = await chrome.runtime.sendMessage({type: "authReq"});

	if(!response.authorized) {
		console.log("I am not authorized");
		return;
	}

	console.log("Oh, let's go, I am authorized!");

	response = await chrome.runtime.sendMessage({type: "bbHeightReq"});

	let browser_bar_height = parseInt(response.height);

	console.log("Altezza barra browser: "+browser_bar_height);

	if(!browser_bar_height) {

		alert("Non posso cliccare correttamente se l'altezza della barra non è definita!!");
		return;

	}

	let selectors={
		uploadWrapper: ".Styles_uploadBtnInputDiv__rucrS",
		uploadBtn: "#inputFile",
		mainDownloadBtn: ".styles_mainHeaderDownload__RpKfb",
		subDownloadBtn: ".styles_downloadBtns__g4cL3"
	};

	//prende il div che contiente il steso Upload e lo passa a getScreenCoordinates

	let uploadButton = await new Promise(function(resolve,reject) {

		let handler = setInterval(function() {

			let candidates = [...document.querySelectorAll("div")].filter(function(e) {
				return e.innerText.trim() === "Upload";
			});
			if(!candidates.length) {
					reject("Non trovo il pulsante upload");
					clearInterval(handler);
				return;
			}

			resolve(candidates[0]);
			clearInterval(handler);

		},
		1000);

	});

	let coordinates = getScreenCoordinates(uploadButton, browser_bar_height);

	console.log(coordinates);

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


function getScreenCoordinates(element, browser_bar_height=86) {

	if (!element) {
	  console.warn("Elemento non definito");
	  return null;
	}
  
	const rect = element.getBoundingClientRect();
  
	const screenX = Math.ceil(window.screenX + rect.left + rect.width/2);
	const screenY = Math.ceil(window.screenY + rect.top + browser_bar_height + rect.height/2);
  
	return {
	  x: screenX,
	  y: screenY
	};
}
