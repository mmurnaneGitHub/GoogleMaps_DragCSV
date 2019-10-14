var map,imageIcon,bounds,infowindow,dropZone;function init(){startLatLng=new google.maps.LatLng(47.255848,-122.441754);map=new google.maps.Map(document.getElementById("map"),{center:startLatLng,zoom:18});imageIcon="images/marker-icon.png";bounds=new google.maps.LatLngBounds;infowindow=new google.maps.InfoWindow;dropZone=document.getElementById("map");dropZone.addEventListener("dragover",handleDragOver,!1);dropZone.addEventListener("drop",handleFileSelect,!1)}
function handleFileSelect(a){a.stopPropagation();a.preventDefault();a=a.dataTransfer.files;var c=new FileReader,d=0;c.onload=function(b){b=$.csv.toObjects(b.target.result);if(b[0].hasOwnProperty("Latitude")&&b[0].hasOwnProperty("Longitude"))var a="LatLong";else if(b[0].hasOwnProperty("Address"))a="Address";else{alert("Sorry, no valid fields (Address or Latitude AND Longitude) in table.");return}for(i=0;i<b.length;i++)if("Address"==a){url1="https://gis.cityoftacoma.org/arcgis/rest/services/Locators/TacomaAddresses/GeocodeServer/findAddressCandidates?Address=";
url2=String(b[i].Address);url3="&outFields=&outSR=4326&f=pjson";url=url1.concat(url2,url3);var e=new XMLHttpRequest;e.open("GET",url,!1);e.send(null);e=JSON.parse(e.responseText);if("undefined"==typeof e.candidates[0])alert("Error in address: "+url2);else{var c=formatContent(b[i]);addMarker(e.candidates[0].location.y,e.candidates[0].location.x,String(b[i].Address),c);d++}}else"LatLong"==a&&(""==b[i].Latitude?alert("Sorry, Latitude value missing for record ... "+(i+1)):""==b[i].Longitude?alert("Sorry, Longitude value missing for record ... "+
(i+1)):(c=formatContent(b[i]),addMarker(Number(b[i].Latitude),Number(b[i].Longitude),String(i),c),d++));0<d&&map.fitBounds(bounds)};c.readAsText(a[0],"UTF-8")}function formatContent(a){var c="",d;for(d in a)c+="<b>"+d+": </b>"+a[d]+"<br>";return c}
function addMarker(a,c,d,b){d=new google.maps.Marker({position:{lat:a,lng:c},map:map,icon:imageIcon,title:d});bounds.extend({lat:a,lng:c});google.maps.event.addListener(d,"click",function(a,b,c){return function(){c.setContent(b);c.open(map,a)}}(d,b,infowindow))}function handleDragOver(a){a.stopPropagation();a.preventDefault();a.dataTransfer.dropEffect="copy"};