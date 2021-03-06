﻿var marker;
var previous_id = null;
var current_id = 1;
var evt_id;
var evt_operator;
var evt_date;
var evt_msg;
var evt_level;
var selectedDrones = [];
var ctrlDown = false;
var selectedUAV;
var curUser;

$(document).ready(function () {

    //getting current user and such -- throws u token if not logged in
    var userJson = $('#current_user').html();
    curUser = JSON.parse(userJson);

    //map options -- looks solid dragos was here 3/30/15 
    mapOptions = {
        zoom: 17,
        center: new google.maps.LatLng(34.2417, -118.529),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true,
        draggable: false,
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [
                  { visibility: "off" }
            ]
        }]
    };

    //don't really know what this is something about a filter looks fine -- dragos was here 3/30/15
    var priorityfilter_value = {
        display_all_text: "Show all",
        col_0: "none",
        col_1: "none",
        col_2: "select"
    };
    setFilterGrid("priority_table", priorityfilter_value);

    //still don't know what this is, some javascript, looks fine though -- dragos was here 3/30/15
    var operatorfilter_value = {
        display_all_text: "Show all",
        col_0: "select",
        col_1: "select",
        col_2: "none",
        col_3: "none"
    };
    setFilterGrid("operator_table", operatorfilter_value);

    //get the map, set up some tables looks ok -- dragos was here 3/30/15
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var table = document.getElementById("UAV_table");
    var table2 = document.getElementById("priority_table");
    var table3 = document.getElementById("operator_table");
    var table4 = document.getElementById("event_log_table");

    //table2 or something looks ok -- dragos was here 3/30/15
    if (table2 != null) {
        for (var i = 2; i < table2.rows.length; i++) {
            table2.rows[i].onclick = function () {
                document.getElementById("choose_uav_table").style.display = 'block';
            }
        }
    }

    //table3 okay cool looks fine -- dragos was here 3/30/15
    if (table3 != null) {
        for (var i = 2; i < table3.rows.length; i++) {
            table3.rows[i].onclick = function () {
                document.getElementById("choose_uav_table").style.display = 'block';
            }
        }
    }

    //okay table4 it's all good -- dragos was here 3/30/15
    if (table4 != null) {
        for (var i = 2; i < table4.rows.length; i++) {
            table4.rows[i].onclick = function () {
                document.getElementById("choose_uav_table").style.display = 'block';
            }
        }
    }
    var presentMarker, lastMarker;
    function UpdateVehicle(uav, updatedUAV) {
        var LatLng = new google.maps.LatLng(updatedUAV.Latitude, updatedUAV.Longitude);

        //SetUAVMarker(uav);
        uav.marker.setPosition(LatLng);
        uav.Battery = updatedUAV.BatteryLevel;
        uav.Alt = updatedUAV.Altitude;
        uav.BatteryCheck = parseFloat(Math.round(updatedUAV.BatteryLevel * 100) / 100).toFixed(2);
        uav.Yaw = updatedUAV.Yaw;

        //Check drone heading and adjust as necessary
        if ((Math.round((10000000 * uav.Orientation)) / 10000000) != (Math.round((10000000 * uav.Yaw)) / 10000000)) {

            uav.Orientation = uav.Yaw;

            uav.marker.uavSymbolBlack.rotation = uav.Yaw;
            uav.marker.uavSymbolGreen.rotation = uav.Yaw;
            uav.marker.setOptions({
                icon: uav.marker.uavSymbolBlack
            })
        }


        uav.marker.setOptions({
            labelContent: uav.Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uav.Alt + '<br/><b>Bat: </b>' + uav.BatteryCheck + '</div>'
        });

        return uav;
    };

    $.connection.hub.start().done(function () {
        console.log("connection for signalR...success");
    });

    var adminHub = $.connection.adminHub;
    adminHub.client.newDrop = function (drop) {
        if (uavs[drop.uavID] != null)
            uavs[drop.uavID].Battery -= drop.amount / 100;
            console.log(uavs[drop.uavID].Id + " " +uavs[drop.uavID].Battery)
    }


    var emitHub = $.connection.eventLogHub;
    emitHub.client.newEvent = function (evt) {

        console.log(evt);
        var checkMessage = evt.message.split(" ");
        if (checkMessage[0] != "Acknowledged:") {

            console.log(evt);

            //var eventObj = JSON.stringify(evt);
            //alert(eventObj);

            evt_id = evt.uav_id;
            evt_operator = evt.operator_screen_name;
            evt_date = evt.create_date;
            evt_msg = evt.message;
            evt_level = evt.criticality;


            for (var i = 0; i < table.rows.length; i++) {
                if (evt.criticality == 'critical' && table.rows[i].cells[0].innerHTML == evt_id) {
                    table.rows[i].style.backgroundColor = "#FF0000";
                    table.rows[i].style.color = "#FFFFFF";
                }

                if (evt.criticality == 'Warning' && table.rows[i].cells[0].innerHTML == evt_id) {
                    table.rows[i].style.backgroundColor = "#FFF612";
                    table.rows[i].style.color = "#0a074a";
                }
            }

            if (current_id == uavs[evt.uav_id].Id) {
                document.getElementById('eventlog_td1').innerHTML = evt.uav_id;
                document.getElementById('eventlog_td2').innerHTML = evt.operator_screen_name;
                document.getElementById('eventlog_td3').innerHTML = evt.create_date;
                document.getElementById('eventlog_td4').innerHTML = evt.message;
                document.getElementById('eventlog_td5').innerHTML = evt.criticality;
            }

            else if (current_id != uavs[evt.uav_id].Id) {
                document.getElementById('eventlog_td1').innerHTML = "NO";
                document.getElementById('eventlog_td2').innerHTML = "EVENT";
                document.getElementById('eventlog_td3').innerHTML = "FOR";
                document.getElementById('eventlog_td4').innerHTML = "UAV";
                document.getElementById('eventlog_td5').innerHTML = evt.uav_callsign;
            }

            var boxText = document.createElement("div");
            boxText.style.cssText = "border: 1px solid black;margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
            boxText.innerHTML = "<span style='color: red;'>Warning: </span>" + evt.message;

            var alertText = document.createElement("div");
            alertText.style.cssText = "border: 1px solid red;height: 40px;background: #333;color: #FFF;padding: 0px 0px 15px 4px;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;"
            alertText.innerHTML = "<span style='color: red; font-size: 30px;'>!</span";

            var infobox = new InfoBox({
                content: boxText,
                disableAutoPan: false,
                maxWidth: 100,
                pixelOffset: new google.maps.Size(-75, 30),
                zIndex: null,
                enableEventPropagation: true,
                pane: "floatPane",
                boxStyle: {
                    opacity: 0.75,
                    width: "150px"
                },
                closeBoxMargin: "9px 1px 2px 2px",
                uav_id: null
            })

            var infoboxAlert = new InfoBox({
                content: alertText,
                disableAutoPan: false,
                maxWidth: 20,
                pixelOffset: new google.maps.Size(-10, -80),
                zIndex: null,
                boxStyle: {
                    opacity: 0.75,
                    width: "20px",
                },
                uav_id: null
            })

            //infobox.open(map, uavs[evt.uav_id].marker);
            infobox.uav_id = uavs[evt.uav_id].Id;
            //infoboxAlert.open(map, uavs[evt.uav_id].marker);
            infoboxAlert.uav_id = uavs[evt.uav_id].Id;

            infoboxContainer[evt.uav_id] = containBox(infobox, infoboxAlert);

            document.getElementById(evt.uav_id).style.backgroundColor = "red";
            uavs[evt.uav_id].CurrentEvent = evt;
            uavs[evt.uav_id].setEventOnce = 0;
        }
    }

    //connect to the hub -- dragos was here 3/30/15
    var vehicleHub = $.connection.vehicleHub;

    //okay on start do this sure -- dragos was here 3/30/15
    $.connection.hub.start().done(function () {
        console.log("connection for signalR...success");
        //Add this connectionID to the user's list of active connections so user-specific calls can be made
        vehicleHub.server.addConnection(curUser.user_id);
    });

    //not sure what this does but it looks like it works -- dragos was here 3/30/15
    vehicleHub.client.changeSelected = function (uavId, selectionState) {
        console.log("hit change");
        for (var i = 1; i < table.rows.length; i++) {
            if (table.rows[i].cells[0].innerHTML == uavId) {
                if (selectionState == true) {
                    table.rows[i].style.backgroundColor = "#5CD65C";
                    table.rows[i].style.color = "#FFFFFF";
                }
                else {
                    table.rows[i].style.backgroundColor = "#FFFFFF";
                    table.rows[i].style.color = "#000000";
                }
            }
        }
    }


    //okay update the flightstate here and move the uavs on the map -- dragos was here 3/30/15
    //not here
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        uavs[vehicle.Id].Id = vehicle.Id;
        uavs[vehicle.Id].Battery = vehicle.BatteryLevel;
        uavs[vehicle.Id].Alt = vehicle.Altitude;
        uavs[vehicle.Id].BatteryCheck = parseFloat(Math.round(vehicle.BatteryLevel * 100)).toFixed(2);

        for (var i = 1; i < table.rows.length; i++) {
            if (table.rows[i].cells[0].innerHTML == uavs[vehicle.Id].Id) {
                table.rows[i].cells[4].innerHTML = (vehicle.BatteryLevel * 100).toFixed(2) + "%";
                if (vehicle.BatteryLevel < 0.2) {
                    table.rows[i].style.backgroundColor = "#FF0000";
                    table.rows[i].style.color = "#FFFFFF"
                }
            }
        }

        if (current_id == uavs[vehicle.Id].Id) {
            var battery_percent = vehicle.BatteryLevel
            document.getElementById("curr_lat").innerHTML = '　LAT:　　 ' + vehicle.Latitude.toFixed(10);
            document.getElementById("curr_long").innerHTML = '　LONG:　' + vehicle.Longitude.toFixed(10);
            document.getElementById("curr_alt").innerHTML = '　ALT:　　 ' + vehicle.Altitude;
            document.getElementById("battery").innerHTML = 'Battery: ' + (vehicle.BatteryLevel * 100).toFixed(3) + "%";

            var latlng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
            if (uavs[vehicle.Id].setMapOnce == 0) {
                uavs[vehicle.Id].marker.setMap(map);
                uavs[vehicle.Id].marker.setVisible(true);
                uavs[vehicle.Id].setMapOnce = 1;
            }
            uavs[vehicle.Id] = UpdateVehicle(uavs[vehicle.Id], vehicle);
            if (uavs[vehicle.Id].CurrentEvent != null && uavs[vehicle.Id].setEventOnce == 0) {
                infoboxContainer[vehicle.Id].infobox.open(map, uavs[vehicle.Id].marker);
                infoboxContainer[vehicle.Id].infoboxAlert.open(map, uavs[vehicle.Id].marker);
                uavs[vehicle.Id].setEventOnce = 1;
            }

            if (uavs[vehicle.Id].Id != previous_id && previous_id != null) {
                if (typeof previous_id == "string") {
                    var selector = parseInt(previous_id);
                    uavs[selector].marker.setIcon(uavs[selector].marker.uavSymbolBlack);
                    uavs[selector].marker.setMap(null);
                    uavs[selector].marker.setVisible(false);
                    if (uavs[selector].CurrentEvent != null) {
                        infoboxContainer[selector].infobox.close();
                        infoboxContainer[selector].infoboxAlert.close();
                        uavs[selector].setEventOnce = 0;
                    }
                    uavs[selector].setMapOnce = 0;
                }
                else {
                    uavs[previous_id].marker.setIcon(uavs[previous_id].marker.uavSymbolBlack);
                    uavs[previous_id].marker.setMap(null);
                    uavs[previous_id].marker.setVisible(false);
                    if (uavs[previous_id].CurrentEvent != null) {
                        infoboxContainer[previous_id].infobox.close();
                        infoboxContainer[previous_id].infoboxAlert.close();
                        uavs[previous_id].setEventOnce = 0;
                    }
                    uavs[previous_id].setMapOnce = 0;
                }
            }
            map.setCenter(latlng);
        }
    }


    vehicleHub.connection.start();

    $.ajax({
        url: '/api/uavs/getuavinfo',
        success: function (data, textStatus, req) {
            uavMarkers(data, textStatus, req);
        }
    });

    if (table != null) {
        for (var i = 1; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].onclick = function () {
                    var uavid = this.cells[0];
                    previous_id = current_id;
                    current_id = this.cells[0].innerHTML;
                    var callsign = this.cells[1];
                    var numDelivery = this.cells[2];
                    var mile = this.cells[3];
                    var battery = this.cells[4];
                    var ETA = this.cells[5];
                    var STA = this.cells[6];
                    var route = this.cells[7];
                    var availability = this.cells[8];
                    var confiugration = this.cells[9];
                    var current_lat = this.cells[10];
                    var current_long = this.cells[11];
                    var current_alt = this.cells[12];
                    var dest_lat = this.cells[13];
                    var dest_long = this.cells[14];
                    //this.cells[15] is current delivery number
                    var payload = this.cells[16];
                    var cost = this.cells[17];
                    var operator_name = this.cells[18];
                    var uav_lat_long = new google.maps.LatLng(this.cells[10].innerHTML, this.cells[11].innerHTML);
                    var total_num = numDelivery.innerHTML;
                    var final_total = total_num - 1;
                    var bat = battery.innerHTML;
                    var final_battery = bat * 100;
                    var low_battery = "LOW BATTERY!";

                    document.getElementById("detail_title").innerHTML = 'UAV #' + uavid.innerHTML + '(' + callsign.innerHTML + ') Detail     (control by ' + operator_name.innerHTML + ")";
                    document.getElementById("numdeliveries").innerHTML = 'Current Delivery: ' + numDelivery.innerHTML;
                    document.getElementById("total_deliveries").innerHTML = 'Total Delivery: ' + final_total;
                    document.getElementById("mileage").innerHTML = 'Total Miles: ' + mile.innerHTML + ' miles';
                    document.getElementById("battery").innerHTML = 'Battery: ' + final_battery + "%";
                    document.getElementById("ETA").innerHTML = 'ETA: ' + ETA.innerHTML;
                    document.getElementById("STA").innerHTML = 'STA: ' + STA.innerHTML;
                    document.getElementById("route").innerHTML = 'Route: ' + route.innerHTML;
                    document.getElementById("avail").innerHTML = 'Availability: ' + availability.innerHTML;
                    document.getElementById("conf").innerHTML = 'Configuration: ' + confiugration.innerHTML;
                    document.getElementById("curr_lat").innerHTML = '　LAT:　　 ' + current_lat.innerHTML;
                    document.getElementById("curr_long").innerHTML = '　LONG:　' + current_long.innerHTML;
                    document.getElementById("curr_alt").innerHTML = '　ALT:　　 ' + current_alt.innerHTML;
                    document.getElementById("dest_lat").innerHTML = '　LAT:　　 ' + dest_lat.innerHTML;
                    document.getElementById("dest_long").innerHTML = '　LONG:　' + dest_long.innerHTML;
                    document.getElementById("payload").innerHTML = 'Package Contents: ' + payload.innerHTML;
                    document.getElementById("cost").innerHTML = 'Total Cost of Package: $' + cost.innerHTML;

                    if (current_id == evt_id) {
                        //alert("current id: " + current_id + ",   evt.uav_id: " + evt_id);

                        document.getElementById('eventlog_td1').innerHTML = evt_id;
                        document.getElementById('eventlog_td2').innerHTML = evt_operator;
                        document.getElementById('eventlog_td3').innerHTML = evt_date;
                        document.getElementById('eventlog_td4').innerHTML = evt_msg;
                        document.getElementById('eventlog_td5').innerHTML = evt_level;
                    }

                    else if (current_id != evt_id) {
                        //alert("current id: " + current_id + ",   evt.uav_id: " + evt_id);
                        document.getElementById('eventlog_td1').innerHTML = "NO";
                        document.getElementById('eventlog_td2').innerHTML = "EVENT";
                        document.getElementById('eventlog_td3').innerHTML = "FOR";
                        document.getElementById('eventlog_td4').innerHTML = "UAV";
                        document.getElementById('eventlog_td5').innerHTML = callsign.innerHTML;
                    }
                };
            }
        }
    }

    else {
        alert("There is no generated UAVs, or UAVs do not have missions. Go to the Admin View page to fix this issue.");
    }
    google.maps.event.addListener(map, 'dblclick', function (e) {
        console.log("double clicked");
        for (var key in uavs) {
            uavs[key].marker.setIcon(uavs[key].marker.uavSymbolBlack);
        }
    });

    //Communication via local storage changes
    if (window.addEventListener) {
        window.addEventListener("storage", handler, false);
    }
    function handler(e) {
        console.log('Successfully communicate with other tab');
        console.log('Received data: ' + localStorage.getItem('uavid'));
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// end of init function
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var infoboxContainer = {};

function containBox(iBox, iABox) {
    var infoboxContainer = {};
    infoboxContainer.infobox = iBox;
    infoboxContainer.infoboxAlert = iABox;
    return infoboxContainer;
}

var uavSymbolBlack;
var uavSymbolGreen;

var flightPathOptions = {
    geodesic: true,
    strokeColor: 'blue',
    strokeOpacity: 1.0,
    strokeWeight: 2
};

function SetUAV(uavData) {
    var uav = {};
    uav.Id = uavData.Id;
    uav.FlightState = uavData.FlightState;
    uav.Schedule = uavData.Schedule;
    uav.Missions = uavData.Schedule.Missions;
    var fs = uav.FlightState;
    uav.Alt = uavData.FlightState.Altitude;
    uav.Callsign = uavData.Callsign;
    uav.Battery = uavData.FlightState.BatteryLevel;
    uav.Position = new google.maps.LatLng(fs.Latitude, fs.Longitude);
    uav.Mission = uavData.Mission;
    uav.Orientation = uavData.FlightState.Yaw;
    var mis = uav.Mission;
    uav.Destination = new google.maps.LatLng(mis.Latitude, mis.Longitude);
    uav.CurrentEvent = null;
    uav.setMapOnce = 0;
    uav.setEventOnce = 0;
    return uav;
};

function SetUAVMarker(uav) {
    var marker_uav = new MarkerWithLabel({
        position: uav.Position,
        icon: uavSymbolBlack,
        labelContent: uav.Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uav.Alt + '<br/><b>Bat: </b>' + uav.Battery + '</div>',
        labelAnchor: new google.maps.Point(95, 20),
        labelClass: "labels",
        labelStyle: { opacity: 0.75 },
        zIndex: 999999,
        uav: uav,
        uavSymbolBlack: {
            path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
            fillColor: 'black',
            fillOpacity: 1.0,
            scale: 0.2,
            zIndex: 1,
            anchor: new google.maps.Point(355, 295)
        },
        uavSymbolGreen: {
            path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
            fillColor: 'green',
            fillOpacity: 0.8,
            scale: 0.2,
            zIndex: 1,
            anchor: new google.maps.Point(355, 295)
        }
    });
    return marker_uav;
};

var uavs = {};
var map;
var flightLines = [];

function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);

    for (var i = 0; i < data.length; i++) {
        uavs[data[i].Id] = SetUAV(data[i]);

        flightLines[data[i].Id] = new google.maps.Polyline(flightPathOptions);
        flightLines[data[i].Id].setPath([uavs[data[i].Id].Position, uavs[data[i].Id].Destination]);

        marker = SetUAVMarker(uavs[data[i].Id]);

        //When fired, the UAV is marked as 'selected'
        google.maps.event.addListener(marker, 'click', (function () {
            droneSelection.CtrlSelect(this, selectedDrones);
            if (selectedDrones.length == 0) { }
            else {
                var uav = selectedDrones[0];
                localStorage.setItem('uavid', uav.Id);
            }
        }));

        uavs[data[i].Id].marker = marker;
        marker.set('selected', false);
        uavs[data[i].Id].flightPath = flightLines[data[i].Id];
        uavs[data[i].Id].marker.setMap(map);

    }
}
