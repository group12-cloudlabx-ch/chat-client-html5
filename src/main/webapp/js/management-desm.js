

$(document).ready(function() {


    var $message;
    var $logWindow;
    var wsocket;
    var serviceLocation;
    var component;
    var hostname;
    var hostport;
    var filter_array;
    var logId;

    init();

    function init(){

        $message = $('#message');
        $logWindow = $('#log-window');
        filter_array = [];
        logId = 1;

        $('.control-wrapper').hide();
        $('.log-wrapper').hide();
        $('.gui-wrapper').hide();
        $('.init-wrapper').hide();
        $('.communication-wrapper').hide();
        $('.status-wrapper').hide();
        $('#remote-wrapper').hide();


    }

    var alertId = 0;
    function showInfo(selector, delay, text) {

        var newAlert = '' +
            '<div class="alert alert-info alert-message" id="' + ++alertId + '">' +
            '<a href="#" class="close" data-dismiss="alert">&times;</a>' +
            text +
            '</div>' +
            '';

        $(selector).append(newAlert);

        var alertObj = $("#" + alertId);
        alertObj.alert();

        window.setTimeout(function () {
            alertObj.fadeTo(500, 0).slideUp(500, function () {
                alertObj.alert('close');
                alertObj.remove();
            });
        }, delay);
    }

    function createAutoClosingAlert(selector, delay, text) {

        var newAlert =''+
            '<div class="alert alert-danger alert-message" id="'+ ++alertId +'">' +
            '<a href="#" class="close" data-dismiss="alert">&times;</a>' +
            text +
            '</div>' +
            '';

        $(selector).append(newAlert);

        var alertObj = $("#" + alertId);
        alertObj.alert();

        window.setTimeout(function() {
            alertObj.fadeTo(500, 0).slideUp(500, function(){
                alertObj.alert('close');
                alertObj.remove();
            });
        }, delay);

    }

    function connectWebsocketServer() {
        component = $('#component').val();
        hostname = $('#hostname').val();
        hostport = $('#hostport').val();
        serviceLocation = "ws://"+hostname+":"+hostport+"/room";

        wsocket = new WebSocket(serviceLocation + "/"+component);

        wsocket.onopen = function() {
            showInfo(".notification-box", 5000, "Server connection established.");

            setInterval(function(){
                $("#status_blinking").fadeTo(250, 0.1).fadeTo(250, 0.5);
            }, 1000);
        };

        wsocket.onmessage = function (evt) {
            onMessageReceived(evt);
        };

        wsocket.onclose = function(evt) {
            $("#status_blinking").remove();
            createAutoClosingAlert(".notification-box", 10000, "Websocket Connection Closed from Server with code: " + evt.code + ", reason: " + evt.reason + ", wasClean:" + evt.wasClean);

            window.setTimeout(function() {
                leaveComponent();
                }, 60000);
        };

        wsocket.onerror = function(evt) {
            createAutoClosingAlert(".notification-box", 10000, "Websocket Error happend with code: " + evt.code + ", reason: " + evt.reason + ", wasClean:" + evt.wasClean);

            window.setTimeout(function() {
                leaveComponent();
            }, 60000);
        };

    }

    function onMessageReceived(evt) {
        var msg = JSON.parse(evt.data); // native API
        var jsonBody= '' +
            '<tr>' +
            '</td><td>' + logId++ +
            '</td><td class="label-info">' + msg.room +
            '</td><td class="message badge">' + msg.message + '</td>' +
            '</tr>';

        showInfo(".notification-box", 3000, "You got a new message: " + msg.message + " from room:" + msg.room);
        var $messageLine = $(jsonBody).prependTo($logWindow.find('tbody'));

        //alert("received message from room: " + msg.room + " with message: " + msg.message);
    }

    function sendMessage(payload) {
        //alert("send message from room:" + component + ", with message: " +payload);

        var msg =
        '{'+
        '"room":"' + component + '", ' +
        '"message":"' + payload + '"' +
        '}';

        wsocket.send(msg);
        $message.val('').focus();
    }

    function leaveComponent() {
        $('.status').text('Connection not Established');
        $('.log-wrapper').hide();
        $('.gui-wrapper').hide();
        $('.init-wrapper').hide();
        $('#signin-wrapper').show();
        $('.communication-wrapper').hide();
        $('.control-wrapper').hide();
        $('.status-wrapper').hide();
        $('#remote-wrapper').hide();
        $('#status_text').empty();

        wsocket.close();
        $logWindow.empty();
        location.reload();
    }

    $('#do-log').submit(function(evt) {
        evt.preventDefault();
        sendMessage($message.val());
    });

    $('#connect').click(function(evt) {
        $('#switch_exit').removeClass('btn-primary');
        $('#switch_exit').addClass('btn-success');
        evt.preventDefault();
        connectWebsocketServer();

        $('.status').text('Connection Established');
        $('#status_text').append(serviceLocation + "/"+component);
        $('#signin-wrapper').hide();
        $('.init-wrapper').hide();
        $('.control-wrapper').show();
        $('.log-wrapper').hide();
        $('.gui-wrapper').hide();
        $('.communication-wrapper').hide();
        $('#remote-wrapper').hide();
    });

    $('#switch_exit').click(function(){
        $('#connect').removeClass('btn-primary');
        $('#connect').addClass('btn-danger');
        leaveComponent();
    });

    $('#switch_gui').click(function(){
        $('.gui-wrapper').toggle();
    });

    $('#switch_log').click(function(){
        $('.log-wrapper').toggle();
    });

    $('#switch_init').click(function(){
        $('.init-wrapper').toggle();
    });

    $('#switch_communication').click(function(){
        $('.communication-wrapper').toggle();
        $message.focus();
    });

    $('#switch_status').click(function(){
        $('.status-wrapper').toggle();
    });

    $('#switch_remote').click(function(){
        $('#remote-wrapper').toggle();
    });

});


