/* global new_block,formatDate, randStr, bag, $, clear_blocks, document, WebSocket, escapeHtml, window */
var ws = {};
var user = {username: bag.setup.USER1};
var bgcolors = ['whitebg', 'blackbg', 'redbg', 'greenbg', 'bluebg', 'purplebg', 'pinkbg', 'orangebg', 'yellowbg'];

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	connect_to_server();
	$('input[name="name"]').val('r' + randStr(6));
	$('select option[value="' + bag.setup.USER1 + '"]').attr('selected', true);
	
	// =================================================================================
	// jQuery UI Events
	// =================================================================================
	$('#register').click(function(){
		// registry code
		var regTransaction = {
				type: 'register',
				timestamp: '\'' + jQuery.now() + '\'',
				jurisdiction: $('select[name="jurisdiction"]').val(),
				name: $('input[name="corporateName"]').val(),
				number: $('input[name="corporationNumber"]').val(),
				directorName: $('input[name="firstName"]').val() + " " + $('input[name="lastName"]').val(),
				address: $('input[name="streetAddress"]').val() + " " + $('input[name="city"]').val() + " " + $('select[name="province"]').val() + " " + $('input[name="postalCode"]').val(),
				email: $('input[name="email"]').val(),
				date: $('input[name="fillingDate"]').val(),
				status: 'registered'
		};
		console.log('Executing REGISTRY transaction', regTransaction);
		ws.send(JSON.stringify(regTransaction));
		
		return false;
	});

	$('#nameChange').click(function(){
		var nameChangeTransaction = {
				type: 'nameChange',
				jurisdiction: $('select[name="nameChangeJurisdiction"]').val(),
				name: $('input[name="nameChangeCorporateName"]').val(),
				newname: $('input[name="nameChangeNewCorporateName"]').val()
		};
		console.log('Executing NAME CHANGE transaction', nameChangeTransaction);
		ws.send(JSON.stringify(nameChangeTransaction));
		return false;
	});	

	$('#report').click(function(){
		var reportTransaction = {
				type: 'report',
				jurisdiction: $('select[name="reportJurisdiction"]').val(),
				name: $('input[name="reportCorporateName"]').val(),
				address: $('input[name="reportStreetAddress"]').val() + " " + $('input[name="reportCity"]').val() + " " + $('select[name="reportProvince"]').val() + " " + $('input[name="reportPostalCode"]').val(),
				date: $('input[name="reportReportingDate"]').val()
		};
		console.log('Executing REPORT transaction', reportTransaction);
		ws.send(JSON.stringify(reportTransaction));
		return false;
	});
	
	$('#dissolve').click(function(){
		var dissolveTransaction = {
				type: 'dissolve',
				jurisdiction: $('select[name="dissolveJurisdiction"]').val(),
				name: $('input[name="dissolveCorporateName"]').val()
		};
		console.log('Executing DISSOLVE transaction', dissolveTransaction);
		ws.send(JSON.stringify(dissolveTransaction));
		return false;
	});

	// load the list of corporations
	$('#corporationsLink').click(function(){
		// Get the corporations on webpage load
		ws.send(JSON.stringify({type: 'get_corporations'}));
	});

});


// =================================================================================
// Socket Stuff
// =================================================================================
function connect_to_server(){
	var connected = false;
	connect();
		
	function connect(){
		var wsUri = 'ws://' + document.location.hostname + ':' + document.location.port;
		console.log('Connectiong to websocket', wsUri);
		
		ws = new WebSocket(wsUri);
		ws.onopen = function(evt) { onOpen(evt); };
		ws.onclose = function(evt) { onClose(evt); };
		ws.onmessage = function(evt) { onMessage(evt); };
		ws.onerror = function(evt) { onError(evt); };
	}
	
	function onOpen(evt){
		console.log('WS CONNECTED');
		connected = true;
		clear_blocks();
		$('#errorNotificationPanel').fadeOut();
		ws.send(JSON.stringify({type: 'chainstats', v:2}));
		ws.send(JSON.stringify({type: 'get_open_trades', v: 2}));
		ws.send(JSON.stringify({type: 'get', v:2}));
		
		// Registry Code
		// Get the transactions on webpage load
		ws.send(JSON.stringify({type: 'get_transactions'}));
		
		// Get the corporations on webpage load
		ws.send(JSON.stringify({type: 'get_corporations'}));
	}

	function onClose(evt){
		console.log('WS DISCONNECTED', evt);
		connected = false;
		setTimeout(function(){ connect(); }, 5000);					//try again one more time, server restarts are quick
	}

	function onMessage(msg){
		// Registry Code
		try {
			var msgObj = JSON.parse(msg.data);
			if(msgObj.msg === 'transactions'){
				console.log('transactions', msgObj.msg, msgObj);
				build_transactions(msgObj.transactions);
			}
			else if(msgObj.msg === 'register') {
				console.log('register!!!', msgObj.msg, msgObj);
				// confirm successful push onto blockchain
				//$('#corporationsPanel').fadeIn(300);
				//$('#registerPanel').hide();
				 
			}
			else if(msgObj.msg === 'corporations'){
				console.log('corporations', msgObj.msg, msgObj);
				build_corporations(msgObj.corporations);
			}
		}
		catch(e){
			console.log('ERROR', e);
			//ws.close();
		}	
	
		
	}

	function onError(evt){
		console.log('ERROR ', evt);
		if(!connected && bag.e == null){											//don't overwrite an error message
			$('#errorName').html('Warning');
			$('#errorNoticeText').html('Waiting on the node server to open up so we can talk to the blockchain. ');
			$('#errorNoticeText').append('This app is likely still starting up. ');
			$('#errorNoticeText').append('Check the server logs if this message does not go away in 1 minute. ');
			$('#errorNotificationPanel').fadeIn();
		}
	}
}


// =================================================================================
//	UI Building
// =================================================================================
// Registry Code

function build_transactions(transactions){
	console.log('Building transactions table');
	var html = '';
	for(var i in transactions){
		console.log(transactions[i]);
		var style = ' ';
		
		//if(user.username.toLowerCase() == trades[i].user.toLowerCase()){				//only show trades with myself
			html += '<tr class="' + style + '">';
			html +=		'<td>' + transactions[i].corporationName + '</td>';
			html +=		'<td>' + transactions[i].transactionType + '</td>';
			html +=		'<td>' + transactions[i].datetime + '</td>';
			html +=		'<td>' + transactions[i].jurisdiction + '</td>';
			html +=		'<td>' + transactions[i].emailAddress + '</td>';
			html +=		'<td>' + transactions[i].mailingAddress + '</td>';
			html +=		'<td>' + transactions[i].uniqueID + '</td>';
			html +=		'<td></td>';
			html += '</tr>';
		//}
	}
	if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
	$('#myTransactionsBody').html(html);
}

function build_corporations(corporations){
	console.log('Building corporation table');
	var html = '';
	for(var i in corporations){
		console.log(corporations[i].name + " " + corporations[i].number);
		var style = ' ';
		
		//if(user.username.toLowerCase() == trades[i].user.toLowerCase()){				//only show trades with myself
			html += '<tr class="' + style + '">';
			html +=		'<td>' + corporations[i].name + '</td>';
			html +=		'<td>' + corporations[i].number + '</td>';
			html +=		'<td>' + corporations[i].date + '</td>';
			html +=		'<td>' + corporations[i].jurisdiction + '</td>';
			html +=		'<td>' + corporations[i].directorName + '</td>';
			html +=		'<td>' + corporations[i].email + '</td>';
			html +=		'<td>' + corporations[i].address + '</td>';
			html +=		'<td>' + corporations[i].status + '</td>';
			html +=		'<td></td>';
			html += '</tr>';
		//}
	}
	if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
	$('#corporationsBody').html(html);
}


function filterCorporation() {
	  console.log("Filter the results!!");
	  // Declare variables
	  var input, filter, table, tr, td, i;
	  input = document.getElementById("corporationNameFilter");
	  filter = input.value.toUpperCase();
	  table = document.getElementById("registryTransactionsTable");
	  tr = table.getElementsByTagName("tr");

	  // Loop through all table rows, and hide those who don't match the search query
	  for (i = 0; i < tr.length; i++) {
	    td = tr[i].getElementsByTagName("td")[0];
	    if (td) {
	      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
	        tr[i].style.display = "";
	      } else {
	        tr[i].style.display = "none";
	      }
	    }
	  }
	}

function filterProvinces() {
	console.log('Filter by jurisdiction!');
	var input, filter, table, tr, td, i;
	  //input = document.getElementById("myInput");
	  //filter = input.value.toUpperCase();
	  table = document.getElementById("registryTransactionsTable");
	  tr = table.getElementsByTagName("tr");
	  
	  var filter = $('select[name="jurisdictionFilter"]').val();
	  
	  console.log('Filter on ' + filter);
	  
	  if (filter == 'ALL') {
		  // Show all
		  for (i = 0; i < tr.length; i++) {
			  td = tr[i].getElementsByTagName("td")[3];
			  	if (td) {
			        tr[i].style.display = "";
			    }
			  }
	  }
	  else {
		  for (i = 0; i < tr.length; i++) {
		    td = tr[i].getElementsByTagName("td")[3];
		    if (td) {
		    	console.log(td.innerHTML);
		      if (td.innerHTML.indexOf(filter) > -1) {
		        tr[i].style.display = "";
		      } else {
		        tr[i].style.display = "none";
		      }
		    }
		  }
	  }
}
