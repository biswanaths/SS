var first = false; 
var note;

var fields = {};
var labels = {};

var showInfo = function (field,value) {
    console.log("Show Info is invoked");	
	if(first == false) {
		var d = document.createElement('div');
		d.id = 'note_diigo';
		d.class = "diigo_note_app_maximize";
	
		var f = document.createElement('iframe');
		f.src = chrome.extension.getURL('note.html');
		f.id = "note_wrap_diigo";
	
		d.appendChild(f);
		document.body.appendChild(d); // append to body, for example.
		//$("body").append("<div id='note_diigo' class='diigo_note_app_maximize'><iframe src='note.html' frameborder='0' id='note_wrap_diigo'></iframe></div>");
		first = true;
		note = f;
	}
	
	console.log(note);
	
	var doc = note.contentDocument || note.contentWindow.document;
	
	var cdiv = doc.getElementById(field);
	if(cdiv)  {
		// do nothing
	} else {		
	    cdiv = doc.createElement('div');
		cdiv.id = field;	
		doc.getElementById("editor").appendChild(cdiv);
	}	
	cdiv.textContent = field + " : " + value;	
}
var showAnotherInfo = function () {
    console.log("Show Another Info");
}
chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.functiontoInvoke == "showInfo") {		
        showInfo(message.field,message.value);
    }
    if (message.functiontoInvoke == "showAnotherInfo") {
        showAnotherInfo();
    }
});