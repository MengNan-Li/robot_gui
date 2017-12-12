/*  simple_gui.js - Version 1.0 2013-09-29

    A simple HTML5/rosbridge script to control and monitor a ROS robot

    Created for the Pi Robot Project: http://www.pirobot.org
    Copyright (c) 2013 Patrick Goebel.  All rights reserved.

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.5

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details at:

    http://www.gnu.org/licenses/gpl.html
 */

// Set the rosbridge and mjpeg_server port
var rosbridgePort = '9090';
var mjpegPort = '8080';

// Get the current hostname
thisHostName = document.location.hostname;
thisHostName = '192.168.228.194';

// Set the rosbridge and mjpeg server hostname accordingly
var rosbridgeHost = thisHostName;

// Build the websocket URL to the rosbride server
var serverURL = 'ws://' + rosbridgeHost + ':' + rosbridgePort;


// A varible to hold the chatter topic and publisher
var chatterTopic;

// A variable to hold the chatter message
var chatterMsg;

// The ROS namespace containing parameters for this script
var param_ns = '/robot_gui';


// A handle for the publisher timer
var pubHandle = null;

// A handle for the stop timer
var stopHandle = null;

// The rate in Hz for the main ROS publisher loop
var rate = 5;

// Get the current window width and height
var windowWidth = this.window.innerWidth;
var windowHeight = this.window.innerHeight;

// The main ROS object
var ros = new ROSLIB.Ros();

// Connect to ROS
function init_ros() {
  ros.connect(serverURL);
  // Set the rosbridge host and port values in the form
  document.getElementById('rosbridgeHost').value = rosbridgeHost;
  document.getElementById('rosbridgePort').value = rosbridgePort;
}

// If there is an error on the back end, an 'error' emit will be emitted.
ros.on('error', function(error) {
  console.log('Rosbridge Error: ' + error);
});

// Wait until a connection is made before continuing
ros.on('connection', function() {
  console.log('Rosbridge connected.');

  // Create the chatter topic and publisher
  chatterTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/chatter',
    messageType: 'std_msgs/String',
  });

  // Create the chatter message
  var message = document.getElementById('chatterMessage');
  chatterMsg = new ROSLIB.Message({data: message.value});

  // Start the publisher loop
  console.log('Starting publishers');
  pubHandle = setInterval(refreshPublishers, 1000 / rate);
});

function toggleChatter() {
  var pubChatterOn = document.getElementById('chatterToggle').checked;
  if (pubChatterOn)
    chatterTopic.advertise();
  else
    chatterTopic.unadvertise();
}

function updateChatterMsg(msg) {
  chatterMsg.data = msg;
}

function refreshPublishers() {
	var pubChatterOn = document.getElementById('chatterToggle').checked;
  if (pubChatterOn) chatterTopic.publish(chatterMsg);
}


function subChatter() {
  var subscribe = document.getElementById('chatterSub').checked;
  var chatterData = document.getElementById('chatterData');
  var listener = chatterTopic;

  if (subscribe) {
    console.log('Subscribed to ' + listener.name);
    listener.subscribe(function(msg) {
      chatterData.value = msg.data;
    });
  } else {
    listener.unsubscribe();
    console.log('Unsubscribed from ' + listener.name);
  }
}

function setROSParam() {
  var paramName = document.getElementById('setParamName');
  var paramValue = document.getElementById('setParamValue');
  var param = new ROSLIB.Param({ros: ros, name: paramName.value});

  if (isNumeric(paramValue.value)) {
    param.set(parseFloat(paramValue.value));
  } else {
    param.set(paramValue.value);
  }
}

function getROSParam() {
  var paramName = document.getElementById('getParamName');
  var paramValue = document.getElementById('getParamValue');
  var param = new ROSLIB.Param({ros: ros, name: paramName.value});
  param.get(function(value) {
    paramValue.value = value;
  });
}


function connectDisconnect() {
  var connect = document.getElementById('connectROS').checked;

  if (connect)
    connectServer();
  else
    disconnectServer();
}

function disconnectServer() {
  console.log('Disconnecting from ROS.');
  ros.close();
}

function connectServer() {
  rosbridgeHost = document.getElementById('rosbridgeHost').value;
  rosbridgePort = document.getElementById('rosbridgePort').value;
  serverURL = 'ws://' + rosbridgeHost + ':' + rosbridgePort;
  mjpegViewer.changeStream(videoTopic);
  try {
    ros.connect(serverURL);
    console.log('Connected to ROS.');
  } catch (error) {
    console.write(error);
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function publish_message() {
  var msg = document.getElementById('chatterMessage1');
  chatterMsg.data = msg.value;
	chatterTopic.publish(chatterMsg);
}