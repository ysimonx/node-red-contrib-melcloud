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

        node.credentials = RED.nodes.getNode(n.server);


        node.email = node.credentials.email;
        node.password = node.credentials.password;

        function fetchDeviceData() {
           
            var melcloud =  new Melcloud(node.email,node.password);

            melcloud.getContext()
                .then(
                    () =>  { 
                        melcloud.getDeviceInfo( node.deviceid, node.buildingid)
                        .then(device => {
                        
                            node.send(device);
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

    

    RED.nodes.registerType("melcloud-connect", MelCloudConnectNode);

};
