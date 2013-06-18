//chrome.runtime.reload();
//location.reload()
var data = {};

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
		console.log("listern on bg.js listened type:" + request.type + " data:" +request.data);
		console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
		console.log(" Message " + request);
		console.log(request.type);
		switch(request.type) {
			case 'hello':
				sendResponse({farewell: "goodbye"});
				break;
			case 'createmenu':
				createMenus(request.data);
				break;		
			case 'add':
				console.log('Sending message');
				chrome.tabs.sendMessage(sender.tab.id,request);
				console.log('Message sent');
				break;
			default:
				sendResponse({message:'Not handling this message'});
		}		
	}
);

function createMenus(fields) { 
	chrome.contextMenus.removeAll();	
	var funcs = new Array(fields.length); 
	for(var i=0;i<fields.length;i++) { 
		var id = fields[i].id; 
		var name = fields[i].name;
		funcs[i] = function(id,name) { 
			var localid = id, localname = name;			
			return function(info,tab) {				
				var message = {} ; 
				message.action = "showfield"; 
				message.field = {};
				message.field["id"] = localid;
				message.field["name"] = localname;
				message.field[localid] = info.selectionText;
				message.field[localname] = info.selectionText;
				sendMessage(message,function() {});
			}}(id,name);
	}
	
	
	for(var i=0;i<fields.length;i++) { 
		var id = fields[i].id;
		var name = fields[i].name;
		chrome.contextMenus.create( 
			{
				id : id.toString(), 
				title : name,
				contexts : [ "selection"],
				onclick : funcs[i]
			}
		);
		console.log("created " + fields[i]);
	}
}


function sendMessage(message) { 
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){		
		chrome.tabs.sendMessage(
			tabs[0].id,
			message, 
			function(response) {console.log("sent the field value to be displayed.");});  
	});
	console.log("Passing the field to the page to be displayed.");
}

