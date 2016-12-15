var ws = {};

var corporations = '';
var delimiter = "";
var delimiterlength = 0;

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
    connect_to_server();

    // =================================================================================
    // jQuery UI Events
    // =================================================================================
    $('#register').click(function(){
        var streetAddress = $('input[name="streetAddress"]').val();
        var city = $('input[name="city"]').val();
        var province = $('select[name="province"]').val();
        var postalCode = $('input[name="postalCode"]').val();
        var firstName = $('input[name="firstName"]').val();
        var lastName = $('input[name="lastName"]').val();

        // registry code
        var regTransaction = {
            type: 'register' + delimiter,
            //timestamp: '\'' + jQuery.now() + '\'',
            jurisdiction: $('select[name="jurisdiction"]').val() + delimiter,
            name: $('input[name="corporateName"]').val() + delimiter,
            number: $('input[name="corporationNumber"]').val() + delimiter,
            directorName: firstName + " " + lastName + delimiter,
            address: streetAddress + " " + city + " " + province + " " + postalCode + delimiter,
            email: $('input[name="email"]').val() + delimiter,
            date: $('input[name="fillingDate"]').val() + delimiter,
            status: 'Active'  + delimiter
        };
        
        if (!regTransaction.name || !regTransaction.jurisdiction || !regTransaction.number 
            || !firstName || !lastName || !streetAddress || !city || !province || !postalCode || !regTransaction.email || !regTransaction.date) {
            //console.log('Missing some values, please make sure all fields are complete!!');
            $('#registerValidationMessage').html('*Missing one or more fields, please make sure all fields are completed');
        }
        else {
            console.log('Executing REGISTRY transaction', regTransaction);
            ws.send(JSON.stringify(regTransaction));
        }
        return false;
    });
    
    $('#amalgamate').click(function(){
        var streetAddress = $('input[name="newCorporationStreetAddress"]').val();
        var city = $('input[name="newCorporationCity"]').val();
        var province = $('select[name="newCorporationProvince"]').val();
        var postalCode = $('input[name="newCorporationPostalCode"]').val();
        var firstName = $('input[name="newCorporationFirstName"]').val();
        var lastName = $('input[name="newCorporationLastName"]').val();

        // registry code
        var amalgamateTransaction = {
            type: 'amalgamate',
            //timestamp: '\'' + jQuery.now() + '\'',
            corporation1Name: $('input[name="corporation1Name"]').val(),
            corporation1Jurisdiction: $('select[name="corporation1Jurisdiction"]').val(),
            corporation1Status: 'Dissolved',
            corporation2Name: $('input[name="corporation2Name"]').val(),
            corporation2Jurisdiction: $('select[name="corporation2Jurisdiction"]').val(),
            corporation2Status: 'Dissolved',
            newCorporationJurisdiction: $('select[name="newCorporationJurisdiction"]').val(),
            newCorporationName: $('input[name="newCorporationCorporateName"]').val(),
            newCorporationNumber: $('input[name="newCorporationCorporationNumber"]').val(),
            newCorporationDirectorName: firstName + " " + lastName,
            newCorporationAddress: streetAddress + " " + city + " " + province + " " + postalCode,
            newCorporationEmail: $('input[name="newCorporationEmail"]').val(),
            newCorporationDate: $('input[name="newCorporationFillingDate"]').val(),
            newCorporationStatus: 'Active'
        };
        
        /*if (!amalgamateTransaction.name || !amalgamateTransaction.jurisdiction || !amalgamateTransaction.number 
            || !firstName || !lastName || !streetAddress || !city || !province || !postalCode || !amalgamateTransaction.email || !amalgamateTransaction.date) {
            //console.log('Missing some values, please make sure all fields are complete!!');
            $('#amalgamateValidationMessage').html('*Missing one or more fields, please make sure all fields are completed');
        }
        else {*/
            console.log('Executing AMALGAMATE transaction', amalgamateTransaction);
            ws.send(JSON.stringify(amalgamateTransaction));
        //}
        return false;
    });

    $('#nameChange').click(function(){		
        var nameChangeTransaction = {
            type: 'nameChange' + delimiter,
            jurisdiction: $('select[name="nameChangeJurisdiction"]').val() + delimiter,
            name: $('input[name="nameChangeCorporateName"]').val() + delimiter,
            newName: $('input[name="nameChangeNewCorporateName"]').val() + delimiter
        };
        
        /*if (!corporationExists(nameChangeTransaction.name, nameChangeTransaction.jurisdiction)){
            $('#nameChangeValidationMessage').html('Corporation and jurisdicition cannot be found. Please make sure name and jurisdiction are entered correctly.');
        } 
        else */if (!nameChangeTransaction.name || !nameChangeTransaction.jurisdiction || !nameChangeTransaction.newName) {
            $('#nameChangeValidationMessage').html('*Missing one or more fields, please make sure all fields are completed');
        }
        else {
            console.log('Executing NAME CHANGE transaction', nameChangeTransaction);
            ws.send(JSON.stringify(nameChangeTransaction));
        }
        return false;
    });	

    $('#report').click(function(){
        var streetAddress = $('input[name="reportStreetAddress"]').val();
        var city = $('input[name="reportCity"]').val();
        var province = $('select[name="reportProvince"]').val();
        var postalCode = $('input[name="reportPostalCode"]').val();

        var reportTransaction = {
            type: 'report' + delimiter,
            jurisdiction: $('select[name="reportJurisdiction"]').val() + delimiter,
            name: $('input[name="reportCorporateName"]').val() + delimiter,
            address: streetAddress + " " + city + " " + province + " " + postalCode + delimiter,
            date: $('input[name="reportReportingDate"]').val() + delimiter
        };
        
        /*if (!corporationExists(reportTransaction.name, reportTransaction.jurisdiction)){
            $('#reportValidationMessage').html('Corporation and jurisdicition cannot be found. Please make sure name and jurisdiction are entered correctly.');
        } 
        else */if (!reportTransaction.name || !reportTransaction.jurisdiction || !streetAddress || !city || !province || !postalCode || !reportTransaction.date) {
            //console.log('Missing some values, please make sure all fields are complete!!');
            $('#reportValidationMessage').html('*Missing one or more fields, please make sure all fields are completed');
        }
        else {
            console.log('Executing REPORT transaction', reportTransaction);
            ws.send(JSON.stringify(reportTransaction));
        }
        return false;
    });

    $('#dissolve').click(function(){
        var dissolveTransaction = {
            type: 'dissolve'  + delimiter,
            jurisdiction: $('select[name="dissolveJurisdiction"]').val() + delimiter,
            name: $('input[name="dissolveCorporateName"]').val() + delimiter,
            status: 'Dissolved'  + delimiter
        };
        
        /*if (!corporationExists(dissolveTransaction.name, dissolveTransaction.jurisdiction)){
            $('#dissolveValidationMessage').html('Corporation and jurisdicition cannot be found. Please make sure name and jurisdiction are entered correctly.');
        } 
        else */if (!dissolveTransaction.name || !dissolveTransaction.jurisdiction) {
            $('#dissolveValidationMessage').html('*Missing one or more fields, please make sure all fields are completed');
        }
        else {
            console.log('Executing DISSOLVE transaction', dissolveTransaction);
            ws.send(JSON.stringify(dissolveTransaction));
        }
        return false;
    });

    $('#loadDemoData').click(function(){
        // Load Sample Demo Data
        ws.send(JSON.stringify({type: 'load_demo_data'}));
    });
    
});

// ===========================
// Field Validation
// ===========================
function validateDate(date)
{
    var pattern =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
    if (!pattern.test(date)) {
        return false;
    }
    else {
        return true
    }
}

function corporationExists(jurisdiction, name) {
    console.log('Jurisdiction: ' + jurisdiction + ' Name: ' + name);
    for(var i in corporations) {
        console.log('Corporations: |' + corporations[i].name + ' Jurisdiction: |' + corporations[i].jurisdiction);
        var corpname = corporations[i].name + '';
        var corpjur = corporations[i].jurisdiction + '';
        console.log("Corpname: " + corpname + ' CorpJur: ' + corpjur);
        if (corpname === name && corpjur === jurisdiction ) {
            console.log ('Found a match');
            return true;
        }
    }
    return false;
}


// =================================================================================
// Socket Stuff
// =================================================================================
function connect_to_server(){
    var connected = false;
    connect();

    function connect(){
        var wsUri = 'ws://' + document.location.hostname + ':' + document.location.port;
        console.log('Connection to websocket', wsUri);

        ws = new WebSocket(wsUri);
        ws.onopen = function(evt) { onOpen(evt); };
        ws.onclose = function(evt) { onClose(evt); };
        ws.onmessage = function(evt) { onMessage(evt); };
        ws.onerror = function(evt) { onError(evt); };
    }

    function onOpen(evt){
        console.log('WS CONNECTED');
        connected = true;

        $('#connectionStatusMessage').fadeOut();

        // Get the corporations on webpage load
        ws.send(JSON.stringify({type: 'get_corporations'}));
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
            /*if(msgObj.msg === 'transactions'){
                console.log('transactions', msgObj.msg, msgObj);
                //build_transactions(msgObj.transactions);
            }
            else */if(msgObj.msg === 'register') {
                console.log('register!!!', msgObj.msg, msgObj);
                //document.getElementById("register").reset();
                //$('#registerValidationMessage').html('');
                // confirm successful push onto blockchain
                $('#statusPanel').fadeIn(300);
                $('#registerPanel').hide();
                // TODO Show error message here if there is a problem
                $('#statusMessage').html('Your registration was successful.  The register transaction was successfully stored in the blockchain.');
                // clear the fields in the register
                
                // Get an updated list of the corporations
                ws.send(JSON.stringify({type: 'get_corporations'}));

            }
            else if(msgObj.msg === 'nameChange') {
                console.log('nameChange', msgObj.msg, msgObj);
                // confirm successful push onto blockchain
                $('#statusPanel').fadeIn(300);
                $('#name_changePanel').hide();
                // TODO Show error message here if there is a problem
                $('#statusMessage').html('Your name change was successful.  The name change transaction was successfully stored in the blockchain.'); 
            }
            else if(msgObj.msg === 'amalgamate') {
                console.log('amalgamate', msgObj.msg, msgObj);
                // confirm successful push onto blockchain
                $('#statusPanel').fadeIn(300);
                $('#amalgamatePanel').hide();
                // TODO Show error message here if there is a problem
                $('#statusMessage').html('Your amalgamation was successful.  The amalgamation transaction was successfully stored in the blockchain.'); 
            }
            else if(msgObj.msg === 'report') {
                console.log('report', msgObj.msg, msgObj);
                // confirm successful push onto blockchain
                $('#statusPanel').fadeIn(300);
                $('#reportPanel').hide();
                // TODO Show error message here if there is a problem
                $('#statusMessage').html('Your reporting was successful.  The reporting was successfully stored in the blockchain.');
            }
            else if(msgObj.msg === 'dissolve') {
                console.log('dissolve', msgObj.msg, msgObj);
                // confirm successful push onto blockchain
                $('#statusPanel').fadeIn(300);
                $('#dissolvePanel').hide();
                // TODO Show error message here if there is a problem
                $('#statusMessage').html('Your dissolution was successful.  The dissolve transaction was successfully stored in the blockchain.');

            }
            else if(msgObj.msg === 'corporations'){
                console.log('corporations', msgObj.msg, msgObj);
                //build_corporations(msgObj.corporations);
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
        if(!connected){											//don't overwrite an error message
            $('#connectionStatusMessage').html('<b>Warning:</b> Waiting on the node server to open up so we can talk to the blockchain. The app is likely still starting up. Check the server logs if this message does not go away in 1 minute.');
        }
    }
}
