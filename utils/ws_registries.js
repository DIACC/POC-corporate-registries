var fs = require('fs');
var Buffer = require('buffer').Buffer;
var dateFormat = require('dateformat');

// ==================================
// Registries - incoming messages, look for type
// ==================================
var ibc = {};
var chaincode = {};
var async = require('async');

var delimiter = "";
var delimiterlength = 0;

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
	else if (data.type == 'report'  + delimiter) {
		console.log('[ws info] Report', data);
		chaincode.invoke.report([data.jurisdiction, data.name, data.address, data.date], cb_report);
		cb_report();
	}
	else if (data.type == 'dissolve'  + delimiter) {
		console.log('[ws info] Dissolve', data);
		chaincode.invoke.dissolve([data.jurisdiction, data.name, data.status], cb_dissolve);
	}
	else if (data.type == 'get_corporations') {
		console.log("Get corporations from ws_registries");
		chaincode.query.readAll(['_corporationIndex'], cb_got_corporations);
	}
	else if(data.type == 'chainstats'){
		console.log('chainstats msg');
		ibc.chain_stats(cb_chainstats);
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
                        	var payload = new Buffer(stats.transactions[0].payload, 'base64').toString('ascii'); // Ta-da!
                            var unixtimestamp = stats.nonHashData.localLedgerCommitTimestamp.seconds;
                            var datetime = new Date(unixtimestamp);
                            //datetime.setSeconds( unixtimestamp );
                            //var timestamp = dateFormat(datetime, "dd-mm-yyyy hh:MM:ss");
                            var timestamp = unixtimestamp;
            				var block = block_height;
	         				console.log("Formatted Timestamp: ", timestamp);
                        	if (payload) {
            					console.log('REGISTRY Payload: ' + payload);
                                var payloadArray = payload.split("\x0A");
                                var payloadItems = [];
                                
                                // remove empty lines
            					for (i=0;i<payloadArray.length;i++) {
                                    if (payloadArray[i]) {
                                        payloadItems.push(payloadArray[i]);
                                    }
            					}
                                // Print out the array
                                /*for (i=0;i<payloadItems.length;i++) {
            						console.log(i + " REGISTRY VIEWER " + payloadItems[i]);
            					}*/
                                console.log("contains register?" + payloadItems[1].indexOf('register'));
                                console.log("contains report?" + payloadItems[1].indexOf('report'));
                                console.log("contains nameChange?" + payloadItems[1].indexOf('nameChange'));
                                console.log("contains dissolve?" + payloadItems[1].indexOf('dissolve'));
                                
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
        							var message = {
        									msg: 'transactions', 
        									transactions: [{timestamp:timestamp,"transactionType":transactionType,"jurisdiction":jurisdiction,"corporationName":corporationName, "block":block}]
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
                        console.log('stats',stats);
                        
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
	
	// Registry Code
	//call back for getting transactions
	function cb_got_transactions(e, transactions){		
		if(e != null) console.log('[ws error] did not get transactions:', e);
		else {
			console.log("cb_got_transactions");
			var message = {
					msg: 'transactions', 
					transactions: [
						{"datetime":"2016-12-05 16:04:00","jurisdiction":"NU","transactionType":"Dissolve","uniqueID":"20161111010912","corporationName":"Santa's AWESOME Workshop","emailAddress":"info@north.ca","mailingAddress":"239 Elf Street, North Pole NU, HOH OHO"},	
						{"datetime":"2016-12-03 15:24:25","jurisdiction":"NU","transactionType":"Report","uniqueID":"20161111010912","corporationName":"Santa's AWESOME Workshop","emailAddress":"info@north.ca","mailingAddress":"239 Elf Street, North Pole NU, HOH OHO"},					               
						{"datetime":"2016-12-01 10:19:15","jurisdiction":"NU","transactionType":"Name Change","uniqueID":"20161111010912","corporationName":"Santa's AWESOME Workshop","emailAddress":"info@north.ca","mailingAddress":"239 Elf Street, North Pole NU, HOH OHO"},
					    {"datetime":"2016-11-11 01:09:12","jurisdiction":"NU","transactionType":"Register","uniqueID":"20161111010912","corporationName":"Santa's Workshop","emailAddress":"info@north.ca","mailingAddress":"123 Elf Street, North Pole NU, HOH OHO"},
					    {"datetime":"2016-12-06 01:09:12","jurisdiction":"AB","transactionType":"Disolve","uniqueID":"20160203131214","corporationName":"ABC INC","emailAddress":"abc@abc.com","mailingAddress":"123 ABC Street, Calgary AB, T3T 3T3"},
						{"datetime":"2016-12-05 8:00:52","jurisdiction":"BC","transactionType":"Register","uniqueID":"20161201041502","corporationName":"DEF INC","emailAddress":"def@def.com","mailingAddress":"435 DEF Street, Spuzzum BC, V8V 2V2"},
						{"datetime":"2016-12-04 17:14:42","jurisdiction":"BC","transactionType":"Register","uniqueID":"20160402171623","corporationName":"HIJ INC","emailAddress":"hij@hij.com","mailingAddress":"999 HIJ Street, Vernon BC, V3X 4X2"},
						{"datetime":"2016-12-03 14:22:28","jurisdiction":"MB","transactionType":"Name Change","uniqueID":"20160802090705","corporationName":"KLM INC","emailAddress":"klm@klm.com","mailingAddress":"333 KLM Street, Winnepeg MB, T3T 3T3"},
						{"datetime":"2016-12-01 12:54:51","jurisdiction":"AB","transactionType":"Report","uniqueID":"20160809131415","corporationName":"NOP INC","emailAddress":"nop@nop.com","mailingAddress":"555 NOP Street, Calgary AB, T2T 2T2"},
						{"datetime":"2016-12-02 09:25:34","jurisdiction":"AB","transactionType":"Register","uniqueID":"20160809131415","corporationName":"NOP INC","emailAddress":"nop@nop.com","mailingAddress":"555 NOP Street, Calgary AB, T2T 2T2"}]
				};
			sendMsg(message);
		}
	}
};
