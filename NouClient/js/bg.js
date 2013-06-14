//chrome.runtime.reload();
//location.reload()
var data = {};

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
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
				CreateMenus(request.data);
				break;
			case 'createsideview':
				CreateSideView();
			default:
				sendResponse({message:'Not handling this message'});
		}		
	}
);

function CreateMenus(fields) { 
	chrome.contextMenus.removeAll();
	for(var i=0;i<fields.length;i++) { 
		var id = fields[i].id;
		var name = fields[i].name;
		chrome.contextMenus.create( 
			{
				id : id.toString(), 
				title : name,
				contexts : [ "selection"],
				onclick : function( info,tab) { 
					console.log(info);
					data[id] = info.selectionText;
					data[name] = info.selectionText;
					var message = {};
					message.action = "showfield";
					message.field = {};
					message.field[id] = info.selectionText;
					message.field[name] = info.selectionText;
					SendMessage(message,function() {});
				}
			}
		);
		console.log("created " + fields[i]);
	}
}


function SendMessage(message) { 
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(
			tabs[0].id,
			message, 
			function(response) {console.log("sent the field value to be displayed.");});  
	});
	console.log("Passing the field to the page to be displayed.");
}

