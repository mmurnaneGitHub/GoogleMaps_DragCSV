var map, imageIcon, bounds,infowindow, dropZone;

function init(){
//Map setup
  startLatLng = new google.maps.LatLng(47.255848, -122.441754);

  map = new google.maps.Map(document.getElementById('map'), {
    center: startLatLng,
    zoom: 18
  });

  imageIcon = 'images/marker-icon.png'; //Marker image
  bounds = new google.maps.LatLngBounds(); //For updating map extent to marker extent
  infowindow = new google.maps.InfoWindow(); //create one infowindow & send content/location each time opened

  // Setup the dnd listeners.
  dropZone = document.getElementById('map');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.
  var reader = new FileReader();
  var markerCount = 0;

  reader.onload = function(event) {
    var data = $.csv.toObjects(event.target.result); //jQuery-CSV   - https://github.com/evanplaice/jquery-csv/
    
    if (data[0].hasOwnProperty("Latitude") && data[0].hasOwnProperty("Longitude")){
      var tableType = "LatLong"
    } else if (data[0].hasOwnProperty("Address")) {
      var tableType = "Address"
    } else {
      alert("Sorry, no valid fields (Address or Latitude AND Longitude) in table."); 
      return; //need to exit here
    }
    
    for (i = 0; i < data.length; i++) {
      if (tableType == "Address") {
        url1 = "https://gis.cityoftacoma.org/arcgis/rest/services/PDS/DART_Locater_AddressPoint_Gazetteer/GeocodeServer/findAddressCandidates?Address=";
        url2 = String(data[i].Address);
        url3 = "&outFields=&outSR=4326&f=pjson";
        url = url1.concat(url2, url3);
        var xhReq = new XMLHttpRequest();
        xhReq.open("GET", url, false);
        xhReq.send(null);
        var serverResponse = xhReq.responseText;
        var d = JSON.parse(serverResponse);
  
        if (typeof d.candidates[0] == 'undefined') {
          alert("Error in address: " + url2);
        } else {
          var contentString = formatContent(data[i])
          addMarker(d.candidates[0].location.y, d.candidates[0].location.x, String(data[i].Address), contentString);  //Add marker to map -  top/first(0) geocoded candidate
          markerCount++;  //increment counter
        }
      } else if (tableType == "LatLong") {
          if (data[i].Latitude == '') {
            alert("Sorry, Latitude value missing for record ... " + (i+1));
          } else if (data[i].Longitude == '') {
            alert("Sorry, Longitude value missing for record ... " + (i+1));
          } else {
            var contentString = formatContent(data[i])
            addMarker(Number(data[i].Latitude), Number(data[i].Longitude), String(i), contentString );  //Add marker to map with lat/long values -  use record number for title
            markerCount++;  //increment counter
          }
      }

    }

    //Adjust map extent to all markers
    if (markerCount>0){map.fitBounds(bounds)}

  }

  reader.readAsText(files[0], "UTF-8");
}

function formatContent(obj){
  var contentString = '';
  //var obj = data[i];
  for (var prop in obj) {
    contentString += '<b>' + prop + ': </b>' + obj[prop] + '<br>';
  }
  return contentString;
}

function addMarker(lat, lng, title, content){
  //Add marker to map -  top/first(0) candidate
  var marker = new google.maps.Marker({
    position: {
      lat: lat,
      lng: lng
    },
    map: map,
    icon: imageIcon,
    title: title
  });

  //Extend map extent
  bounds.extend({
    lat: lat,
    lng: lng
  });

  //Add click event
  google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
    return function() {
      infowindow.setContent(content);
      infowindow.open(map, marker);
    };
  })(marker, content, infowindow));
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
