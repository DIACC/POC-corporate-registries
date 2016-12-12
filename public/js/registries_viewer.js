var ws = {};

var corporations = '';
var delimiter = "";
var delimiterlength = 0;

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	connect_to_server();

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
		
		// Get chain stats
		ws.send(JSON.stringify({type: 'chainstats', v:2}));
		
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
				console.log('transactions from register_viewer', msgObj.msg, msgObj);
				build_transactions(msgObj.transactions);
			}
			else if(msgObj.msg === 'corporations'){
				console.log('corporations', msgObj.msg, msgObj);
				build_corporations(msgObj.corporations);
				corporations = msgObj.corporations;
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
		var data = '';
        
        if (transactions[i].corporationNumber) {
            data += '' + transactions[i].corporationNumber + '<br>';
        }
        if (transactions[i].directorName) {
            data += '' + transactions[i].directorName + '<br>';
        }
        if (transactions[i].address) {
            data += '' + transactions[i].address + '<br>';
        }
        if (transactions[i].email) {
            data += '' + transactions[i].email + '<br>';
        }
        if (transactions[i].date) {
            data += '' + transactions[i].date + '<br>';
        }
        if (transactions[i].status) {
            data += '' + transactions[i].status + '<br>';
        }
        
		var style = ' ';
			html += '<tr class="' + style + '">';
			html +=		'<td>' + transactions[i].timestamp + '</td>';
			html +=		'<td>' + transactions[i].corporationName + '</td>';
			html +=		'<td>' + transactions[i].jurisdiction + '</td>';
			html +=		'<td>' + transactions[i].transactionType + '</td>';
			html +=		'<td>' + data + '</td>';
			html +=		'<td>' + transactions[i].block + '</td>';
			html +=		'<td></td>';
			html += '</tr>';
	}
	if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
    
    //$('#myTransactionsBody').append(html);
    $('#myTransactionsBody').prepend(html);
}

function build_corporations(corporations){
	console.log('Building corporation table');
	var html = '';
	for(var i in corporations){
		console.log(corporations[i].name.substring(0,delimiterlength) + " " + corporations[i].number.substring(0,delimiterlength));
		var style = ' ';
			html += '<tr class="' + style + '">';
			html +=		'<td>' + corporations[i].name.substring(0,corporations[i].name.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].number.substring(0,corporations[i].number.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].date.substring(0,corporations[i].date.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].jurisdiction.substring(0,corporations[i].jurisdiction.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].directorName.substring(0,corporations[i].directorName.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].email.substring(0,corporations[i].email.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].address.substring(0,corporations[i].address.length - delimiterlength) + '</td>';
			html +=		'<td>' + corporations[i].status.substring(0,corporations[i].status.length - delimiterlength) + '</td>';
			html +=		'<td></td>';
			html += '</tr>';
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
