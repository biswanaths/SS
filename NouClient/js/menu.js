function Get(url, onSuccess) {
	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
		console.log(xhr.readyState);
		console.log(xhr);
        if (xhr.readyState == 4) {
			if(xhr.status === 200 ) 
				onSuccess(xhr.responseText);
        }
    }
    xhr.send();
}

function SendMessage(type, data) { 
	var request = { }; 
	request.type = type; 
	request.data = data; 
	chrome.extension.sendMessage(request, function(response) {
            console.log(response);
    });
	console.log("message sent.");
}

function GetMenus() {
    
	var host = window.location.host;
	var baseUrl  = "http://localhost:11080";
	host = "fb.com";
	var urlToProblemDomain = baseUrl + "/url/" + host;	
	console.log("menu get");	

	var onSuccess = function(responseText) { 
		var fieldsUrl = baseUrl + "/plugin/" + responseText;
		Get(fieldsUrl, function(responseText) { 
			var fields = JSON.parse(responseText);
			console.log(fields);
			SendMessage('createmenu',fields);
		});		
    }
	
	Get(urlToProblemDomain,onSuccess);
}


function getSidebar() {
	var s = document.getElementById('note_diigo');
	getSidebar = function() { return s; };
	return s;
}

function getSelectionHTML() { 										// http://snipplr.com/view/10912/get-html-of-selection/
  var userSelection = window.getSelection();
	if (userSelection.isCollapsed) 
		return '';
	else {
		var range = userSelection.getRangeAt(0);
		var clonedSelection = range.cloneContents();
		var div = document.createElement('div');
		div.appendChild(clonedSelection);
		
		//convert relative address to absolute
		var hrefs = div.querySelectorAll('[href]');
		for (var i=0, len=hrefs.length; i<len; i++) 
			hrefs[i].href = hrefs[i].href;
		var srcs = div.querySelectorAll('[src]');
		for (var i=0, len=srcs.length; i<len; i++) 
			srcs[i].src = srcs[i].src;
		
		console.log(div.innerHTML);
		return div.innerHTML;
	}
}

document.addEventListener(
	'mousedown', 
	function(e) {
		if (e.which != 3) return;
		console.log("This is working."); 
		var selectionText = getSelectionHTML();
		console.log(selectionText);
		chrome.extension.sendMessage(selectionText, function(response) {
            console.log(response);
        });
		// chrome.extension.sendRequest({
			// name:'update_menu', 
			// selection:getSelectionHTML(),
			// status:getSidebar() ? getSidebar().className : ''
			// //sidebar:getSidebar() ? true : false
			// /* status:getSidebar() ? getSidebar().className : '',  */
			// /* noSelection:getSelection().isCollapsed */ //isCollapsed: http://help.dottoro.com/ljikwsqs.php
		// }); 
	}, 
	false
);

function CreateSideView(request) {

	var newiframe = document.createElement('iframe');
	console.log("Creating the iframe");
	newiframe.src=chrome.extension.getURL('note.html');
	newiframe.setAttribute('frameborder','2');
	newiframe.id = 'note_wrap_diigo';
	var newdiv = document.createElement('div');
	newdiv.id="note_diigo";
	newdiv.className="diigo_note_app_maximize";
	newdiv.appendChild(newiframe);
	console.log("appended the iframe to the page.");
	document.body.appendChild(newdiv);	
	console.log("appended the div to the page.");
	
	// window.addEventListener('keydown', handleKeydown, false);
	
	// init = function(request) {
		// var s = getSidebar(),
			// c = s.className;
		
		// if (getSelectionHTML()) { // from menu.js - check if has selection
			// chrome.extension.sendRequest({name:'get_selection'});
		// }
		// else {
			// switch(c) {
			// case 'diigo_note_app_maximize':
				// c = 'diigo_note_app_minimize';
				// break;
			// case 'diigo_note_app_minimize':
				// c = 'diigo_note_app_maximize';
				// break;
			// case 'diigo_note_app_close':
				// c = 'diigo_note_app_maximize';
				// break;
			// }
			// s.className = c;
			// //chrome.extension.sendRequest({name:'action', action:c});
		// }
	// };
}

var dataviewcreated = false; 
GetMenus();

chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.action == "showfield") {		
		if(dataviewcreated == false ) 
			CreateSideView();
        //showInfo(message.field,message.value);
    }    
});
