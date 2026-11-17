# Guiy0-TV 📺

Prototipo inicial de una aplicación para **LG webOS** y navegador de PC, inspirada en la estética retro Miami de Guiy0.

## Qué incluye esta primera versión

- Reproductor HTML5 con **HLS** (nativo donde esté disponible; hls.js en navegadores compatibles).
- Video HLS **público de demostración** para validar la reproducción.
- Campo para introducir una URL **completa y autorizada** de streaming (HLS o MP4). No se guarda en el repositorio.
- Panel de diagnóstico HTTP `HEAD` para **dos rutas base extraídas de la APK** XtremeTV (sin credenciales, tokens, cookies personalizadas ni trucos de acceso).
- Navegación de teclado con flechas, Tab y Enter; base para el control remoto de LG.
- Archivo `appinfo.json` como punto de partida para empaquetar la aplicación de webOS.

## Qué NO verifica

Las rutas `https://ch.xtremetv.top/live/` y `http://tv.m3uts.xyz/stream/gen/` **no son URLs completas de canales**. El diagnóstico comprueba solamente si el navegador puede leer una respuesta HTTP. No demuestra autorización, catálogo disponible ni que se puedan reproducir canales.

Los errores por **CORS, DNS, servidor, HTTP o contenido mixto** pueden impedir leer la respuesta; por sí solos no demuestran bloqueo de una app alternativa. El segundo servidor usa HTTP y desde una página HTTPS el navegador puede bloquearlo. La APK también referencia contenido DASH con DRM; **no se intenta reproducir ni eludir esa protección**.

No incluye canales, claves de acceso ni transmisiones de terceros.

## Cómo probar desde Windows

### Con GitHub Pages (si tu cuenta permite Pages para el repositorio)

Entrá en **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** y guardá. El sitio de proyecto tendría como dirección habitual `https://y0t3.github.io/Guiy0-TV/`, **solamente después de activarlo y confirmar que esté publicado**.

**Atención:** este repositorio se encuentra **privado**. GitHub Free requiere un repositorio público para Pages; GitHub Pro y otros planes permiten Pages con repos privados, pero el sitio publicado sigue siendo público.

### Sin GitHub Pages

Descargá el ZIP del repositorio y ejecutá, dentro de la carpeta descomprimida, un servidor estático local. Por ejemplo, si tenés Python:

```sh
python -m http.server 8000
```

Abrí `http://localhost:8000` en Chrome o Edge. Necesitás Internet para cargar **hls.js** desde el CDN y los videos de prueba.

## Cómo usar la prueba

1. Tocá **Reproducir HLS de ejemplo** y verificá si aparece el video de demostración.
2. Tocá **Consultar** en cada servidor de XtremeTV para ver qué información permite obtener tu navegador. Si no se puede leer, el resultado es **no concluyente**.
3. Si tenés una URL completa de un stream que podés usar legítimamente, pegala en el campo y tocá **Probar URL**.
4. El **LG OLED C2 con webOS 26** se probará en otra etapa mediante Developer Mode; no es necesario modificar la TV en esta fase.

## Estructura

- `index.html` — interfaz de prueba.
- `styles.css` — estética retro Miami.
- `app.js` — reproducción HLS, diagnósticos y teclado/control remoto.
- `appinfo.json` — metadatos webOS.

**Estado:** prototipo sin prueba de reproducción validada todavía en el equipo del usuario.
