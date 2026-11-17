# Guiy0-TV 📺

Proyecto multiplataforma de reproductor de streaming, con identidad Guiy0 y estética retro Miami. **Primera prioridad: LG webOS**; **segunda: Android TV, Google TV y Android móvil**. La web permite probar la interfaz desde Windows.

## Estado actual

- Reproductor de prueba HTML5, HLS nativo o con hls.js según el dispositivo.
- Video público de demostración para validar reproducción.
- Campo para cargar una URL completa de streaming que tengas autorización para utilizar.
- Diagnóstico HTTP (HEAD) de dos rutas base identificadas en la APK de XtremeTV: la versión web usa fetch sujeto a CORS; **Android v0.3 usa una consulta nativa** y puede distinguir HTTP, DNS, tiempos agotados y TLS. **Las rutas no son canales ni prueban disponibilidad externa.**
- Navegación inicial por flechas/teclado y diseño adaptable.
- Estructura para empaquetar webOS (.ipk) mediante appinfo.json.
- Proyecto Android en [android/](android/README.md), con compilación automática de **APK de prueba** mediante GitHub Actions.

**Todavía no hay canales de XtremeTV funcionales confirmados en este proyecto, ni pruebas completadas en el LG o un equipo Android.** No incluye listas o transmisiones protegidas de terceros.

## Versión web (Windows y navegadores)

1. Activá GitHub Pages: **Settings → Pages → Deploy from a branch → main → /(root)**.
2. Una vez que GitHub confirme la publicación, abrí **https://y0t3.github.io/Guiy0-TV/**.
3. Tocá **Reproducir HLS de ejemplo**. Si funciona, el reproductor básico está operativo en ese navegador.
4. Podés consultar las rutas base, pero los resultados pueden ser **no concluyentes** por CORS, DNS, red o contenido mixto.

Si no querés habilitar Pages, podés descargar el repositorio y servirlo con Python desde su raíz:

    python -m http.server 8000

Abrí http://localhost:8000

## Versión Android / Android TV

El proyecto Android **empaqueta una copia de los mismos archivos de la raíz** dentro de un WebView con origen HTTPS local seguro, usando WebViewAssetLoader.

- En GitHub, abrí **Actions → Guiy0-TV - Android APK**.
- Elegí una compilación exitosa y descargá **Guiy0-TV-Android-debug** dentro de **Artifacts**.
- Extraé el ZIP e instalá **app-debug.apk**. Para una compilación nueva podés iniciar **Run workflow**.
- Por ahora es una **APK debug experimental**, no una versión final ni una APK verificada en dispositivo real. Las actualizaciones posteriores requerirán una clave estable de firma release.

Más detalles: [android/README.md](android/README.md).

## LG webOS

El archivo appinfo.json prepara la estructura de una app webOS. La instalación requiere habilitar **Developer Mode**, empaquetar el .ipk y probar en el televisor cuando no esté siendo utilizado como monitor. **No se ha instalado todavía**.

## Fuentes de XtremeTV y limitaciones

Las direcciones base identificadas en la APK incluyen:

- https://ch.xtremetv.top/live/
- http://tv.m3uts.xyz/stream/gen/

No son enlaces reproducibles de canales. La aplicación solo consulta HEAD en esas rutas para comprobar qué respuesta puede leer el navegador. Un HTTP 200 **no demuestra acceso a un stream**; un error CORS, HTTP, DNS o de contenido mixto **tampoco demuestra bloqueo por otra app**. El contenido DASH protegido con DRM no se analiza para evadir restricciones.

Guiy0-TV no proporciona canales ni credenciales de terceros. Usá solamente fuentes de reproducción que tengas derecho a utilizar.

## Estructura del proyecto

- index.html: diseño e interfaz.
- styles.css: identidad retro Miami y responsividad.
- app.js: HLS, navegación inicial y diagnóstico.
- appinfo.json: descripción del paquete webOS.
- android/: proyecto Android/Android TV.
- .github/workflows/android-apk.yml: compilación de APK de prueba desde GitHub Actions.

**Próximos pasos:** validar primero el reproductor web, comprobar el resultado de la primera compilación Android, probar con control remoto y luego avanzar a la instalación webOS.

## Diagnóstico Android v0.3

- En Android/BlueStacks, **Consultar** ahora utiliza HTTP HEAD desde código Java nativo y no desde el WebView. Así evitamos la limitación CORS del navegador **solo para el diagnóstico**.
- La comprobación se limita a `https://ch.xtremetv.top/live/` y `http://tv.m3uts.xyz/stream/gen/`. La excepción de HTTP sin cifrar aplica **solo al segundo dominio**, mediante `network_security_config.xml`. No se piden tokens ni se envían credenciales.
- **200, 301, 403, 404 y 405** son posibles respuestas HTTP; ninguna prueba por sí sola que tengamos un canal reproducible o acceso autorizado.
- Un error DNS, timeout, TLS o conexión nos permitirá localizar mejor el problema, pero tampoco acredita que exista un bloqueo por aplicación.
- La APK inspeccionada contiene esas dos direcciones base y una URL DASH asociada a Widevine. **No se identificó una URL HLS completa de canal reutilizable y autorizada** dentro de sus cadenas literales.
- La APK v0.3 se compila en GitHub Actions. **Es de prueba** y puede exigir desinstalar la v0.2 por incompatibilidad de firmas de depuración.
