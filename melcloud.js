// melcloud.js

var https = require('https'),
    urllib = require("url");

// constructor function for the Cat class
class Melcloud {


    constructor(param_user, param_password) {

        this.user = param_user;
        this.password = param_password;
        this.ContextKey = "";

    }

    getContext() {
        var self = this;

        return new Promise((resolve, reject) => {
           
            if (self.ContextKey !== "") {
                resolve();
                return;
            }
    
            var url =  "/Mitsubishi.Wifi.Client/Login/ClientLogin";
    
            var options = {
                method: 'POST',
                host: "app.melcloud.com",
                port: 443,
                path: url,
                headers: {
                   'Content-Type': "application/json; charset=utf-8",
                   'Referer': 'https://app.melcloud.com/',
                   'Origin': 'https://app.melcloud.com/',
                   'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
                   'X-Requested-With': 'XMLHttpRequest',
                   'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3'
                }   
            };
    
            var postData = {
                "Email":this.user,
                "Password":this.password,
                // "Language":7,
                "AppVersion":"1.32.1.0",
                "Persist":true,
                "CaptchaResponse":null
            }
    
            var msg = {};
    
            var request = https.request(options, function(res) {
                res.setEncoding('utf8');
    
               
                msg.statusCode = res.statusCode;
                msg.payload = "";
    
                res.on("data", function(chunk) {
                    msg.payload += chunk;
                
                });
    
                res.on("end",function() {
    
                    try {
                        msg.payload = JSON.parse(msg.payload); 
                        if (msg.payload.ErrorId && msg.payload.ErrorId !== null) {
                            msg.error = "login failed";

                            if (msg.payload.ErrorId == 6) {
                                msg.error = "login failed : too many attempts.";  
                            }
                            if (msg.payload.ErrorId == 1) {
                                msg.error = "login failed : verify email and password.";
                            }
                            reject(msg);
                            return;
                        }
                        msg.error = "";
                        self.context = msg;
                        
                        self.ContextKey = msg.payload.LoginData.ContextKey;
                        
                        resolve(msg);

                    }
                
                    catch(e) { 
                        msg.error = e;
                        reject(msg); 
                        
                    }
                });
            });
    
            request.on("error", function(err) {
                msg.error = err;
                reject(msg); 
            });
    
            request.write(JSON.stringify(postData));
            request.end();
    
        })
    };

    getListDevices() {

        var self=this;

        return new Promise((resolve, reject) => {
           
        var ContextKey=self.ContextKey;
        
        var url =  "/Mitsubishi.Wifi.Client/User/ListDevices";
    
        var options = {
            method: 'GET',
            host: "app.melcloud.com",
            port: 443,
            path: url,
            // authentication headers
            headers: {
    
               
                    'Host': 'app.melcloud.com',
                    
                    'X-MitsContextKey': ContextKey
                    
    
            }   
        };
    
        
        var msg = {};
        var request = https.request(options, function(res) {
            res.setEncoding('utf8');
    
            
            msg.statusCode = res.statusCode;
            msg.payload = "";
    
            res.on("data", function(chunk) {
                msg.payload += chunk;
            
            });
    
            res.on("end",function() {
    
                
                try {
                    msg.payload = JSON.parse(msg.payload); 
                    msg.error = "";
                    msg.context=self.ContextKey;
                    resolve(msg);
                    // cb_ok(context, msg);
                }
            
                catch(e) { 
                    
                    // cb_error(msg);
                    msg.error= e;
                    self.ContextKey="";
                    reject(msg);
                }
            });
        });
    
        request.on("error", function(err) {
            msg.error = err;
            self.ContextKey="";
            reject(msg);
        });
    
       
        request.end();
        })
    }

    

    putDeviceInfo( device ) {
        var self = this;

        return new Promise((resolve, reject) => {
            var ContextKey=self.ContextKey;
            //var ContextKey = self.context.payload.LoginData.ContextKey;
            var url =  "/Mitsubishi.Wifi.Client/Device/SetAta";
        
            var options = {
                method: 'POST',
                host: "app.melcloud.com",
                port: 443,
                path: url,
                // authentication headers
                headers: {
                        'Host': 'app.melcloud.com',
                        'Content-Type': "application/json; charset=utf-8",
                        'X-MitsContextKey': ContextKey
                }   
            };
        

            var postData = device.payload;

            var msg = {};
        
            var request = https.request(options, function(res) {
                res.setEncoding('utf8');

            
                msg.statusCode = res.statusCode;
                msg.payload = "";

                res.on("data", function(chunk) {
                    msg.payload += chunk;
                
                });

                res.on("end",function() {

                    try {
                        msg.payload = JSON.parse(msg.payload); 
                    
                        msg.error = "";
                        self.context = msg;
                        msg.context=self.ContextKey;
                        resolve(msg);

                    }
                
                    catch(e) { 
                        msg.error = e;
                        self.ContextKey="";
                        reject(msg); 
                        
                    }
                });
            });

            request.on("error", function(err) {
                msg.error = err;
                self.ContextKey="";
                reject(msg); 
            });

            request.write(JSON.stringify(postData));
            request.end();

        })

    }

    getDeviceInfo( deviceid , buildingid) {
        var self = this;
        return new Promise((resolve, reject) => {
           
        var ContextKey = self.ContextKey;
        // var ContextKey = self.context.payload.LoginData.ContextKey;
        var url =  "/Mitsubishi.Wifi.Client/Device/Get?id=" + deviceid + "&buildingID=" + buildingid;
    
        // console.log(url);
        var options = {
            method: 'GET',
            host: "app.melcloud.com",
            port: 443,
            path: url,
            // authentication headers
            headers: {
    
               
                    'Host': 'app.melcloud.com',
                    
                    'X-MitsContextKey': ContextKey
                    
    
            }   
        };
    
     
        var msg = {};
        var request = https.request(options, function(res) {
            res.setEncoding('utf8');
    
            
            msg.statusCode = res.statusCode;
            msg.payload = "";
    
            res.on("data", function(chunk) {
                msg.payload += chunk;
            
            });
    
            res.on("end",function() {
    
                
                try {
                    msg.payload = JSON.parse(msg.payload); 
                    msg.error = "";
                    msg.context=self.ContextKey;
                    resolve(msg);
                    // console.log(msg.payload.WeatherObservations);
                    
                }
            
                catch(e) { 
                    
    
                    console.log(e) ;  
                    msg.error = e;
                    self.ContextKey="";
                    reject(msg);
                }
            });
        });
    
        request.on("error", function(err) {
            
            msg.error = err;
            self.ContextKey="";
            reject(msg);
           
        });
    
       
        request.end();
       
    })
    }
    
}
 
module.exports = {
    Melcloud
    
};