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

    RED.nodes.registerType("melcloud-credential", MelCloudCredentials);
    


    function MelCloudDeviceNode(n) {
        RED.nodes.createNode(this, n);

        var node=this;
        node.deviceid = n.deviceid;
        node.buildingid = n.buildingid;

        node.settemperature = n.settemperature;
        node.setfanspeed = n.setfanspeed;
        node.power = n.power;
        node.mode = n.mode;

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


                            if (node.mode && node.mode !== "") {
                                console.log("set mode = " + node.mode);
                                device = setOperationMode(device, node.mode);
                                blnUpdated = true;
                            }

                            if (node.setfanspeed && node.setfanspeed !== "") {
                                console.log("set setfanspeed = " + node.setfanspeed);
                                device = setFanSpeed(device, node.setfanspeed);
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

    // OperationMode (int): 1 = Chauffage / 3 = Climatisation / 7 = Ventilation / 8 = Automatique
    function setOperationMode(device, value) {

        if (value == "auto") {
            device.payload.OperationMode = 8;
        }

        if (value == "heat") {
            device.payload.OperationMode = 1;
        }

        if (value == "fan") {
            device.payload.OperationMode = 7;
        }

        if (value == "cooling") {
            device.payload.OperationMode = 3;
        }


        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 2;

       return device;
    }


    // SetFanSpeed (int): De 0 à 3 dans mon cas (Si 0, vitesse automatique / Puissance de 1 à NumberOfFanSpeeds qui définis le maximum)
    function setFanSpeed(device, value) {

       
        device.payload.SetFanSpeed = value;
       
        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 8;

       return device;
    }


    RED.nodes.registerType("melcloud-connect", MelCloudConnectNode);

};
