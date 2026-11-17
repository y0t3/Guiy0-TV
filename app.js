/* Guiy0-TV 0.6 · encender, elegir canal, reproducir. */
(function(){
"use strict";
var CHANNELS=[
  {name:"Canal 26",kind:"NOTICIAS",icon:"📰",url:"https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8"},
  {name:"Telemax",kind:"GENERAL",icon:"📡",url:"https://stream-gtlc.telecentro.net.ar/hls/telemaxhls/main.m3u8"},
  {name:"NET TV",kind:"GENERAL",icon:"📺",url:"https://unlimited1-us.dps.live/nettv/nettv.smil/playlist.m3u8"},
  {name:"Argentinisima Satelital",kind:"GENERAL",icon:"🇦🇷",url:"https://stream1.sersat.com/hls/argentinisima.m3u8"},
  {name:"Caras TV",kind:"ENTRETENIMIENTO",icon:"🎭",url:"https://unlimited1-us.dps.live/carastv/carastv.smil/playlist.m3u8"},
  {name:"Canal Provincial",kind:"GENERAL",icon:"🏙️",url:"https://streaming.telered.com.ar/provincial/streaming/mystream.m3u8"},
  {name:"Canal Universidad",kind:"CULTURA",icon:"🎓",url:"https://videostream.shockmedia.com.ar/hls/canaluniversidadmdp/canaluniversidadmdp.m3u8"},
  {name:"RTN",kind:"REGIONAL",icon:"🏔️",url:"https://media.neuquen.gov.ar/rtn/television/media.m3u8"},
  {name:"Canal 7 Jujuy",kind:"REGIONAL",icon:"⛰️",url:"https://stream.arcast.live/canal7jujuy/ngrp:canal7jujuy_all/playlist.m3u8"},
  {name:"Canal 3 La Pampa",kind:"REGIONAL",icon:"🌾",url:"https://stream.arcast.com.ar/c3lapampa/ngrp:c3lapampa_all/playlist.m3u8"},
  {name:"Canal 3 Arroyito",kind:"REGIONAL",icon:"📺",url:"https://envivo.cespalarroyito.coop/live/Canal3Arroyito.m3u8"},
  {name:"Canal 4 Esquel",kind:"REGIONAL",icon:"🏔️",url:"https://stream.arcast.com.ar/canal4esquel/canal4esquel/playlist.m3u8"},
  {name:"Catamarca TV",kind:"REGIONAL",icon:"🌄",url:"https://stream.arcast.com.ar/canal7catamarca/ngrp:canal7catamarca_all/playlist.m3u8?DVR="},
  {name:"Mercurio Noticias",kind:"NOTICIAS",icon:"🗞️",url:"https://videostream.shockmedia.com.ar/hls/mercuriotv/mercuriotv.m3u8"},
  {name:"Multivision Federal",kind:"NOTICIAS",icon:"📰",url:"https://videostream.shockmedia.com.ar/hls/multivisionfederal/multivisionfederal.m3u8"},
  {name:"Litus TV",kind:"CULTURA",icon:"📚",url:"https://edge.enhdtv.com/litustv/index.m3u8"},
  {name:"Garage TV Latin America",kind:"MOTORES",icon:"🚗",url:"https://stream1.sersat.com/hls/garagetv.m3u8"},
  {name:"Cumbia Mix",kind:"MÚSICA",icon:"🎵",url:"https://cloud.tvomix.com/CUMBIAMIX/index.m3u8"},
  {name:"Chamame TV",kind:"MÚSICA",icon:"🪗",url:"https://srv4.zcast.com.br/chamametv/chamametv/playlist.m3u8"},
  {name:"Canal 2 NexTV Rafaela",kind:"REGIONAL",icon:"🎥",url:"https://edge.enhdtv.com/nexthd/index.m3u8"},
  {name:"Canal 20 Villa Maria",kind:"REGIONAL",icon:"📡",url:"https://stmvideo3.livecastv.com/canal20/canal20/playlist.m3u8"},
  {name:"Canal 5 Santa Fe",kind:"REGIONAL",icon:"📺",url:"https://stream.arcast.com.ar/c5sf/c5sf/playlist.m3u8"},
  {name:"Canal 3 Formosa",kind:"REGIONAL",icon:"📡",url:"https://stmvideo6.livecastv.com/agenfor/agenfor/playlist.m3u8"},
  {name:"Canal 7 Neuquen",kind:"REGIONAL",icon:"🏔️",url:"https://stream.arcast.com.ar/c7nq/ngrp:c7nq_all/playlist.m3u8"},
  {name:"Video de prueba",kind:"DEMOSTRACIÓN",icon:"🎬",url:"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"}
];
var byId=function(id){return document.getElementById(id);};
var video=byId("player"),empty=byId("empty"),status=byId("play-status");
var hls=null,active=-1;
var webOS=/webOS|Web0S|NetCast/i.test(navigator.userAgent);
function say(msg,isError){status.textContent=msg;status.classList.toggle("error",Boolean(isError));}
function render(){
 var root=byId("channels");root.replaceChildren();
 CHANNELS.forEach(function(c,i){
   var b=document.createElement("button");b.type="button";
   b.className="channel"+(i===active?" active":"");
   b.setAttribute("aria-label","Ver "+c.name);
   var icon=document.createElement("span");icon.className="channel-icon";icon.textContent=c.icon;
   var label=document.createElement("strong");label.textContent=c.name;
   var kind=document.createElement("small");kind.textContent=c.kind;
   b.append(icon,label,kind);
   b.addEventListener("click",function(){play(i);});
   root.appendChild(b);
 });
}
function stopWeb(){
  video.pause();if(hls){hls.destroy();hls=null;}
  video.removeAttribute("src");video.load();video.hidden=true;empty.hidden=false;
}
function play(idx){
  if(idx<0||idx>=CHANNELS.length)return;
  active=idx;var c=CHANNELS[idx];byId("now").textContent=c.name;render();
  say("Abriendo "+c.name+"…");
  if(window.Guiy0Player&&typeof window.Guiy0Player.play==="function"){
    stopWeb();
    try{window.Guiy0Player.play(idx);}catch(_){say("Android no pudo abrir el reproductor.",true);}
    return;
  }
  stopWeb();
  video.hidden=false;empty.hidden=true;
  var nativeHls=Boolean(video.canPlayType("application/vnd.apple.mpegurl")||video.canPlayType("application/x-mpegURL"));
  function start(){var p=video.play();if(p&&p.catch)p.catch(function(){say("Tocá ▶ para comenzar la reproducción.");});}
  if(webOS&&nativeHls){video.src=c.url;start();}
  else if(window.Hls&&window.Hls.isSupported()){
    hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
    hls.on(window.Hls.Events.MANIFEST_PARSED,start);
    hls.on(window.Hls.Events.ERROR,function(ev,data){
      if(data.fatal)say("No se pudo abrir esta señal. Probá con otro canal.",true);
    });
    hls.loadSource(c.url);hls.attachMedia(video);
  }else if(nativeHls){video.src=c.url;start();}
  else{stopWeb();say("Este equipo no admite este tipo de video.",true);}
}
function step(d){play((Math.max(active,0)+d+CHANNELS.length)%CHANNELS.length);}
byId("prev").addEventListener("click",function(){step(-1);});
byId("next").addEventListener("click",function(){step(1);});
byId("fullscreen").addEventListener("click",function(){
 if(window.Guiy0Player&&active>=0){window.Guiy0Player.play(active);return;}
 var el=byId("viewer");
 if(el.requestFullscreen)el.requestFullscreen().catch(function(){say("No se pudo abrir pantalla completa.");});
 else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
 else say("Usá pantalla completa desde el reproductor.");
});
video.addEventListener("playing",function(){say("Reproduciendo "+CHANNELS[active].name);});
video.addEventListener("error",function(){if(video.error)say("Este canal no está disponible en este momento.",true);});
video.addEventListener("waiting",function(){say("Cargando video…");});
document.addEventListener("keydown",function(e){
  if(e.key==="PageUp"||e.key==="ChannelUp"){e.preventDefault();step(-1);return;}
  if(e.key==="PageDown"||e.key==="ChannelDown"){e.preventDefault();step(1);return;}
  if((e.key==="Backspace"||e.key==="Escape")&&!video.hidden){e.preventDefault();stopWeb();say("Reproducción detenida.");return;}
  if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))return;
  var buttons=[...document.querySelectorAll("button")].filter(function(b){return b.getClientRects().length>0;});
  var current=document.activeElement;
  if(buttons.indexOf(current)<0)return;
  var r=current.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  var candidates=buttons.filter(function(b){return b!==current;}).map(function(b){
    var a=b.getBoundingClientRect(),dx=a.left+a.width/2-x,dy=a.top+a.height/2-y;
    var direction=e.key==="ArrowRight"?dx>8:e.key==="ArrowLeft"?dx< -8:e.key==="ArrowDown"?dy>8:dy< -8;
    var score=(e.key==="ArrowRight"||e.key==="ArrowLeft")?Math.abs(dx)+2*Math.abs(dy):Math.abs(dy)+2*Math.abs(dx);
    return {b:b,direction:direction,score:score};
  }).filter(function(q){return q.direction;}).sort(function(a,b){return a.score-b.score;});
  if(candidates.length){e.preventDefault();candidates[0].b.focus();}
});
render();
})();