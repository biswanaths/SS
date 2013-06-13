var data = {};

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
		console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
		console.log(" Message " + request);
		if (request.type == "hello")
            sendResponse({farewell: "goodbye"});
		else if(request.type === 'createmenu') 
			CreateMenus(request.data)
	}
);



function CreateMenus(fields) { 
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
				}
			}
		);
		console.log("created " + fields[i]);
	}
}