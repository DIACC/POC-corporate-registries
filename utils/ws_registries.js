var fs = require('fs');
var Buffer = require('buffer').Buffer;

// ==================================
// Registries - incoming messages, look for type
// ==================================
var ibc = {};
var chaincode = {};
var async = require('async');

var delimiter = "";
var delimiterlength = 0;
var numTransactions = 0;
var transactionCount = 0;
var transactionsArray = [];

module.exports.setup = function(sdk, cc){
    ibc = sdk;
    chaincode = cc;
};

module.exports.process_msg = function(ws, data){
    // Registry Code
    if (data.type == 'register' + delimiter) {
        console.log('[ws info] Register', data);
        chaincode.invoke.register([data.jurisdiction, data.name, data.number, data.directorName, data.address, data.email, data.date, data.status], cb_register);
    }
    else if (data.type == 'nameChange'  + delimiter) {
        console.log('[ws info] Name Change', data);
        chaincode.invoke.nameChange([data.jurisdiction, data.name, data.newName], cb_nameChange);
    }
    else if (data.type == 'amalgamate') {
        console.log('[ws info] Amalgamate', data);
        chaincode.invoke.amalgamation([data.corporation1Jurisdiction, data.corporation1Name, data.corporation1Status, data.corporation2Jurisdiction, data.corporation2Name, data.corporation1Status, data.newCorporationJurisdiction, data.newCorporationName, data.newCorporationNumber, data.newCorporationDirectorName, data.newCorporationAddress, data.newCorporationEmail, data.newCorporationDate, data.newCorporationStatus], cb_amalgamate);
    }
    else if (data.type == 'report'  + delimiter) {
        console.log('[ws info] Report', data);
        chaincode.invoke.report([data.jurisdiction, data.name, data.address, data.date], cb_report);
    }
    else if (data.type == 'dissolve'  + delimiter) {
        console.log('[ws info] Dissolve', data);
        chaincode.invoke.dissolve([data.jurisdiction, data.name, data.status], cb_dissolve);
    }
    else if (data.type == 'get_corporations') {
        console.log("Get corporations from ws_registries");
        chaincode.query.readAll(['_corporationIndex'], cb_got_corporations);
    }
    else if(data.type == 'get_transactions'){
        console.log('Get Transactions');
        ibc.chain_stats(cb_chainstats);
    }
    else if(data.type == 'chainstats'){
        console.log('chainstats msg');
        ibc.chain_stats(cb_chainstats);
    }
    else if (data.type == 'load_demo_data') {
        fs.readFile('./utils/sampledemodata.json', 'utf8', function (err, data) {
            if (err) throw err;
            var obj = JSON.parse(data);
            console.log("data: " + obj.transactions);
            var transactions = obj.transactions;

            numTransactions = transactions.length;
            transactionCount = 0;
            transactionsArray = transactions;
            if (transactions.length > 0) {
                loadTransaction(transactions[0]);
            }
        });
    }

    //call back for getting the blockchain stats, lets get the block stats now
    function cb_chainstats(e, chain_stats){
        console.log('cb_chainstats', chain_stats)
        if(chain_stats && chain_stats.height){
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            var list = [];
            for(var i = chain_stats.height; i >= 1; i--){								//create a list of heights we need
                list.push(i);
                if(list.length >= 100) break;
            }
            //list.reverse();																//flip it so order is correct in UI
            async.eachLimit(list, 1, function(block_height, cb) {						//iter through each one, and send it
                ibc.block_stats(block_height, function(e, stats){
                    if(e == null){
                        if (stats.transactions) {
                            console.log('Number of transactions in block: ' + stats.transactions.length);

                            for (var i=0; i<stats.transactions.length; i++) {
                                console.log('Transaction number: ' + i);
                                var payload = new Buffer(stats.transactions[i].payload, 'base64').toString('ascii'); // Ta-da!
                                var unixtimestamp = stats.nonHashData.localLedgerCommitTimestamp.seconds;
                                var timestamp = timeConverter(unixtimestamp);
                                var block = block_height;
                                console.log("Formatted Timestamp: ", timestamp);
                                if (payload) {
                                    console.log('REGISTRY Payload: ' + payload);
                                    var payloadArray = payload.split("\x0A");
                                    var payloadItems = [];

                                    // remove empty lines
                                    for (var j=0;j<payloadArray.length;j++) {
                                        if (payloadArray[j]) {
                                            payloadItems.push(payloadArray[j]);
                                        }
                                    }

                                    for (var j=0; j<payloadItems.length; j++){
                                        console.log(j + ": " + payloadItems[j]);
                                    }

                                    if (payloadItems[1].indexOf('register') !== -1) {
                                        var transactionType = 'Register';
                                        var jurisdiction = payloadItems[2];
                                        var corporationName = payloadItems[3];
                                        var corporationNumber = payloadItems[4];
                                        var directorName = payloadItems[5];
                                        var address = payloadItems[6];
                                        var email = payloadItems[7];
                                        var date = payloadItems[8];
                                        var status = payloadItems[9];

                                        console.log(" Register Transaction " );
                                        var message = {
                                            msg: 'transactions', 
                                            transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":jurisdiction,"corporationName":corporationName,"corporationNumber":corporationNumber,"directorName":directorName,"address":address,"email":email,"date":date,"status":status, "block":block}]
                                        };
                                        sendMsg(message);
                                    }
                                    else if (payloadItems[1].indexOf('nameChange') !== -1) {
                                        console.log(" Name Change ");
                                        var transactionType = 'Name Change';
                                        var jurisdiction = payloadItems[2];
                                        var corporationName = payloadItems[4];
                                        var oldName = payloadItems[3];
                                        var message = {
                                            msg: 'transactions', 
                                            transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":jurisdiction,"corporationName":corporationName, "oldName":oldName, "block":block}]
                                        };
                                        sendMsg(message);
                                    }
                                    else if (payloadItems[1].indexOf('amalgamation') !== -1) {
                                        console.log(" Amalgamation Change ");

                                        var transactionType = 'Amalgamation';
                                        var corporation1Name = payloadItems[3];
                                        var corporation1Jurisdiction = payloadItems[2];
                                        var corporation1Status = payloadItems[4];
                                        var corporation2Name = payloadItems[6];
                                        var corporation2Jurisdiction = payloadItems[5];
                                        var corporation2Status = payloadItems[7];
                                        var newCorporationJurisdiction = payloadItems[8];
                                        var newCorporationName = payloadItems[9];
                                        var newCorporationNumber = payloadItems[10];
                                        var newCorporationDirectorName = payloadItems[11];
                                        var newCorporationAddress = payloadItems[12];
                                        var newCorporationEmail = payloadItems[13];
                                        var newCorporationDate = payloadItems[14];
                                        var newCorporationStatus = payloadItems[15];

                                        var message = {
                                            msg: 'transactions', 
                                            transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":newCorporationJurisdiction,"corporationName":newCorporationName, "corporation1Name":corporation1Name, "corporation1Jurisdiction":corporation1Jurisdiction, "corporation2Name":corporation2Name, "corporation2Jurisdiction":corporation2Jurisdiction,"block":block}]
                                        };
                                        sendMsg(message);
                                    }
                                    else if (payloadItems[1].indexOf('report') !== -1) {
                                        console.log(" Report Transaction ");
                                        var transactionType = 'Report';
                                        var jurisdiction = payloadItems[2];
                                        var corporationName = payloadItems[3];
                                        var address = payloadItems[4];
                                        var date = payloadItems[5];
                                        var message = {
                                            msg: 'transactions', 
                                            transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":jurisdiction,"corporationName":corporationName,"address":address,"date":date,"status":status, "block":block}]
                                        };
                                        sendMsg(message);

                                    }
                                    else if (payloadItems[1].indexOf('dissolve') !== -1) {
                                        console.log(" Dissolve Transaction ");
                                        var jurisdiction = payloadItems[2];
                                        var corporationName = payloadItems[3];
                                        var status = payloadItems[4];
                                        var transactionType = 'Dissolve';
                                        var data = '';

                                        var message = {
                                            msg: 'transactions', 
                                            transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":jurisdiction,"corporationName":corporationName,"corporationNumber":corporationNumber,"status":status, "block":block}]
                                        };
                                        sendMsg(message);
                                    }
                                }
                            }
                        }
                        //console.log('stats',stats);
                    }
                    cb(null);
                });
            }, function() {
            });
        }
    }


    function cb_register(e, a){
        console.log('response from blockchain: ', e, a);
        try{
            sendMsg({msg: 'register', status: 'OK'});
        }
        catch(e){
            console.log('[ws error]', e);
        }
    }

    function cb_nameChange(e, a){
        console.log('response from blockchain: ', e, a);
        try{
            sendMsg({msg: 'nameChange', status: 'OK'});
        }
        catch(e){
            console.log('[ws error]', e);
        }
    }

    function cb_amalgamate(e, a){
        console.log('response from blockchain: ', e, a);
        try{
            sendMsg({msg: 'amalgamate', status: 'OK'});
        }
        catch(e){
            console.log('[ws error]', e);
        }
    }

    function cb_report(e, a){
        console.log('response from blockchain: ', e, a);
        try{
            sendMsg({msg: 'report', status: 'OK'});
        }
        catch(e){
            console.log('[ws error]', e);
        }
    }

    function cb_dissolve(e, a){
        console.log('response from blockchain: ', e, a);
        try{
            sendMsg({msg: 'dissolve', status: 'OK'});
        }
        catch(e){
            console.log('[ws error]', e);
        }
    }

    //send a message, socket might be closed...
    function sendMsg(json){
        if(ws){
            try{
                ws.send(JSON.stringify(json));
            }
            catch(e){
                console.log('[ws error] could not send msg', e);
            }
        }
    }

    function cb_got_corporations(e, corporations){
        if(e != null) console.log('[ws error] did not get corporations', e);
        else{
            console.log('[ws info]  corporation data: ',corporations);
            try{
                var json = JSON.parse(corporations) 
                var message = {
                    msg: 'corporations', 
                    corporations: json};
                sendMsg(message);
            }
            catch(e){
                console.log('[ws error] could not parse response', e);
            }
        }
    }

    function cb_load_next_demo_transaction() {
        transactionCount ++;

        if (transactionCount<transactionsArray.length) {
            loadTransaction(transactionsArray[transactionCount]);
        }
    }

    function loadTransaction(transaction) {
        if (transaction.type == 'register') {
            console.log('Adding Register Transaction...');
            var jurisdiction = transaction.jurisdiction;
            var name = transaction.name;
            var number = transaction.number;
            var directorName = transaction.directorName;
            var address = transaction.address;
            var email = transaction.email;
            var date = transaction.date;
            var status = transaction.status;
            // Register!
            chaincode.invoke.register([jurisdiction, name, number, directorName, address, email, date, status], cb_load_next_demo_transaction);

        }
        else if (transaction.type == 'nameChange') {
            console.log('Adding Name Change Transaction...');
            var jurisdiction = transaction.jurisdiction;
            var name = transaction.name;
            var newName = transaction.newName;

            // Name Change!
            chaincode.invoke.nameChange([jurisdiction, name, newName], cb_load_next_demo_transaction);

        }
        else if (transaction.type == 'amalgamation') {
            console.log('Adding Amalgamation Transaction...');
            var corporation1Name = transaction.corporation1Name;
            var corporation1Jurisdiction = transaction.corporation1Jurisdiction;
            var corporation1Status = transaction.corporation1Status;
            var corporation2Name = transaction.corporation2Name;
            var corporation2Jurisdiction = transaction.corporation2Jurisdiction;
            var corporation2Status = transaction.corporation2Status;
            var newCorporationJurisdiction = transaction.newCorporationJurisdiction;
            var newCorporationName = transaction.newCorporationName;
            var newCorporationNumber = transaction.newCorporationNumber;
            var newCorporationDirectorName = transaction.newCorporationDirectorName;
            var newCorporationAddress = transaction.newCorporationAddress;
            var newCorporationEmail = transaction.newCorporationEmail;
            var newCorporationDate = transaction.newCorporationDate;
            var newCorporationStatus = transaction.newCorporationStatus;
            // Register!
            chaincode.invoke.amalgamation([corporation1Jurisdiction, corporation1Name, corporation1Status, corporation2Jurisdiction, corporation2Name, corporation1Status, newCorporationJurisdiction, newCorporationName, newCorporationNumber, newCorporationDirectorName, newCorporationAddress, newCorporationEmail, newCorporationDate, newCorporationStatus], cb_load_next_demo_transaction);

        }
        else if (transaction.type == 'report') {
            console.log('Adding Report Transaction...');
            var jurisdiction = transaction.jurisdiction;
            var name = transaction.name;
            var address = transaction.address;
            var date = transaction.date;

            // Report!
            chaincode.invoke.report([jurisdiction, name, address, date], cb_load_next_demo_transaction);

        }
        else if (transaction.type == 'dissolve') {
            console.log('Adding Dissolve Transaction...');
            var jurisdiction = transaction.jurisdiction;
            var name = transaction.name;
            var status = transaction.status;

            // Dissolve!
            chaincode.invoke.dissolve([jurisdiction, name, status], cb_load_next_demo_transaction);
        }
    }

};

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}


