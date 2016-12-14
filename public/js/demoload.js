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
    $('#loadDemoData').click(function(){
        console.log("Load Demo Data");
        return false;
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
        
        // Load Sample Demo Data
        ws.send(JSON.stringify({type: 'load_demo_data'}));

    }

    function onClose(evt){
        console.log('WS DISCONNECTED', evt);
        connected = false;
        setTimeout(function(){ connect(); }, 5000);					//try again one more time, server restarts are quick
        $('#connectionStatusMessage').fadeIn();
    }

    function onMessage(msg){
        // Registry Code
        try {
            var msgObj = JSON.parse(msg.data);
            if(msgObj.msg === 'loadDemoData'){
                console.log('loadDemoData', msgObj.msg, msgObj);
                
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
