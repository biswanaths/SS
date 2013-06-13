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

GetMenus();