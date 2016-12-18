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

    // load the list of transactions
    $('#transactionsLink').click(function(){
        // Get the corporations on webpage load
        //ws.send(JSON.stringify({type: 'get_transactions'}));
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
        //clear_blocks();
        $('#connectionStatusMessage').fadeOut();
        //$('#connectionStatusMessage').html('Connected');

        // Get the transactions on webpage load
        ws.send(JSON.stringify({type: 'get_transactions'}));

        // Get the corporations on webpage load
        ws.send(JSON.stringify({type: 'get_corporations'}));
        
        $('#loadingStatusMessage').html('Loading transactions...');
    }

    function onClose(evt){
        console.log('WS DISCONNECTED', evt);
        connected = false;
        $('#connectionStatusMessage').fadeIn();
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
            else if(msgObj.msg === 'loadStats'){
                console.log('loadStats', msgObj.msg, msgObj);
                 $('#loadingStatusMessage').html('Reading transactions from blockchain: ' + msgObj.loadingBlock + ' remaining blocks');
                if (msgObj.loadingBlock === 1) {
                     $('#loadingStatusMessage').html('');
                }
            }
        }
        catch(e){
            console.log('ERROR', e);
            //ws.close();
        }	
    }

    function onError(evt){
        console.log('ERROR ', evt);
        if(!connected){											//don't overwrite an error message
            $('#connectionStatusMessage').html('<img src="./imgs/warning.png"><b>Warning:</b> Waiting on the node server to open up so we can talk to the blockchain. The app is likely still starting up. Check the server logs if this message does not go away in 1 minute.');
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
            data += '' + transactions[i].corporationNumber + ' ';
        }
        if (transactions[i].directorName) {
            data += '' + transactions[i].directorName + ' ';
        }
        if (transactions[i].address) {
            data += '' + transactions[i].address + ' ';
        }
        if (transactions[i].email) {
            data += '' + transactions[i].email + ' ';
        }
        if (transactions[i].date) {
            data += '' + transactions[i].date + ' ';
        }
        if (transactions[i].status) {
            data += '' + transactions[i].status + ' ';
        }
        if (transactions[i].oldName) {
            data += 'Old Name: ' + transactions[i].oldName;
        }
        if (transactions[i].corporation1Name && transactions[i].corporation1Jurisdiction &&
            transactions[i].corporation2Name && transactions[i].corporation2Jurisdiction) {
            data += '<div>Corporations Amalgamated:</div>'
            data += '<div>1: ' + transactions[i].corporation1Name + ' ' + transactions[i].corporation1Jurisdiction + '</div>';
            data += '<div>2: ' + transactions[i].corporation2Name + ' ' + transactions[i].corporation2Jurisdiction + '</div>';
        }


        var style = ' ';
        html += '<tr class="' + style + '">';
        html +=		'<td>' + transactions[i].corporationName + '</td>';
        html +=		'<td>' + transactions[i].jurisdiction + '</td>';
        html +=		'<td>' + transactions[i].transactionType + '</td>';
        html +=		'<td>' + data + '</td>';
        html +=		'<td>' + transactions[i].block + '</td>';
        html +=		'<td>' + transactions[i].timestamp + '</td>';
        html +=		'<td></td>';
        html += '</tr>';
    }
    if(html === '') html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';

    if (transactions[i].newBlock) {
        $('#myTransactionsBody').prepend(html);
    }
    else {
        $('#myTransactionsBody').append(html);
    }
   
}

function build_corporations(corporations){
    console.log('Building corporation table');
    var html = '';
    //for(var i in corporations){
    for (var i= corporations.length-1; i>=0; i--) {
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


function filterTransactionsByCorporation() {
    console.log("Filter the results!!");
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("corporateNameTransactionsFilter");
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

function filterCorporationsByName() {
    console.log("Filter by corporationName");
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("corporateNameFilter");
    filter = input.value.toUpperCase();
    table = document.getElementById("corporationsTable");
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

var jurisdictions = [];

function buildJurisdictionFilter(jurisdiction) {
    if (document.getElementById(jurisdiction).checked) {
        //console.log(jurisdiction + " is checked");
        jurisdictions.push(jurisdiction);
    }
    else {
        //console.log(jurisdiction + " is unchecked");
        var index = jurisdictions.indexOf(jurisdiction);
        if (index > -1) {
            jurisdictions.splice(index, 1);
        }
    }
}

function filterTransactionsByJurisdiction() {
    console.log('Filter by jurisdiction!');
    var input, table, tr, td, i;

    table = document.getElementById("registryTransactionsTable");
    tr = table.getElementsByTagName("tr");

    jurisdictions = [];

    buildJurisdictionFilter('AB');
    buildJurisdictionFilter('BC');
    buildJurisdictionFilter('MB');
    buildJurisdictionFilter('NB');
    buildJurisdictionFilter('NL');
    buildJurisdictionFilter('NT');
    buildJurisdictionFilter('NS');
    buildJurisdictionFilter('NU');
    buildJurisdictionFilter('ON');
    buildJurisdictionFilter('PE');
    buildJurisdictionFilter('QC');
    buildJurisdictionFilter('SK');
    buildJurisdictionFilter('YT');
    buildJurisdictionFilter('FED');

    console.log('Jurisdiction Count:' + jurisdictions.length);
    // if the array is empty show all
    if (jurisdictions.length === 0) {
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                tr[i].style.display = "";
            }
        }
    }
    else {
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                // iterate over jurisdictions to display and check
                for (index = 0; index < jurisdictions.length; ++index) {

                    if (td.innerHTML.indexOf(jurisdictions[index]) > -1) {
                        tr[i].style.display = "";
                        break;  // once found break out of here
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }
}