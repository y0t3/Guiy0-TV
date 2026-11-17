/* Guiy0-TV v0.4 · catálogo, favoritos y reproducción. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const PRESETS = [
    {id:"unlp",name:"UNLP TV",category:"Universitarios",icon:"🎓",live:true,
     note:"Canal universitario público de La Plata. Enlace externo pendiente de validación en tu equipo.",
     url:"https://stratus.stream.cespi.unlp.edu.ar/hls/tvunlp.m3u8",owner:"UNLP · enlace de prueba"},
    {id:"mux",name:"Cine de prueba",category:"Pruebas",icon:"🎞️",live:false,
     note:"Big Buck Bunny, video HLS público de Mux. Comprobado previamente en BlueStacks.",
     url:"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",owner:"Mux · HLS demo"},
    {id:"tears",name:"Cortometraje HD",category:"Pruebas",icon:"🎬",live:false,
     note:"Tears of Steel, contenido audiovisual de demostración.",
     url:"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",owner:"Unified Streaming · demo"},
    {id:"apple",name:"Calidad adaptable",category:"Pruebas",icon:"📡",live:false,
     note:"BipBop, ejemplo oficial de Apple para validar HLS y cambio automático de calidad.",
     url:"https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",owner:"Apple · HLS demo"}
  ];
  const PREFIX="guiy0tv.v04.";
  function read(key,fallback) { try {let v=JSON.parse(localStorage.getItem(PREFIX+key));return v??fallback;}catch(_){return fallback;} }
  function save(key,value) {try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}catch(_){return false;}}
  const favorites = new Set((read("favorites",[])||[]).filter(x=>typeof x==="string"));
  let custom = (read("custom",[])||[]).filter(x=>x && typeof x.url==="string" && typeof x.name==="string").slice(0,150);
  let all = [...PRESETS, ...custom];
  let activeId=null, view="channels", category="Todos", search="", hls=null;
  const video=$("player"), grid=$("channel-grid"), statusEl=$("play-status"), placeholder=$("placeholder");
  const isWebOS=/webOS|Web0S|NetCast/i.test(navigator.userAgent);

  function setStatus(msg,bad=false){statusEl.textContent=msg;statusEl.classList.toggle("error",bad);}
  function visibleChannels(){
    return all.filter(c=>(view!=="favorites" || favorites.has(c.id)) &&
      (category==="Todos" || c.category===category) &&
      ((c.name+" "+c.category).toLocaleLowerCase("es").includes(search)));
  }
  function selected(){return all.find(c=>c.id===activeId)||null;}
  function renderCategories(){
    const group=$("category-filters");group.replaceChildren();
    const cats=["Todos",...new Set(all.map(c=>c.category))];
    if(!cats.includes(category))category="Todos";
    cats.forEach(value=>{
      const b=document.createElement("button");
      b.className="chip"+(category===value?" selected":"");b.type="button";b.textContent=value;
      b.setAttribute("aria-pressed",String(category===value));
      b.addEventListener("click",()=>{category=value;render();});
      group.appendChild(b);
    });
  }
  function card(c,order){
    const root=document.createElement("article");root.className="channel-card"+(activeId===c.id?" playing":"");
    const btn=document.createElement("button");btn.type="button";btn.className="channel-select";
    btn.setAttribute("aria-label","Reproducir "+c.name);
    const art=document.createElement("span");art.className="channel-art";art.textContent=c.icon||"📺";
    const nr=document.createElement("span");nr.className="channel-number";nr.textContent=String(order+1).padStart(2,"0");
    const live=document.createElement("span");live.className="channel-kind"+(c.live?" live":"");live.textContent=c.live?"EN VIVO":"VIDEO";
    const title=document.createElement("strong");title.textContent=c.name;
    const mini=document.createElement("small");mini.textContent=c.category;
    btn.append(nr,art,live,title,mini);
    btn.addEventListener("click",()=>openChannel(c.id));
    const fav=document.createElement("button");fav.type="button";fav.className="fav-btn";
    fav.textContent=favorites.has(c.id)?"★":"☆";
    fav.title=favorites.has(c.id)?"Quitar de favoritos":"Agregar a favoritos";
    fav.setAttribute("aria-label",fav.title);
    fav.setAttribute("aria-pressed",String(favorites.has(c.id)));
    fav.addEventListener("click",()=>toggleFav(c.id));
    root.append(btn,fav);
    return root;
  }
  function render(){
    all=[...PRESETS,...custom];
    renderCategories();
    const visible=visibleChannels();
    grid.replaceChildren();
    visible.forEach((c,i)=>grid.appendChild(card(c,i)));
    $("empty-state").hidden=visible.length>0;
    $("channel-count").textContent=all.length+" señales de prueba y propias";
    $("favorites-count").textContent=favorites.size;
    $("favorites-nav-count").textContent=favorites.size;
    document.querySelectorAll("[data-view]").forEach(b=>{
      b.classList.toggle("current",b.dataset.view===view);
      b.setAttribute("aria-current",b.dataset.view===view?"page":"false");
    });
    $("channels-section").hidden=view==="tools";
    $("tools-section").hidden=view!=="tools";
    $("page-title").textContent=view==="favorites"?"Mis favoritos":view==="tools"?"Laboratorio": "Explorar canales";
    $("page-subtitle").textContent=view==="favorites"?"Tus canales guardados en este dispositivo.":view==="tools"?"Diagnóstico de conectividad, sin acceder a transmisiones privadas.":"Canales de prueba, transmisiones públicas y tus propias fuentes.";
    const current=selected();
    $("now-name").textContent=current?current.name:"Seleccioná un canal";
    $("now-info").textContent=current?current.note:"Tocá una tarjeta para comenzar a reproducir.";
    $("now-source").textContent=current?current.owner:"Sin reproducción activa";
    $("fav-current").textContent=current&&favorites.has(current.id)?"★ Favorito":"☆ Favorito";
    $("fav-current").disabled=!current;
    $("fav-current").setAttribute("aria-pressed",String(Boolean(current&&favorites.has(current.id))));
  }
  function toggleFav(id){
    if(favorites.has(id))favorites.delete(id);else favorites.add(id);
    save("favorites",[...favorites]);render();
  }
  function stopVideo(message="Reproductor detenido."){
    video.pause();
    if(hls){hls.destroy();hls=null;}
    video.removeAttribute("src");video.load();video.hidden=true;placeholder.hidden=false;
    setStatus(message);
  }
  function attemptPlay(){
    const p=video.play();
    if(p && p.catch)p.catch(()=>setStatus("Video preparado. Presioná ▶ para iniciar."));
  }
  function openChannel(id){
    const c=all.find(x=>x.id===id);if(!c)return;
    activeId=id;stopVideo("Conectando con "+c.name+"…");
    $("player-zone").scrollIntoView({behavior:"smooth",block:"nearest"});
    const url=c.url;
    video.hidden=false;placeholder.hidden=true;
    const nativeHls=Boolean(video.canPlayType("application/vnd.apple.mpegurl")||video.canPlayType("application/x-mpegURL"));
    if(/\.mp4(?:[?#]|$)/i.test(url)||(isWebOS && nativeHls)){
      video.src=url;attemptPlay();
    }else if(window.Hls && window.Hls.isSupported()){
      hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
      hls.on(window.Hls.Events.MANIFEST_PARSED,attemptPlay);
      hls.on(window.Hls.Events.ERROR,(_e,data)=>{
        if(data.fatal)setStatus("No se pudo reproducir: "+data.details+". La fuente puede estar caída, restringida o no permitir CORS.",true);
      });
      hls.loadSource(url);hls.attachMedia(video);
    }else if(nativeHls){video.src=url;attemptPlay();}
    else {video.hidden=true;placeholder.hidden=false;setStatus("Este dispositivo no admite HLS y no cargó hls.js.",true);}
    render();
  }
  function stepChannel(delta){
    const channels=visibleChannels();
    if(!channels.length)return;
    const idx=channels.findIndex(c=>c.id===activeId);
    const next=channels[(idx<0?0:idx+delta+channels.length)%channels.length];
    openChannel(next.id);
  }
  function validUrl(raw){
    try {
      const url=new URL(raw.trim());
      if(url.protocol!=="https:" && url.protocol!=="http:")return null;
      if(url.username||url.password)return null;
      if(location.protocol==="https:" && url.protocol==="http:")return null;
      return url;
    }catch(_){return null;}
  }
  function addChannel(name,raw,cat="Mis canales"){
    name=String(name||"").trim().slice(0,65);
    const url=validUrl(raw);
    if(!name||!url)throw Error("Completá un nombre y una URL HTTP(S) válida. Desde HTTPS no se aceptan enlaces HTTP.");
    if(custom.length>=150)throw Error("Límite de 150 canales personales alcanzado.");
    const keys=[...url.searchParams.keys()].map(x=>x.toLowerCase());
    if(keys.some(x=>/token|auth|pass|key|secret|signature|expires|jwt/.test(x)))throw Error("No guardamos URLs con parámetros de autenticación. Utilizá fuentes públicas o autorizadas sin claves.");
    const c={id:"my-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000),name,url:url.href,
      icon:"📺",category:String(cat||"Mis canales").slice(0,35),live:true,
      note:"Canal agregado por vos. Solo se guarda en este dispositivo.",owner:"Lista personal"};
    custom.push(c);
    save("custom",custom);
    return c;
  }
  $("add-channel-form").addEventListener("submit",e=>{
    e.preventDefault();
    try{
      const c=addChannel($("new-name").value,$("new-url").value,$("new-category").value||"Mis canales");
      $("add-channel-form").reset();
      $("add-result").textContent="✓ Canal "+c.name+" agregado.";
      view="channels";category="Todos";search="";$("search").value="";render();
    }catch(err){$("add-result").textContent=err.message;}
  });
  $("remove-personal").addEventListener("click",()=>{
    if(!custom.length){$("add-result").textContent="No hay canales personales para borrar.";return;}
    if(!confirm("¿Eliminar todos los canales personales guardados en este dispositivo?"))return;
    custom=[];save("custom",custom);render();$("add-result").textContent="Canales personales eliminados.";
  });
  $("import-form").addEventListener("submit",e=>{
    e.preventDefault();
    const raw=$("m3u-text").value;
    const lines=raw.split(/\r?\n/);
    let found=0,skipped=0,pending="";
    for(let i=0;i<lines.length;i++){
      const line=lines[i].trim();
      if(line.startsWith("#EXTINF:")){
        pending=(line.split(",").slice(1).join(",").trim()||"Canal importado").slice(0,65);
        continue;
      }
      if(!line||line.startsWith("#"))continue;
      if(!pending){skipped++;continue;}
      try{addChannel(pending,line);found++;}catch(_){skipped++;}
      pending="";
    }
    $("import-result").textContent="Agregados: "+found+" · Omitidos: "+skipped+". Se guardan solamente aquí.";
    if(found){$("m3u-text").value="";category="Todos";view="channels";render();}
  });
  $("search").addEventListener("input",e=>{search=e.target.value.toLocaleLowerCase("es");render();});
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;category="Todos";search="";$("search").value="";render();}));
  $("fav-current").addEventListener("click",()=>{if(activeId)toggleFav(activeId);});
  $("prev").addEventListener("click",()=>stepChannel(-1));
  $("next").addEventListener("click",()=>stepChannel(1));
  $("stop").addEventListener("click",()=>stopVideo());
  $("fullscreen").addEventListener("click",()=>{
    const host=$("player-zone");
    if(host.requestFullscreen)host.requestFullscreen().catch(()=>setStatus("Pantalla completa no disponible en este dispositivo."));
    else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
    else setStatus("Usá el botón de pantalla completa del reproductor.");
  });
  video.addEventListener("playing",()=>setStatus("Reproduciendo "+(selected()?.name||"video")+"."));
  video.addEventListener("waiting",()=>setStatus("Cargando video…"));
  video.addEventListener("error",()=>{if(video.error)setStatus("Error de video ("+video.error.code+"): formato, red o restricciones de la fuente.",true);});

  async function webProbe(endpoint,output){
    if(location.protocol==="https:"&&endpoint.protocol==="http:"){
      output.textContent="No se puede probar HTTP desde la web HTTPS (contenido mixto).";return;
    }
    output.textContent="Consultando HTTP HEAD…";
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    try{
      const r=await fetch(endpoint.href,{method:"HEAD",mode:"cors",redirect:"follow",cache:"no-store",signal:controller.signal});
      output.textContent="HTTP "+r.status+" · No demuestra acceso a canales.";
    }catch(err){output.textContent=err.name==="AbortError"?"Tiempo agotado; no concluyente.":"Navegador no pudo leer la respuesta (red/CORS/DNS); no concluyente.";}
    finally{clearTimeout(timeout);}
  }
  const targets={xtreme:"check-1",m3u:"check-2"};
  window.guiy0NativeResult=(key,msg)=>{
    if(!Object.prototype.hasOwnProperty.call(targets,key))return;
    $(targets[key]).textContent="Android nativo: "+String(msg);
  };
  document.querySelectorAll(".probe").forEach(b=>b.addEventListener("click",()=>{
    const key=b.dataset.target==="check-1"?"xtreme":b.dataset.target==="check-2"?"m3u":"";
    const output=$(b.dataset.target);
    if(key&&window.Guiy0Android&&typeof window.Guiy0Android.probe==="function"){
      output.textContent="Android: consultando…";
      try{window.Guiy0Android.probe(key);}catch(_){output.textContent="No pudo iniciarse el diagnóstico.";}
    }else webProbe(new URL(b.dataset.url),output);
  }));

  // Navegación direccional para controles remotos y teclado.
  document.addEventListener("keydown",e=>{
    const input=e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA";
    if(input)return;
    if(e.key==="Escape"||e.key==="Backspace"){
      if(!video.hidden){e.preventDefault();stopVideo();}
      return;
    }
    if((e.key==="PageDown"||e.key==="ChannelDown")){e.preventDefault();stepChannel(1);return;}
    if((e.key==="PageUp"||e.key==="ChannelUp")){e.preventDefault();stepChannel(-1);return;}
    if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))return;
    const focusables=[...document.querySelectorAll("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]")].filter(el=>el.getClientRects().length>0);
    const curr=document.activeElement;
    if(!focusables.includes(curr))return;
    const b=curr.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
    const options=focusables.filter(x=>x!==curr).map(el=>{
      const r=el.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;
      const valid=(e.key==="ArrowRight"&&dx>8)||(e.key==="ArrowLeft"&&dx< -8)||
        (e.key==="ArrowDown"&&dy>8)||(e.key==="ArrowUp"&&dy< -8);
      const score=["ArrowLeft","ArrowRight"].includes(e.key)?Math.abs(dx)+1.9*Math.abs(dy):Math.abs(dy)+1.9*Math.abs(dx);
      return {el,valid,score};
    }).filter(x=>x.valid).sort((a,b)=>a.score-b.score);
    if(options.length){e.preventDefault();options[0].el.focus();}
  });
  // v0.3 Android Back utiliza el mismo identificador de control de parada.
  render();
  setStatus("Elegí un canal del catálogo. Los enlaces externos pueden estar temporalmente inaccesibles.");
})();
