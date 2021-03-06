﻿var data = {};
var problemDomainId = null;

function hasClass(ele,cls) {
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
	if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}

function getSidebar() {
	var s = document.getElementById('note_diigo');
	getSidebar = function() { return s; };
	return s;
}

function get(url, onSuccess) {
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

function post(url,data, onSuccess) { 
	var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
	var serializedData = JSON.stringify(data);
    xhr.onreadystatechange = function() {
		console.log(xhr.readyState);
		console.log(xhr);
        if (xhr.readyState == 4) {
			if(xhr.status === 200 ) 
				if(typeof onSuccess != 'undefined')
					onSuccess(xhr.responseText);
        }
    }
    xhr.send(serializedData);
}

function sendMessage(type, data) { 
	var request = { }; 
	request.type = type; 
	request.data = data; 
	chrome.extension.sendMessage(request, function(response) {
            console.log(response);
    });
	console.log("message sent.");
}

function getMenus() {
    
	var host = window.location.host;
	var baseUrl  = "http://setuserv-demo.appspot.com";
	//host = "fb.com";
	var urlToProblemDomain = baseUrl + "/url/" + host;	
	console.log("menu get");	

	var onSuccess = function(responseText) { 
		data["problemdomain_id"] = responseText;
		var fieldsUrl = baseUrl + "/plugin/" + responseText;
		get(fieldsUrl, function(responseText) { 
			var fields = JSON.parse(responseText);
			console.log(fields);
			sendMessage('createmenu',fields);
		});		
    }
	
	get(urlToProblemDomain,onSuccess);	
}


function createSidePanel() {
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
	createSidePanel = function() { return; }		
}

function save() { 
	var url = "http://setuserv-demo.appspot.com/data/save";
	post(url,data,function(response) { getSidebar().className = 'diigo_note_app_close';});
}


getMenus();


chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.action == "showfield") {				
		createSidePanel();			
		sendMessage('add',message.field);
		var name  = message.field["name"];
		var value = message.field[name]; 
		data[name] = value;
    }    
});


window.addEventListener("message", function(e){ 		// listen msg from note.js
	if(e.data=="maximize" || e.data =="minimize" || e.data=="close")
		getSidebar().className = 'diigo_note_app_'+e.data;
	else if(e.data == "save") 
		save();
}, false);