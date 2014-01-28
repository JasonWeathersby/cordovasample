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
var context = null;
var canvas = null;
var watchID = null;
var myHeading = 0;
var oCanvas = null;

//Utility function for request animation
var requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
})();

//Utility function to cancel animation
var cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();

//This function just creates an offscreen canvas to hold a picture of the compass
//background

function offscreenCanvas(img) {
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
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        function flip() {
            var flipbox = document.querySelector('x-flipbox');
            var back = flipbox.querySelector('div:last-child');
            back.innerHTML ='<button class="back">back</button>';
            flipbox.toggle();

            if (watchID) {
                navigator.compass.clearWatch(watchID);
                watchID = null;
            }

            back.querySelector('button.back').addEventListener('click', function() {
                flipbox.toggle();
            });
        }

        function appendToOutput(el) {
            var flipbox = document.querySelector('x-flipbox');
            var back = flipbox.querySelector('div:last-child');
            back.appendChild(el);
        };

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);

 		function getPicture() {
		    navigator.camera.getPicture(function(src) {
                flip();
			    var img = document.createElement('img');
			    img.id = 'slide';
			    img.src = src;
			    appendToOutput(img);
            }, function() {}, {destinationType: 1});
		}

        function getAccel() {
            console.log("here");
            navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);
            // onSuccess: Get a snapshot of the current acceleration
            //

            function onSuccess(acceleration) {
                alert('Acceleration X: ' + acceleration.x + '\n' + 'Acceleration Y: ' + acceleration.y + '\n' + 'Acceleration Z: ' + acceleration.z + '\n' + 'Timestamp: ' + acceleration.timestamp + '\n');
            }
            // onError: Failed to get the acceleration
            //

            function onError() {
                alert('onError!');
            }
        }

        function handleMovement(context, img) {
            context.clearRect(currX, currY, 60, 60);
            currX += dX;
            currY += dY;
            if (currX >= (canvas.width - 20))(currX = canvas.width - 20);
            if (currX <= 20) currX = 20;
            if (currY >= (canvas.height - 20))(currY = canvas.height - 20);
            if (currY <= 20) currY = 20;
            context.drawImage(img, currX, currY);
        }

        //Really Device Motion

        function runAccel() {
            flip();
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
            var img = new Image(); //create image object
            img.onload = function () { //create our handler
                context.drawImage(this, currX, currY); //when image finishes loading, draw it
            };
            img.src = "img/accel.png";

            window.addEventListener('deviceorientation', function (eventData) {
                //this appears to fire approx every 200 milliseconds 
                //turn left and right
                var alpha = Math.round(eventData.alpha);
                //front to back - neg back postive front
                var beta = Math.round(eventData.beta);
                //roll left positive roll right neg
                var gamma = Math.round(eventData.gamma);
                dX = -(gamma / 360) * 100; //Math.cos((gamma/360)*Math.PI*2);
                dY = -(beta / 360) * 100; //Math.cos((gamma/360)*Math.PI*2)*beta/7;
                handleMovement(context, img);
            });
        }

        function runGeo() {
            var onSuccess = function (position) {
                    alert('Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + position.timestamp + '\n');
                };

            function onError(error) {
                alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }

        function runCompassUpdate(img) {
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
            context.drawImage(img, 0, 0);
            context.restore();

        }

        function runCompass() {
            function onSuccess(heading) {
                var element = document.getElementById('heading');
                myHeading = (heading.magneticHeading).toFixed(2);
            }

            function onError(compassError) {
                alert('Compass error: ' + compassError.code);
            }

            var options = {
                frequency: 500
            };
            watchID = navigator.compass.watchHeading(onSuccess, onError, options);

            flip();
            var back = document.querySelector('x-flipbox div:last-child');
            canvas = document.createElement('canvas');
            back.appendChild(canvas);

            var rect = canvas.getBoundingClientRect();
            
            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            var img = new Image(); //create image object
            console.log("CH " + canvas.height + " CW " + canvas.width);
            img.onload = function () { //create our handler
                var xStart = (canvas.width - img.width) / 2;
                var yStart = (canvas.height - img.height) / 2;
                offscreenCanvas(this);
                runCompassUpdate(this);
            };
            img.src = "img/cNeedle.png";
        }


        function runPro() {
            var windowA = window.open();
            windowA.addEventListener('unload', openB);
            var button = windowA.document.createElement('button');
            button.appendChild(windowA.document.createTextNode('Close me'));
            button.addEventListener('click', openB, false);
            windowA.document.body.appendChild(button);

            function openB() {
                console.log('windowA', windowA);
                if (windowA) {
                    windowA.removeEventListener('unload', openB, false);
                    windowA.close();
                }
                var windowB = window.open();
                console.log('windowB', windowB);
                var h1 = windowB.document.createElement('h1');
                h1.appendChild(windowB.document.createTextNode('All is fine!'));
                windowB.document.body.appendChild(h1);
            }

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
			}
			navigator.notification.vibrate(500);
			navigator.notification.prompt(
        		'Enter Contact First and Last Name separated by a comma',  // message
        		onPrompt,                  // callback to invoke
        		'Add Contact',            // title
        		['Ok','Exit'],             // buttonLabels
        		'Jane,Doe'                 // defaultText
        		);*/

        }

        function createAndSaveContact() {
            var fname = document.getElementById('fname').value;
            var lname = document.getElementById('lname').value;
            var email = document.getElementById('email').value;

            function onSuccess(contact) {
                console.log("Save Success");
                flip();
            };

            function onError(contactError) {
                console.log("Add Error = " + contactError.code);
                flip();
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
                        flip();
                        return;
                    }

                }
                createAndSaveContact();

            }
            // onError: Failed to get the contacts

            function onError(contactError) {
                alert('onError!');
                flip();
            }		
		}
		function addNewContact(){
            flip();
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
