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


        node.vanevertical = n.vanevertical;
        node.vanehorizontal = n.vanehorizontal;


        node.email = node.credentials.email;
        node.password = node.credentials.password;
        
        function fetchDeviceData() {
           
            var melcloud =  new Melcloud(node.email,node.password);

            melcloud.getContext()
                .then(
                   async () =>  { 


                        
                        var d = node.deviceid;
                        if ( node.input_deviceid != null) {
                            d = node.input_deviceid;
                        }


                        var b = node.buildingid;
                        if ( node.input_buildingid != null) {
                            b = node.input_buildingid;
                        }
                        
                        var p = node.power;
                        if ( node.input_power != null) {
                            p = node.input_power;
                        }

                        var t = node.settemperature;
                        if ( node.input_settemperature != null) {
                            t = node.input_settemperature;
                        }

                        var fsp = node.setfanspeed;
                        if ( node.input_setfanspeed != null) {
                            fsp = node.input_setfanspeed;
                        }


                        var vv = node.vanevertical;
                        if ( node.input_vanevertical != null) {
                            vv = node.input_vanevertical;
                        }

                        var vh = node.vanehorizontal;
                        if ( node.input_vanehorizontal != null) {
                            vh = node.input_vanehorizontal;
                        }
                                                
                        await melcloud.getDeviceInfo( d, b )
                        .then(async device => {
                           var blnUpdated = false;
                           if (t && t !== "") {
                                console.log("set temperature = " + t);
                                device = setTemperature(device, t);
                                blnUpdated = true;

                            }


                            if (p && p !== "") {
                                console.log("set power = " + p);
                                device = setPower(device, p);
                                blnUpdated = true;
                            }


                            if (node.mode && node.mode !== "") {
                                console.log("set mode = " + node.mode);
                                device = setOperationMode(device, node.mode);
                                blnUpdated = true;
                            }

                            
                            if (fsp != null && fsp !== "") {
                                if (fsp==0 || fsp==1 || fsp==2 || fsp==3 || fsp==4 || fsp==5 ) {
                                    console.log("set setfanspeed = " + fsp);
                                    device = setFanSpeed(device, fsp );
                                    blnUpdated = true;
                                } else {
                                    console.log("zarb");
                                }
                            }
                            

                            if (vh != null && vh !== "") {
                                console.log("set vanehorizontal = " + vh);
                                device = setVaneHorizontal(device, vh );
                                blnUpdated = true;
                            }

                            if (vv != null && vv !== "") {
                                console.log("set vanevertical = " + vv);
                                device = setVaneVertical(device, vv );
                                blnUpdated = true;
                            }

                            if (blnUpdated) {
                                device = await melcloud.putDeviceInfo(device);
                                node.send(device);
                                node.status({ text: "Temp : " + device.payload.RoomTemperature + " °C"});
                                return; 
                            }

                            node.send(device);
                            node.status({ text: "Temp : " + device.payload.RoomTemperature  + " °C"});
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

            node.on("input", function(msg){

                node.input_deviceid = null;
                node.input_building = null;
                node.input_power    = null; 
                node.input_settemperature = null;
                node.input_setfanspeed = null;
                node.input_vanehorizontal = null;
                node.input_vanevertical = null;

               

                if (msg.hasOwnProperty("device")) {
                    if (msg.device.hasOwnProperty("deviceid")) {
                        node.input_deviceid = msg.device.deviceid;
                    }
                    if (msg.device.hasOwnProperty("buildingid")) {
                        node.input_buildingid = msg.device.buildingid;
                    }

                    if (msg.device.hasOwnProperty("command")) {

                        if (msg.device.command.hasOwnProperty("power")) {
                            node.input_power = msg.device.command.power;
                        }

                        if (msg.device.command.hasOwnProperty("temperature")) {
                            node.input_settemperature = msg.device.command.temperature;
                        }

                        if (msg.device.command.hasOwnProperty("fanspeed")) {
                            node.input_setfanspeed = msg.device.command.fanspeed;
                        }

                        if (msg.device.command.hasOwnProperty("vanehorizontal")) {
                            node.input_vanehorizontal = msg.device.command.vanehorizontal;
                        }

                        if (msg.device.command.hasOwnProperty("vanevertical")) {
                            node.input_vanevertical = msg.device.command.vanevertical;
                        }

                    }
                } 

              
               


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

        if (value == "dry") {
            device.payload.OperationMode = 2;
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



    function setVaneHorizontal(device, value) {

        
        device.payload.VaneHorizontal =  Number.parseFloat(value);
    
        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 256;

    return device;
    }


    function setVaneVertical(device, value) {

    
        device.payload.VaneVertical =  Number.parseFloat(value);
    
        device.payload.HasPendingCommand = true;
        device.payload.EffectiveFlags = device.payload.EffectiveFlags + 16;

    return device;
    }


    RED.nodes.registerType("melcloud-connect", MelCloudConnectNode);

};
