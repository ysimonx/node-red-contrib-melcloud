const { SlowBuffer } = require('buffer');
var https = require('https'),
    urllib = require("url");
    
const {  Melcloud } = require("./melcloud.js");


function main() {

        var melcloud =  new Melcloud("****","****");

        melcloud.getContext()
            .then(
                 () =>  { 
                        melcloud.getListDevices()
                        .then(async list => {
                            for (var j=0; j < list.payload.length; j++) {
                                var devices = list.payload[j].Structure.Devices;
                                
                                for(var i=0; i< devices.length;i++) {
                                    await melcloud.getDeviceInfo( devices[i].DeviceID, devices[i].BuildingID)
                                    .then(device => {
                                        console.log(devices[j]);
                                        console.log(device);
                                        // console.log(melcloud.context);
                                    }).catch(err => {
                                        console.error(err);
                                        return;
                                    });
                                    
                                }
                            }
                        }
                        ).catch(err => {
                            console.error(err);
                            return;
                        })
               }
            
            )
        .catch(err => {
            
            console.error(err.error);
            
            return;
        });
        }

main();