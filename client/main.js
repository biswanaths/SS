// Author : Biswanath 
// Date : May 8th, 2013

function fieldPopulateAction(info,tab) { 
	//var bkg = chrome.extension.getBackgroundPage();
	console.log("item " + info.menuItemId + " was clicked");
	console.log("info: " + JSON.stringify(info));
	console.log("tab: " + JSON.stringify(tab));	
	//alert(JSON.stringify(info));
	//alert(JSON.stringify(tab));
	chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            "functiontoInvoke": "showInfo",
			"field" : idTitleMap[info.menuItemId],
			"value": info.selectionText
        });
    });
}

// Create one test item for each context type.
var contexts = ["selection"];
var context = contexts[0]; 

var idTitleMap = {};

var fieldsToPopulate = [ "reviewer","comment"];
console.log("something");

for(var i = 0; i < fieldsToPopulate.length; i++) { 
	var title = fieldsToPopulate[i];
	var id = chrome.contextMenus.create( {"title":title, "contexts":[context], "onclick": fieldPopulateAction});
	idTitleMap[id] = title;
}


