/**
 * Copyright 2013 dc-square GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author: Christoph Schäbel
 */

 var websocketclient = {
    'client': null,
    'lastMessageId': 1,
    'lastSubId': 1,
    'subscriptions': [],
    'messages': [],
    'connected': false,

    'connect': function () {
        var host = "broker.mqttdashboard.com";
        var port = 8000;
        var clientId = "barak";
        var username = "";
        var password = "";
        var keepAlive = 60;
        var cleanSession = false;
        var lwTopic = "";
        var lwQos = 0;
        var lwRetain = true;
        var lwMessage = "";
        var ssl = false;

        this.client = new Messaging.Client(host, port, clientId);
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;

        var options = {
            timeout: 3,
            keepAliveInterval: keepAlive,
            cleanSession: cleanSession,
            useSSL: ssl,
            onSuccess: this.onConnect,
            onFailure: this.onFail,
        };

        if (username.length > 0) {
            options.userName = username;
        }
        if (password.length > 0) {
            options.password = password;
        }
        if (lwTopic.length > 0) {
            var willmsg = new Messaging.Message(lwMessage);
            willmsg.qos = lwQos;
            willmsg.destinationName = lwTopic;
            willmsg.retained = true;
            options.willMessage = willmsg;
        }

        this.client.connect(options);
    },

    'onConnect': function () {
        websocketclient.connected = true;
        console.log("connected");
        websocketclient.addBot();
        },

    'onFail': function (message) {
        websocketclient.connected = false;
        console.log("error: " + message.errorMessage);
    },

    'onConnectionLost': function (responseObject) {
        websocketclient.connected = false;
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }

        //Cleanup messages
        websocketclient.messages = [];

        //Cleanup subscriptions
        websocketclient.subscriptions = [];
    },

    'onMessageArrived': function (message) {
//        console.log("onMessageArrived:" + message.payloadString + " qos: " + message.qos);

        var messageObj = {
            'topic': message.destinationName,
            'retained': message.retained,
            'qos': message.qos,
            'payload': message.payloadString,
        };
        if(message.topic === "ipmAttackCondition"){
            if(message.retained === "active" || message.payloadString === "active"){
                for(let i = 1; i < 20; i++){
                    
                }
            }
        }
        console.log(messageObj);
        websocketclient.messages.push(messageObj);
    },

    'disconnect': function () {
        this.client.disconnect();
    },

    'publish': function (topic, payload, qos, retain) {

        if (!websocketclient.connected) {
            websocketclient.render.showError("Not connected");
            return false;
        }

        var message = new Messaging.Message(payload);
        message.destinationName = topic;
        message.qos = qos;
        message.retained = retain;
        this.client.send(message);
    },

    'subscribe': function (topic, qosNr, color) {

        if (!websocketclient.connected) {
            console.log("Not connected");
            return false;
        }

        if (topic.length < 1) {
            console.log("Topic cannot be empty");
            return false;
        }

        this.client.subscribe(topic, {qos: qosNr});
        if (color.length < 1) {
            color = '999999';
        }

        var subscription = {'topic': topic, 'qos': qosNr, 'color': color};
        console.log(subscription);
        return true;
    },

    'unsubscribe': function (id) {
        var subs = _.find(websocketclient.subscriptions, {'id': id});
        this.client.unsubscribe(subs.topic);
        websocketclient.subscriptions = _.filter(websocketclient.subscriptions, function (item) {
            return item.id != id;
        });

        websocketclient.render.removeSubscriptionsMessages(id);
    },
    'addBot':async function(){
        let gridBox = document.getElementById("grid-box");

        for(let i = 1; i < 20; i++){
            let botContainer = document.createElement('div');
            let botTag = document.createElement('a');

            let fixedBotId = i.toString().padStart(2, "0");
            botTag.innerText = "IPM-" + fixedBotId;
            botTag.classList.add("botTagStyle")
            botTag.id = "botTag-" + fixedBotId;

            botContainer.classList.add("botContainerStyle");

            botContainer.appendChild(botTag);
            botContainer.id = "botContainer-"+fixedBotId;

            gridBox.appendChild(botContainer)
            this.subscribeToBot();
        }
    },
    'subscribeToBot': async function(){
        const timer = ms => new Promise(res => setTimeout(res, ms))
        for(let i = 1; i < 20; i++){
            let fixedBotId = i.toString().padStart(2, "0");
            let botContainer = document.getElementById('botContainer-'+fixedBotId);
            if(websocketclient.subscribe('ipmAttackCondition', 0, "#fff")){
                await timer(10);
                botContainer.classList.remove('botNotSuscribed')
                botContainer.classList.toggle('botSuscribed')
            }else{
                await timer(10);
                botContainer.classList.remove('botSuscribed')
                botContainer.classList.toggle('botNotSuscribed')
            }
        }
    }
};