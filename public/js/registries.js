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

});


// =================================================================================
// Helper Fun
// =================================================================================
//transfer selected ball to user
function transfer(marbleName, user){
	if(marbleName){
		console.log('transfering', marbleName);
		var obj = 	{
						type: 'transfer',
						name: marbleName,
						user: user,
						v: 2
					};
		ws.send(JSON.stringify(obj));
	}
}

function sizeMe(mm){
	var size = 'Large';
	if(Number(mm) == 16) size = 'Small';
	return size;
}

function find_trade(timestamp){
	for(var i in bag.trades){
		if(bag.trades[i].timestamp){
			return bag.trades[i];
		}
	}
	return null;
}

function find_valid_marble(user, color, size){				//return true if user owns marble of this color and size
	for(var i in bag.marbles){
		if(bag.marbles[i].user.toLowerCase() == user.toLowerCase()){
			//console.log('!', bag.marbles[i].color, color.toLowerCase(), bag.marbles[i].size, size);
			if(bag.marbles[i].color.toLowerCase() == color.toLowerCase() && bag.marbles[i].size == size){
				return bag.marbles[i].name;
			}
		}
	}
	return null;
}


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
			}
		}
		catch(e){
			console.log('ERROR', e);
			//ws.close();
		}	
	
		// Marbles Code	
		try{
			var msgObj = JSON.parse(msg.data);
			if(msgObj.marble){
				console.log('rec', msgObj.msg, msgObj);
				build_ball(msgObj.marble);
				set_my_color_options(user.username);
			}
			else if(msgObj.msg === 'chainstats'){
				console.log('rec', msgObj.msg, ': ledger blockheight', msgObj.chainstats.height, 'block', msgObj.blockstats.height);
				var e = formatDate(msgObj.blockstats.transactions[0].timestamp.seconds * 1000, '%M/%d/%Y &nbsp;%I:%m%P');
				$('#blockdate').html('<span style="color:#fff">TIME</span>&nbsp;&nbsp;' + e + ' UTC');
				var temp = { 
								id: msgObj.blockstats.height, 
								blockstats: msgObj.blockstats
							};
				new_block(temp);									//send to blockchain.js
			}
			else if(msgObj.msg === 'reset'){							//clear marble knowledge, prepare of incoming marble states
				console.log('rec', msgObj.msg, msgObj);
				$('#user2wrap').html('');
				$('#user1wrap').html('');
			}
			else if(msgObj.msg === 'open_trades'){
				console.log('rec', msgObj.msg, msgObj);
				build_trades(msgObj.open_trades);
			}
			else console.log('rec', msgObj.msg, msgObj);
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

// Marbles Code
function build_ball(data){
	var html = '';
	var colorClass = '';
	var size = 'fa-5x';
	var notYours = 'notyours';
	
	data.name = escapeHtml(data.name);
	data.color = escapeHtml(data.color);
	data.user = escapeHtml(data.user);
	
	if(!bag.marbles) bag.marbles = {};
	bag.marbles[data.name] = data;								//store the marble for posterity
	
	if(data.user.toLowerCase() == user.username.toLowerCase()) notYours = '';
	
	console.log('got a marble: ', data.color);
	if(!$('#' + data.name).length){								//only populate if it doesn't exists
		if(data.size == 16) size = 'fa-3x';
		if(data.color) colorClass = data.color.toLowerCase();
		
		html += '<span id="' + data.name + '" class="fa fa-circle ' + size + ' ball ' + colorClass + ' ' + notYours + '" title="' + data.name + '" user="' + data.user + '"></span>';
		if(data.user && data.user.toLowerCase() == bag.setup.USER1){
			$('#user1wrap').append(html);
		}
		else{
			$('#user2wrap').append(html);
		}
	}
	//console.log('marbles', bag.marbles);
}

function build_trades(trades){
	var html = '';
	bag.trades = trades;						//store the trades for posterity
	console.log('trades:', bag.trades);
	
	for(var i in trades){
		for(var x in trades[i].willing){
			//console.log(trades[i]);
			var style = ' ';
			var buttonStatus = '';
			
			if(user.username.toLowerCase() != trades[i].user.toLowerCase()){				//don't show trades with myself
				var name = find_valid_marble(user.username, trades[i].want.color, trades[i].want.size);
				if(name == null) {								//don't allow trade if I don't have the correct marble
					style = 'invalid';
					buttonStatus = 'disabled="disabled"';
				}
				html += '<tr class="' + style + '">';
				html +=		'<td>' + formatDate(Number(trades[i].timestamp), '%M/%d %I:%m%P') + '</td>';
				html +=		'<td>1</td>';
				html +=		'<td><span class="fa fa-2x fa-circle ' + trades[i].want.color + '"></span></td>';
				html +=		'<td>' + sizeMe(trades[i].want.size) + '</td>';
				html +=		'<td>1</td>';
				html +=		'<td><span class="fa fa-2x fa-circle ' + trades[i].willing[x].color + '"></span></td>';
				html +=		'<td>' + sizeMe(trades[i].willing[x].size) + '</td>';
				html +=		'<td>';
				html +=			'<button type="button" class="confirmTrade altButton" ' + buttonStatus + ' name="' + name + '" trade_pos="' + i + '" willing_pos="' + x + '">';
				html +=				'<span class="fa fa-exchange"> &nbsp;&nbsp;TRADE</span>';
				html +=			'</button>';
				html += 	'</td>';
				html += '</tr>';
			}
		}
	}
	if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
	$('#openTradesBody').html(html);
	
	build_my_trades(trades);
}

function build_my_trades(trades){
	var html = '';
	for(var i in trades){
		//console.log(trades[i]);
		var style = ' ';
		
		if(user.username.toLowerCase() == trades[i].user.toLowerCase()){				//only show trades with myself
			html += '<tr class="' + style + '">';
			html +=		'<td>' + formatDate(Number(trades[i].timestamp), '%M/%d %I:%m%P') + '</td>';
			html +=		'<td>1</td>';
			html +=		'<td><span class="fa fa-2x fa-circle ' + trades[i].want.color + '"></span></td>';
			html +=		'<td>' + sizeMe(trades[i].want.size) + '</td>';
			html +=		'<td>';
			for(var x in trades[i].willing){
				html +=		'<p>1 <span class="fa fa-2x fa-circle ' + trades[i].willing[x].color + '"></span>&nbsp; &nbsp;' + sizeMe(trades[i].willing[x].size) + '</p>';
			}
			html += 	'</td>';
			html +=		'<td><span class="fa fa-remove removeTrade" trade_timestamp="' + trades[i].timestamp + '"></span></td>';
			html += '</tr>';
		}
	}
	if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
	$('#myTradesBody').html(html);
}

function set_my_color_options(username){
	var has_colors = {};
	for(var i in bag.marbles){
		if(bag.marbles[i].user.toLowerCase() == username.toLowerCase()){		//mark it as needed
			has_colors[bag.marbles[i].color] = true;
		}
	}
	
	//console.log('has_colors', has_colors);
	var colors = ['white', 'black', 'red', 'green', 'blue', 'purple', 'pink', 'orange', 'yellow'];
	$('.willingWrap').each(function(){
		for(var i in colors){
			//console.log('checking if user has', colors[i]);
			if(!has_colors[colors[i]]) {
				//console.log('removing', colors[i]);
				$(this).find('.' + colors[i] + ':first').hide();
			}
			else {
				$(this).find('.' + colors[i] + ':first').show();
				//console.log('yep');
			}
		}
	});
}

function set_my_size_options(username, colorOption){
	var color = $(colorOption).attr('color');
	//console.log('color', color);
	var html = '';
	var sizes = {};
	for(var i in bag.marbles){
		if(bag.marbles[i].user.toLowerCase() == username.toLowerCase()){		//mark it as needed
			if(bag.marbles[i].color.toLowerCase() == color.toLowerCase()){
				sizes[bag.marbles[i].size] = true;
			}
		}
	}
	
	console.log('valid sizes:', sizes);
	for(i in sizes){
		html += '<option value="' + i + '">' + sizeMe(i) + '</option>';					//build it
	}
	$(colorOption).parent().parent().next('select[name="will_size"]').html(html);
}



