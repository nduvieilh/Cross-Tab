# Cross-Tab

## Description
A wrapper for localStorage that enables cross tab communication on the same browser on the same domain for use in multi-monitor web applications.  Simple write commands allow for one tab to target another open tab to message pass and the persistences of localStorage will keep hundreds of thousands of objects accessible to all tabs.  A verbose garbage collection system paired with a check off platform allows for objects to be collected and removed when all tabs agree that they are done with that object.  A windows object will keep track of the availability, current status, and add/removed events for each tab.  

## How it works
Cross-tab makes use of the HTML5 localStorage feature to message pass between open tabs.  As part of the localStoarage API an event will fire on all other tabs that are open on that domain and browser when a new value is pushed into the localStorage object.  Cross-tab will subscribe to this event and run callbacks based on whether that tab is targeted or ignored.  Abstracting the localStorage event out of the equation.  Since the localStorage object will only store text fields indexed by a key, cross-tab will create the cross-tab object on the write command and will `JSON.stringify()` that object to be stored in localStorage.  Once written the storageCallback will fire on all other tabs after that object has been run through `JSON.parse()`.  There are also other public functions exposed to the library that will allow a developer to read a value from a specific key at any time or you can write using the `CrossTab("write", value, key)` method to update an existing value.  A preceding event will fire with the `kind` variable set to *update*.

## Setup Basics

Paste this code to initialize the cross-tab library

```javascript

window.crossTab = $(document).CrossTab({
	// Optional settings passed in here
});
```

Override the **storageCallback** to get an event when a cross-tab object is targeted to that tab
```javascript
window.crossTab = $(document).CrossTab({
	// Other optional settings passed in here
	storageCallback: function(data, kind, key, e) {
		// Callback code here

		// Example code below:
		switch(kind) {
			case 'new':
				alert("A new event " + data.type + " was created with the value: " + data.value);
				break;
			case 'update':
				alert("A event was updated to: " + data.value);
				break;
			case 'delete':
				alert("A event was deleted");
				break;
		}
	}
}
});
```

Use the `crossTab.CrossTab("write", data)` to send data to another tab
```javascript
var data = "This is a message";
crossTab.CrossTab("write", data);
```


## Requirements
Right now **jQuery** is the only requirement



## Default Settings
**Debug:** Toggle on and off console.log statements available throughout the library and default callbacks (false by default)  

**Clear:** Toggle on and off to run the clear command when the first window accesses the page.  This will clear all previous settings, set to false to persist messages across multiple sessions (true by default)  

**uid:** Manual override for setting a unique id for a particular window object (generates a uuid by default) **Must be unique**  

**Prefix:** prevents collisions of cross tab localStorage keys with other persistent elements in localStorage.  ("crosstab" by default)  

**Callbacks:** *All callbacks below are able to be overwritten*


## Callbacks

### Storage Callback
**Purpose:** Event that will fire when a storage event is called  

**Parameters:**   
 - data - Entire data array passed back with  
 - kind - Type of cross-tab object  
 - key - Key used in the localStorage  
 - event - Raw event that is sent from the localStorage API  

**Default:**  
```javascript
storageCallback: function(data, kind, key, e) {  
	if(this.debug !== 'undefined') {  
		console.log("Storage Event Fired.", kind, ": ", data);  
	}  
},  
```

### Open Callback
**Purpose:** Event that will fire when a new window opens  

**Parameters:**  
 - id - id of new tab that joined  
 - selector - selector of the new tab that joined  

**Default:**  
```javascript
openCallback: function(id, selector) {  
	if(this.debug !== 'undefined') {  
		console.log("A new tab has joined id: "+selector+" with id: "+id);  
	}  
},  
```

### Garbage Collection Callback
**Purpose:** Event that will fire when a garbage collection event happens  

**Parameters:** *none*  

**Default:**  
```javascript
garbageCollectCallback: function() {  
	if(this.debug !== 'undefined') {  
		console.log("Storage Garbage Collected");  
	}  
},  
```

### Clear Callback
**Purpose:** Event that will fire when a clear event is called  

**Parameters:**  
 - removed - array of keys that was just deleted  
 
**Default:**  
```javascript
clearCallback: function(removed) {  
	if(this.debug !== 'undefined') {  
		console.clear();  
		console.log("Storage cleared.  These items removed: ", removed);  
	}  
}  
```


## The Window Object (Coming Soon)

### Purpose
 The window object will keep track of all windows currently talking to each other on the same cross tab platform using the same prefix.  It will fire events when a tab is added, closes, or refreshed so all other tabs will have a callback for these events.  

### Targeting
The window object will return a object indexed by key with information about each tab and their current status.  Tabs will be able to be targeted with the `to` array within a cross-tab object or via a jQuery selector (See jQuery integration section) 


## Anatomy of a cross-tab object

### Example
```javascript
crosstab-31177c50-57e1-6ae1-8adb-a98141a167d0 = {
	checkOff: {                                             // Check off system contains a list 
		t0808e324-73ad-40d3-ac7d-5d8b632e4b80: {            // of different tabs that have checked
			id: "0808e324-73ad-40d3-ac7d-5d8b632e4b80",     // that they are complete with that 
			selector: "window-one",						    // object so it can be garbage collected
			time: "2015-05-31T03:39:55.193Z"
		},
		97041207-d28e-51f9-88eb-2d879fadf6dc: {
			id: "97041207-d28e-51f9-88eb-2d879fadf6dc",
			selector: "window-two",
			time: "2015-05-31T03:39:55.194Z"
		}
	},
	created: "2015-05-31T03:39:55.193Z",					// Created date object 
	from: {													// id and selector of the object creator
		id: "0808e324-73ad-40d3-ac7d-5d8b632e4b80",
		selector: "window-one"
	},
	id: "crosstab-31177c50-57e1-6ae1-8adb-a98141a167d0",    // id of that object 
	modified: "2015-05-31T03:39:55.193Z",					// Last time this object was modified
	responseTime: 2,										// Amount of time between created and read
	type: "buttonClick",									// type of object
	value: "Button 1 was pressed" 							// Value that is stored
}
```

**Check Off:** The check off object is a storage object for all tabs that have seen this object and have agreed that they are done with it.  See check off section about performance impact of using the check off system.

**From: ** 

## Check Off System

### What is it?
The checkoff system is a optional list of all of the tabs that have agreed that they are done with a particular messaged passed through the system.  As each tab checks off it will ensure that the number of checked off items either matches all of the active tabs in the cross-tab window object or matches each tab supplied in the target `to` object.  Once either set of tab id's matches the object will be deleted from the localStorage object via the cross-tab garbage collection method.  If the cross-tab checkOff setting is set to `false` then the checkOff variable will be undefined in each cross-tab object.  See check off performance section for more info.

### Performance (Optimization Needed)
Due to the way that the check off system works each tab, once getting a new event that is targeted to them, will then fire off an update of that entry in the localStorage with their tab id in the checkOff object.  So for two active tabs with `checkOff: true` will fire off two events every time a new entry is added.  One for the original event and another to tell all other tabs that it has seen it and is done with it.  For each additional tab each original entry will spawn off n - 1 extra events to update the checkoff values.  The performance impact will bring the response time up from 0-10 milliseconds to around 30-50 for 4 active tabs.  This will grow the more active tabs subscribing to that particular event.  In order to prevent a race condition a public checkOff() method is exposed to the cross-tab library to ensure that low level updating of the event is handled most efficiently.  

## jQuery Integration

### jQuery Selector (Coming Soon)
A custom jQuery selector will allow the developer to target objects on another tab and will return a promise method back to the source tab to be used as a callback.

### Promise Method (Coming Soon)
The promise method will return a .done(), .fail(), and .always() callbacks with proper data to the source tab to run an event after the target tab has checked off or failed to check off the use of the targeted message.

## Examples

### Lists
Simple list app that will display a few controls on the main index page and read those commands on the slave page.  

Start the app with `node server.js` and open two tabs at `localhost:3000` and `localhost:3000/slave`

## Planned Examples

### Maps (Coming Soon)
A simple maps application that will show controls for a Google Maps application on one window and the map on the other clearing up space to have a full window map to manipulate on one screen and verbose controls on another.

### Graph (Coming Soon)
A multi-monitor graphs application for easy manipulation on one window and graphic representation on the other.  