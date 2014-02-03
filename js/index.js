/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//Landscape vs Portrait
window.onload = init;
var currY = 0;
var currY = 0;
var dX = 0;
var dY = 0;
var img = null;
var gImg = null;
var context = null;
var canvas = null;
var watchID = null;
var myHeading = 0;
var oCanvas = null;
var bCanvas = null;
var frameID = null;
var watchIDAccel = null;
var ballRadius = 20;
var accelDelay=false;

//Utility function for request animation
var requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
})();

//Utility function to cancel animation
var cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();

//This function creates an offscreen canvas to create a ball

function setupBallCanvas() {

    bCanvas = document.createElement('canvas');
    bCanvas.width = ballRadius * 2;
    bCanvas.height = ballRadius * 2;
    var m_context = bCanvas.getContext('2d');


    var radius = ballRadius;
    x = radius;
    y = radius;
    a = .8;
    loopcount = 60;
    for (var i = 0; i < loopcount; i++) {
        var redval = 265;
        var greenval = 245;
        var blueval = 220 + i
        drawCirc(x + i / 12, y - i / 12, radius - i / 6, redval, greenval, blueval, a, m_context);
    }

}

function drawCirc(x, y, radius, r, g, b, a, dcontext) {
    dcontext.beginPath();
    dcontext.arc(x, y, radius, 0, 2 * Math.PI, false);
    dcontext.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    dcontext.fill();
    dcontext.closePath();
}

//This function just creates an offscreen canvas to hold a picture of the compass
//background
function offscreenCanvas() {
    if (img != null && oCanvas == null) {
        var m_canvas = document.createElement('canvas');
        m_canvas.width = img.width;
        m_canvas.height = img.height;
        m_context = m_canvas.getContext('2d');
        m_context.beginPath();
        m_context.arc(m_canvas.width / 2, m_canvas.height / 2, img.width / 2, 0, 2 * Math.PI, false);
        var radgrad = m_context.createRadialGradient(m_canvas.width / 2, m_canvas.height / 2, img.height / 3, m_canvas.width / 2, m_canvas.height / 2, img.height / 2);
        radgrad.addColorStop(0.9, '#F5F5DC');
        radgrad.addColorStop(0.1, '#cdc0b0');
        m_context.fillStyle = radgrad;
        m_context.fill();
        m_context.closePath();
        m_context.strokeStyle = 'rgba(200,0,0,0.7)'
        m_context.beginPath();
        m_context.moveTo(m_canvas.width / 2, m_canvas.height / 2 - 5);
        m_context.lineTo(m_canvas.width / 2, m_canvas.height / 2 - img.height / 2);
        m_context.closePath();
        m_context.stroke();
        m_context.beginPath();
        m_context.arc(m_canvas.width / 2, m_canvas.height / 3, img.height / 20, 0, 2 * Math.PI, false);
        m_context.lineWidth = 1.5;
        m_context.strokeStyle = 'rgba(128,0,0,0.9)';
        m_context.stroke();
        m_context.closePath();
        var xStart = (m_canvas.width - img.width) / 2;
        var yStart = (m_canvas.height - img.height) / 2;
        m_context.beginPath();
        m_context.arc(m_canvas.width / 2, m_canvas.height / 2, (img.height / 2) - 2, 0, 2 * Math.PI, false);
        m_context.lineWidth = 3.5;
        m_context.strokeStyle = 'rgba(0,0,0,0.5)';
        m_context.stroke();
        m_context.closePath();
        oCanvas = m_canvas;
    }
}

function init() {
    console.log("Setting up");
    app.initialize();
}

var app = {
    // Application Constructor
    initialize: function () {
        console.log("initializing...");
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        window.screen.mozLockOrientation('portrait-primary');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {

        function flipDemo(title) {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');

            backside.innerHTML = '';
            back.classList.add('open');
            appbar.heading = title;
            flipbox.showBack();
        }

        function flipMain() {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');
            flipbox.showFront();

            back.classList.remove('open');
            appbar.heading = 'Cordova <3 Firefox OS';
        }
      
        function appendToOutput(el) {
            var flipbox = document.querySelector('x-flipbox');
            var back = flipbox.querySelector('div:last-child');
            back.appendChild(el);
        };

        document.querySelector('x-appbar .back').addEventListener('click', function () {
            flipMain();

            if (frameID != null) {
                cancelAnimationFrame(frameID);
                frameID = null;
            }
            if (watchID) {
                navigator.compass.clearWatch(watchID);
                watchID = null;
            }
            if (watchIDAccel) {
                navigator.accelerometer.clearWatch(watchIDAccel);
                watchIDAccel = null;
            }

            window.removeEventListener('deviceorientation', deviceOrientationEvent);
        });

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);

        function getPicture() {
            navigator.camera.getPicture(function (src) {
                flipDemo('Picture');
                var img = document.createElement('img');
                img.id = 'slide';
                img.src = src;
                appendToOutput(img);
            }, function () {}, {
                destinationType: 1
            });
        }

        function getAccel() {
            flipDemo('Accelerometer');
            var back = document.querySelector('x-flipbox div:last-child');
            var myFrontImage = document.createElement('img');
            myFrontImage.src = "img/cardfront.png";
            var myBackImage = document.createElement('img');
            myBackImage.src = "img/cardback.png";

            var newflip = document.createElement('x-flipbox');
            newflip.setAttribute("id", "playcard");
            var frt = document.createElement("div");
            frt.appendChild(myFrontImage);
            newflip.appendChild(frt);
            var bck = document.createElement("div");
            bck.appendChild(myBackImage);
            newflip.appendChild(bck);
            back.appendChild(newflip);

            var vals = document.createElement('div');
            vals.setAttribute("id", "accvals");
            vals.style.position = "absolute";
            vals.style.left = "100px";
            vals.style.top = "350px";
            back.appendChild(vals);
            var options = {
                frequency: 100
            };
            watchIDAccel = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);


            navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);


            function onSuccess(acceleration) {

            	var myTimer = null;
				function delayTimer(){
					accelDelay=false;
					clearInterval(myTimer);
				}

                var acX = acceleration.x.toFixed(1) * -1;
                var acY = acceleration.y.toFixed(1);
                var acZ = acceleration.z.toFixed(1);
                var vals = document.getElementById('accvals');
                var accelstr = "<strong>Accel X: </strong>" + acX + "<br>" + "<strong>Accel Y: </strong>" + acY + "<br>" + "<strong>Accel Z: </strong>" + acZ;
                vals.innerHTML = accelstr;
               if (acX > 5 && !accelDelay) {
                    var f = document.getElementById("playcard");
                    if (f != null) {
                        //direction does not appear to work
                        f.direction ="right";
                        f.toggle();
                        accelDelay=true;
						myTimer=setInterval(function(){delayTimer()},2000);
                    }

                }
                if (acX < -5 && !accelDelay) {
                    var f = document.getElementById("playcard");
                    if (f != null) {
                        //direction does not appear to work
                        f.direction ="left";
                        f.toggle();
                        accelDelay=true;
						myTimer=setInterval(function(){delayTimer()},2000);                        
                    }

                }
                if (acY < -5 && !accelDelay) {
                    var f = document.getElementById("playcard");
                    if (f != null) {
                        //direction does not appear to work
                        f.direction ="up";
                        f.toggle();
                        accelDelay=true;
						myTimer=setInterval(function(){delayTimer()},2000);                        
                    }

                }                
                if (acY > 5 && !accelDelay) {
                    var f = document.getElementById("playcard");
                    if (f != null) {
                        //direction does not appear to work
                        f.direction ="down";
                        f.toggle();
                        accelDelay=true;
						myTimer=setInterval(function(){delayTimer()},4000);                        
                    }

                }                 
                
            }
            // onError: Failed to get the acceleration
            //

            function onError() {
                alert('onError!');
            }
        }
        /* function getAccel() {    
            flip();
            var back = document.querySelector('x-flipbox div:last-child');
            canvas = document.createElement('canvas');
            back.appendChild(canvas);

            var rect = canvas.getBoundingClientRect();
            
            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            currX = canvas.width / 2;
            currY = canvas.height / 2;        
        
			var options = { frequency: 100 };  
			watchIDAccel = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);        
        
            console.log("here");
            navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);

            function onSuccess(acceleration) {
            	var acX = acceleration.x.toFixed(1)*-1;
          		var acY = acceleration.y.toFixed(1);
          		var acZ = acceleration.z.toFixed(1);
          		context.clearRect(10, 0, canvas.width/2, 50);
				context.fillStyle="white";
				context.font="16px Arial";
				context.fillText("Accel X " + acX,10,20);
				context.fillText("Accel Y " + acY,10,35);
				context.fillText("Accel Z " + acZ,10,50);          		
          		if( (Math.abs(parseFloat(acX)) > 5) || (Math.abs(parseFloat(acY)) > 5) ){
                 console.log('Acceleration X: ' + acX + '\n' + 'Acceleration Y: ' + acY + '\n' + 'Acceleration Z: ' + acZ + '\n' + 'Timestamp: ' + acceleration.timestamp + '\n');
          		 context.beginPath();
      			 context.moveTo(currX, currY);
      			 context.lineTo(currX+parseInt(acX), currY+parseInt(acY));
      			 context.lineWidth = 3.5;
                 context.strokeStyle = 'rgba(255,0,0,0.9)';
                 context.stroke(); 
                 currX += parseInt(acX);
                 currY += parseInt(acY);
                 if( currX > canvas.width )currX=canvas.width;
                 if( currY > canvas.height )currX=canvas.height;
                 if( currX < 0 )currX=0;
                 if( currY < 55 )currY=55;
                 
                }
            }
            // onError: Failed to get the acceleration
            //

            function onError() {
                alert('onError!');
            }
        }*/
        //Draw the Ball
        function drawBall(x, y, a) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (bCanvas == null) {
                setupBallCanvas();
            }
            var redval = 68;
            var greenval = 68;
            var blueval = 68;
            drawCirc(x + 1, y + 1, ballRadius + 3, redval, greenval, blueval, 0.3, context);
            context.drawImage(bCanvas, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
            context.globalAlpha = 1;
        }

        function handleMovement() {
            frameID = requestAnimationFrame(handleMovement);
            context.clearRect(currX, currY, 60, 60);
            currX += dX;
            currY += dY;
            if (currX >= (canvas.width - 20))(currX = canvas.width - 20);
            if (currX <= 20) currX = 20;
            if (currY >= (canvas.height - 20))(currY = canvas.height - 20);
            if (currY <= 20) currY = 20;
            console.log("currX = " + currX + " currY = " + currY);
            //context.drawImage(img, currX, currY);
            drawBall(currX, currY, .9)
            console.log("Drew");
        }

        //Really Device Motion
        function deviceOrientationEvent(eventData) {
            var alpha = Math.round(eventData.alpha);
            //front to back - neg back postive front
            var beta = Math.round(eventData.beta);
            //roll left positive roll right neg
            var gamma = Math.round(eventData.gamma);
            dX = -(gamma / 360) * 100; //Math.cos((gamma/360)*Math.PI*2);
            dY = -(beta / 360) * 100; //Math.cos((gamma/360)*Math.PI*2)*beta/7;
            console.log("dX = " + dX + " dY = " + dY);
        }

        function runAccel() {
            flipDemo('Accelerometer');
            var back = document.querySelector('x-flipbox div:last-child');
            canvas = document.createElement('canvas');
            back.appendChild(canvas);

            var rect = canvas.getBoundingClientRect();

            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            dX = 0;
            dY = 0;
            currX = canvas.width / 2;
            currY = canvas.height / 2;
            img = new Image(); //create image object
            img.onload = function () { //create our handler
                context.drawImage(this, currX, currY); //when image finishes loading, draw it
            };
            img.src = "img/accel.png";

            window.addEventListener('deviceorientation', deviceOrientationEvent);
            handleMovement();
        }

        function runGeo() {
        	flipDemo('Geolocation');
 			//need a loading message

            var onSuccess = function (position) {
                console.log('Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n');
            	var back = document.querySelector('x-flipbox div:last-child');
            	var mapdiv = document.createElement('div');
            	back.appendChild(mapdiv);
            	mapdiv.setAttribute('id', 'map');
            
            	mapdiv.style.height="300px"
            	mapdiv.style.width= "320px";
	
 	        	var globe = new DAT.Globe(mapdiv);

      			console.log(globe);
      			var pt = new THREE.Geometry();
      		
      			//var data = [53.795,-1.53,2,2];
      			var geodata = [position.coords.latitude, position.coords.longitude, 2, 2];
      			globe.addData(geodata, {format: 'magnitude', animated: false});  
      			globe.createPoints();               
	        	globe.animate();            
            }

            function onError(error) {
                alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }

        function runCompassUpdate() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var xStart = (canvas.width - img.width) / 2;
            var yStart = (canvas.height - img.height) / 2;
            var myrads = Math.PI / 180 * (360 - myHeading);
            context.font = '18pt Calibri';
            context.fillStyle = 'white';
            context.fillText("Current Heading: " + myHeading, canvas.width * .095, canvas.height * .05);
            context.drawImage(oCanvas, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
            context.save();
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(myrads);
            context.translate(-img.width / 2, -img.height / 2);
            context.drawImage(img, 0, 5, img.width, img.height-5);
            //console.log("Drawing Needle");
            context.restore();
            context.drawImage(gImg, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
        }

        function runCompass() {
            flipDemo('Compass');

            function onSuccess(heading) {
                var element = document.getElementById('heading');
                myHeading = (heading.magneticHeading).toFixed(2);
                console.log("My Heading = " + myHeading);
                runCompassUpdate();
            }

            function onError(compassError) {
                alert('Compass error: ' + compassError.code);
            }

            var options = {
                frequency: 500
            };
            watchID = navigator.compass.watchHeading(onSuccess, onError, options);


            var back = document.querySelector('x-flipbox div:last-child');
            canvas = document.createElement('canvas');
            back.appendChild(canvas);

            var rect = canvas.getBoundingClientRect();

            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            gImg = new Image();
            gImg.src = "img/glass.png";
            img = new Image(); //create image object
            console.log("CH " + canvas.height + " CW " + canvas.width);
            img.onload = function () { //create our handler
                var xStart = (canvas.width - img.width) / 2;
                var yStart = (canvas.height - img.height) / 2;
                offscreenCanvas();
                runCompassUpdate();
            };
            img.src = "img/cNeedle.png";
        }


        function runPro() {


            /*function onPrompt(results) {
    			//alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
    			
                // find all contacts with 'Bob' in any name field
                var options = new ContactFindOptions();
                options.filter = "";
                var fields = ["name"];
                navigator.contacts.find(fields, onSuccess, onError, options);
            	function onSuccess(contacts) {
            		if( contacts.length == 0 ) createAndSaveContact();
                	for (var i = 0; i < contacts.length; i++) {
                    	console.log("Name = " + contacts[i].name.givenName +"," +contacts[i].name.familyName);
                    	if( contacts[i].name.givenName == "Jane"  && contacts[i].name.familyName == "Doe" ){
                    		console.log("name already added");
                    	}else{
                    		console.log("adding user");
                    		createAndSaveContact();
                    	}
                	}
            	}
            	// onError: Failed to get the contacts
            	function onError(contactError) {
            	    alert('onError!');
            	}
			}*/
            function onPrompt(results) {
                alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
            }
            navigator.notification.vibrate(500);
            navigator.notification.prompt(
                'Enter Name', // message
                onPrompt, // callback to invoke
                'Prompt Test', // title
                ['Ok', 'Exit'], // buttonLabels
                'Jane,Doe' // defaultText
            );

        }

        function createAndSaveContact() {
            var fname = document.getElementById('fname').value;
            var lname = document.getElementById('lname').value;
            var email = document.getElementById('email').value;

            function onSuccess(contact) {
                console.log("Save Success");
                flipMain();
            };

            function onError(contactError) {
                console.log("Add Error = " + contactError.code);
                flipMain();
            };

            // create a new contact object
            var contact = navigator.contacts.create();
            //contact.displayName = "Test";
            //contact.nickname="Test";
            // populate some fields
            var name = new ContactName();
            name.givenName = fname;
            name.familyName = lname;
            contact.name = name;
            var emails = [];
            //Currently not working
            emails[0] = new ContactField('Personal', 'junk@gmail.com', false);
            contact.emails = emails;
            // save to device
            contact.save(onSuccess, onError);

        }

        function saveContact() {
            var options = new ContactFindOptions();
            options.filter = "";
            var fields = ["name", "emails"];
            var fname = document.getElementById('fname').value;
            var lname = document.getElementById('lname').value;
            var email = document.getElementById('email').value;
            navigator.contacts.find(fields, onSuccess, onError, options);

            function onSuccess(contacts) {
                if (contacts.length == 0) createAndSaveContact();
                for (var i = 0; i < contacts.length; i++) {
                    console.log("Name = " + contacts[i].name.givenName + "," + contacts[i].name.familyName + " emails " + contacts[i].emails);
                    if (contacts[i].name.givenName == fname && contacts[i].name.familyName == lname) {
                        console.log("name already added");
                        flipMain();
                        return;
                    }

                }
                createAndSaveContact();

            }
            // onError: Failed to get the contacts

            function onError(contactError) {
                alert('onError!');
                flipMain();
            }
        }

        function addNewContact() {
            flipDemo('Contact');
            var back = document.querySelector('x-flipbox div:last-child');
            var form = document.querySelector('.contactForm').cloneNode(true);
            back.appendChild(form);

            var button2 = document.querySelector('x-flipbox .contactForm .save');
            button2.addEventListener('click', saveContact, false);
        }

        var button = document.getElementById('getPicture');
        button.addEventListener('click', getPicture, false);
        button = document.getElementById('getAccel');
        button.addEventListener('click', getAccel, false);
        button = document.getElementById('runAccel');
        button.addEventListener('click', runAccel, false);
        button = document.getElementById('runGeo');
        button.addEventListener('click', runGeo, false);
        button = document.getElementById('runCompass');
        button.addEventListener('click', runCompass, false);
        button = document.getElementById('runPro');
        button.addEventListener('click', runPro, false);
        button = document.getElementById('addNewContact');
        button.addEventListener('click', addNewContact, false);
    }
};
