var https = require('https'),
    urllib = require("url");
 
const {  Melcloud } = require("./melcloud.js");



module.exports = function(RED) {

    
    function MelCloudCredentials(n) {
        RED.nodes.createNode(this, n);

        var node = this;
        this.email = n.email;
        this.password = n.password;
        
    }

    RED.nodes.registerType("remote-credential", MelCloudCredentials);
    


    function MelCloudDeviceNode(n) {
        RED.nodes.createNode(this, n);

        var node=this;
        node.deviceid = n.deviceid;
        node.buildingid = n.buildingid;

        node.settemperature = n.settemperature;
        node.power = n.power;

        node.credentials = RED.nodes.getNode(n.server);


        node.email = node.credentials.email;
        node.password = node.credentials.password;
        
        function fetchDeviceData() {
           
            var melcloud =  new Melcloud(node.email,node.password);

            melcloud.getContext()
                .then(
                    () =>  { 
                        melcloud.getDeviceInfo( node.deviceid, node.buildingid)
                        .then(async device => {
                           var blnUpdated = false;
                           if (node.settemperature && node.settemperature !== "") {
                                console.log("set temperature = " + node.settemperature);
                                device = setTemperature(device, node.settemperature);
                                blnUpdated = true;

                            }

                            if (node.power && node.power !== "") {
                                console.log("set power = " + node.power);
                                device = setPower(device, node.power);
                                blnUpdated = true;
                            }
                            
                            if (blnUpdated) {
                                device = await melcloud.putDeviceInfo(device);
                                node.send(device);
                                node.status({});
                                return; 
                            }

                            node.send(device);
                            node.status({});
                        }).catch(err => {
                            node.error(err);
                            node.status({ fill: "red", shape: "dot", text: err });
                            return;
                        });
                }).catch(msg => {
                    node.error(msg.error);
                    node.status({ fill: "red", shape: "dot", text: "error" });
                    return;
                });
          
            
            }

            node.on("close", function(){
            
            });

            node.on("input", function(){
                fetchDeviceData();
            });
    }

    RED.nodes.registerType("melcloud-device", MelCloudDeviceNode);
    


    function MelCloudConnectNode(n) {

        RED.nodes.createNode(this, n);

        var node = this;
       
       
        node.interval = n.interval;
        node.command = n.command;
        node.timer = {};

        node.credentials = RED.nodes.getNode(n.server);


        node.email = node.credentials.email;
        node.password = node.credentials.password;
        

        function fetchData() {
           
            var melcloud =  new Melcloud(node.email,node.password);

            melcloud.getContext()
                .then(
                    () =>  { 
                            melcloud.getListDevices()
                            .then(list => {
                                node.send(list);
                                node.status({});
                            }).catch(err => {
                                node.error(msg.error);
                                node.status({ fill: "red", shape: "dot", text: "error" });
                                return;
                            });
                }).catch(msg => {
                    node.error(msg.error);
                    node.status({ fill: "red", shape: "dot", text: "error" });
                    return;
                });
          
            
            }

            node.on("close", function(){
            
            });

            node.on("input", function(){
                fetchData();
            });

        
    }

    function setTemperature(device, temperature) {

        device.payload.SetTemperature = Number.parseFloat(temperature);
        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 4;
        
        return device;

    }

    function setPower(device, value) {

        if (value == "on") {
            device.payload.Power = true;
        }

        if (value == "off") {
            device.payload.Power = false;
        }
        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 1;

       return device;
    }

    RED.nodes.registerType("melcloud-connect", MelCloudConnectNode);

};
