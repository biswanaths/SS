var noteId = 0, timerId = null;


var util = {
    isLink: function(link) {
        return (/http:|https:|ftp:/.test(link.split('/')[0])) ? true : false;
    },
    sendRequest: function(req) {
       // chrome.extension.sendRequest(req);
    },
    updateTitle: function(t) {
        $('#title input').val(t);
    },
    updateSaveBtn: function(t) {
        $('#save').val(t);
    },
    getNoteDoc: function() {
        var doc = $('#editor iframe')[0].contentDocument;
        util.getNoteDoc = function() {
            return doc;
        };
        return doc;
    },
    getTopDoc: function() {
        var doc = top.document;
        util.getTopDoc = function() {
            return doc;
        };
        return doc;
    },
	cleanStyles: function(e) { //Function takes from readability
		e = e || document;
		var cur = e.firstChild;

		// If we had a bad node, there's not much we can do.
		if(!e)
			return;

		// Remove any root styles, if we're able.
		if(typeof e.removeAttribute == 'function')
			e.removeAttribute('style');

		// Go until there are no more child nodes
		while ( cur != null ) {
			if ( cur.nodeType == 1 ) {
				// Remove style attribute(s) :
				cur.removeAttribute("style");
				util.cleanStyles( cur );
			}
			cur = cur.nextSibling;
		}
	},
    addSelection: function(s) {
        if(!s) return;
				$(util.getNoteDoc().body).append(s);
				//util.cleanStyles(null);
				note.save({data:'desc', selection:s});
    },
    disableAutoType: function() {
        $('#title>input').addClass('typed');
        util.disableAutoType = function(){};
    }
};	

var note = {
	init: function(request) {
		
		$('#editor>textarea').rte({
			css: ['css/text.css', 'css/notearea.css'],
			width: 260
		}); 		
		
		$('#action').click(function(e) {
			if (e.target.tagName!='LI') return;
			
			var action = e.target.id;
			if (action == 'app') 
				return util.sendRequest({name:'open_app'});
			setTimeout(function() {$('body')[0].className = action}, action=='maximize'?100:0); //avoid close button appears before notepad streching fully
			
			top.postMessage(action, '*');
		});
		
		$('input.save').click(function(e) { 
			top.postMessage('save','*');
		});
    },
	showField : function(field) {						
		
		var html = "<div id='" + field["id"] + "'> " +
						" <div class='name' > " + field["name"] + " </div> " + 
						" <p class='value'> " + field[field["id"]] + " </p> " + 
					"</div>"
					
		$("#editor #" + field["id"]).remove();		
		$("#editor").append(html);			
	}
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {	
		//console.log("listern on note.js listened type:" + request.type + " data:" +request.data);
		switch(request.type) {
			case 'check_url':
				note.init(request);
				break;
			case 'add':	
				note.showField(request.data);
				break;
			case 'save_note':
				break;
			case 'delete':
				note.save({data:'add'});
				break;
			case 'get_selection':
				util.addSelection(request.selection);
				break;
			case 'action':
				document.body.className = request.action.replace('diigo_note_app_', '');
				break;
		}
});
    //util.updateSaveBtn('Saved');

$(document).ready(function() {
	top.postMessage('check_url', '*');		// send msg to content.js
	note.init();
});