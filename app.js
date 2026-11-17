/* Guiy0-TV v0.1 · No incluye transmisiones de terceros ni elude protecciones. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const video = $("player");
  const placeholder = $("placeholder");
  const playStatus = $("play-status");
  const DEMO_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  let hls = null;
  const webos = /webOS|Web0S|NetCast/i.test(navigator.userAgent);

  function status(message, isError) {
    playStatus.textContent = message;
    playStatus.classList.toggle("error", Boolean(isError));
  }
  function stopPlayer() {
    video.pause();
    if (hls) { hls.destroy(); hls = null; }
    video.removeAttribute("src");
    video.load();
    video.style.display = "none";
    placeholder.style.display = "flex";
    status("Reproductor detenido.");
  }
  function playVideo() {
    const promise = video.play();
    if (promise && promise.catch) {
      promise.catch(() => status("Fuente cargada. Tocá ▶ en el video para comenzar."));
    }
  }
  function openStream(raw) {
    let url;
    try {
      url = new URL(raw.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw Error("Protocolo no permitido");
      if (location.protocol === "https:" && url.protocol === "http:") {
        status("Esta página HTTPS no puede abrir un stream HTTP: contenido mixto bloqueado por el navegador.", true);
        return;
      }
    } catch (_) {
      status("Ingresá una URL completa que empiece por https:// o http://.", true);
      return;
    }
    stopPlayer();
    placeholder.style.display = "none";
    video.style.display = "block";
    status("Preparando el reproductor…");
    const mp4 = /\.mp4(?:$|[?#])/i.test(url.href);
    const nativeHls = Boolean(video.canPlayType("application/vnd.apple.mpegurl") ||
                              video.canPlayType("application/x-mpegURL"));
    // Para LG conviene probar primero HLS nativo.
    if (mp4 || (webos && nativeHls)) {
      video.src = url.href;
      playVideo();
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => playVideo());
      hls.on(window.Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) status("No se pudo reproducir. Revisá si la URL es una lista HLS válida y permite solicitudes CORS. Motivo: " + data.details, true);
      });
      hls.loadSource(url.href);
      hls.attachMedia(video);
    } else if (nativeHls) {
      video.src = url.href;
      playVideo();
    } else {
      video.style.display = "none";
      placeholder.style.display = "flex";
      status("El navegador no admite HLS nativo y no cargó hls.js. Verificá la conexión a internet.", true);
    }
  }
  video.addEventListener("playing", () => status("Reproduciendo. Si usás la demo, esto confirma el reproductor, NO el acceso a XtremeTV."));
  video.addEventListener("waiting", () => status("Esperando datos del video…"));
  video.addEventListener("error", () => {
    if (video.error) status("Error de reproducción (" + video.error.code + "). El formato, la red o el acceso podrían no ser compatibles.", true);
  });
  $("demo").addEventListener("click", () => openStream(DEMO_HLS));
  $("stop").addEventListener("click", stopPlayer);
  $("source-form").addEventListener("submit", (event) => {
    event.preventDefault();
    openStream($("source-url").value);
  });

  async function probe(endpoint, output) {
    // No añadimos encabezados falsos, cookies, tokens ni parámetros de la app original.
    if (location.protocol === "https:" && endpoint.protocol === "http:") {
      output.textContent = "No se puede probar desde HTTPS: HTTP es contenido mixto.";
      return;
    }
    output.textContent = "Consultando (solo HEAD)…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(endpoint.href, {
        method: "HEAD", mode: "cors", redirect: "follow",
        cache: "no-store", signal: controller.signal
      });
      output.textContent = "HTTP " + response.status + " · La respuesta no demuestra acceso a canales.";
    } catch (error) {
      output.textContent = error.name === "AbortError"
        ? "Tiempo agotado. No concluyente."
        : "El navegador no puede leer la respuesta (red, DNS, CORS u otra restricción). No concluyente.";
    } finally { clearTimeout(timeout); }
  }
  document.querySelectorAll(".probe").forEach((button) => {
    button.addEventListener("click", () => {
      const endpoint = new URL(button.dataset.url);
      probe(endpoint, $(button.dataset.target));
    });
  });
  // Navegación básica con flechas de TV, además de Tab/Enter.
  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === "Escape" || event.key === "Backspace") {
      if (video.style.display === "block") { event.preventDefault(); stopPlayer(); }
      return;
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const focusables = Array.from(document.querySelectorAll('button:not([disabled]),input,a[href]'));
    const from = document.activeElement;
    if (!focusables.includes(from)) return;
    const r = from.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const right = event.key === "ArrowRight", left = event.key === "ArrowLeft";
    const down = event.key === "ArrowDown", up = event.key === "ArrowUp";
    const candidates = focusables.filter(el => el !== from).map(el => {
      const b = el.getBoundingClientRect(), dx = b.left + b.width / 2 - x, dy = b.top + b.height / 2 - y;
      const forward = (right && dx > 10) || (left && dx < -10) || (down && dy > 10) || (up && dy < -10);
      const primary = right || left ? Math.abs(dx) : Math.abs(dy);
      const secondary = right || left ? Math.abs(dy) : Math.abs(dx);
      return { el, score: primary + secondary * 1.8, forward };
    }).filter(v => v.forward).sort((a,b) => a.score - b.score);
    if (candidates.length) { event.preventDefault(); candidates[0].el.focus(); }
  });
})();
