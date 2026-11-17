# Guiy0-TV 📺🌴 — v0.6

**Idea:** encender la TV, elegir un canal y mirar. Sin usuarios, sin listas M3U para pegar, sin formularios ni configuración.

## Primera ampliación del catálogo (25 entradas)

Dejamos **las 3 señales que el usuario comprobó en BlueStacks**: Canal 26, Telemax y NET TV.

Agregamos **21 canales candidatos** de televisión argentina: Argentinisima Satelital, Caras TV, Canal Provincial, Canal Universidad (Mar del Plata), RTN Neuquén, Canal 7 Jujuy, Canal 3 La Pampa, Canal 3 Arroyito, Canal 4 Esquel, Catamarca TV, Mercurio Noticias, Multivision Federal, Litus TV, Garage TV, Cumbia Mix, Chamamé TV, Canal 2 NexTV Rafaela, Canal 20 Villa María, Canal 5 Santa Fe, Canal 3 Formosa y Canal 7 Neuquén.

El catálogo conserva además **1 video de demostración** (Mux HLS) para diagnosticar el reproductor.

- Total: **24 señales de TV + 1 video demo**.
- Las fuentes nuevas provienen del catálogo argentino publicado por [Nexonic IPTV](https://github.com/Shahrukhalid/nexonic-iptv) y pasaron por su listado de canales verificados durante las últimas 48 horas en la consulta de 17/11/2026. El enlace original de NET TV, por su parte, fue confirmado directamente en BlueStacks y por eso se conservó.
- **IMPORTANTE:** las 21 señales nuevas NO fueron probadas aún en el BlueStacks del usuario. Que un catálogo marque un enlace como accesible desde sus servidores no garantiza que vaya a funcionar en Argentina o en webOS. Algunas emisiones pueden ser intermitentes, tener límites geográficos o condiciones específicas de uso.
- Se priorizaron señales de libre acceso (noticias, universitarias, regionales, música, cultura). Se excluyeron del lote experimental señales de suscripción o DRM presentes en listas comunitarias; la publicación de una URL en GitHub no es por sí sola una licencia de uso.

## Reproductor sin configuraciones

- En **Android / Android TV** la app usa Media3/ExoPlayer en una pantalla de reproducción nativa, con botones Anterior, Siguiente y Volver.
- En **webOS** la misma grilla se reproduce con HLS nativo o hls.js cuando corresponda.
- Los canales están definidos en `app.js` y sincronizados en `android/app/src/main/java/com/guiy0/tv/PlayerActivity.java`. El próximo paso técnico será evitar duplicar el catálogo y permitir actualizaciones automáticas sin agregar controles visibles.

## APK Android

El flujo de GitHub Actions compila una APK de prueba:

https://github.com/y0t3/Guiy0-TV/actions/workflows/android-apk.yml

Los APK de depuración de distintas ejecuciones pueden llevar firmas distintas. Si una actualización falla, desinstalar la versión anterior puede ser necesario y borra sus datos locales.

## Límites

- No se incorporaron credenciales de la publicación de TikTok ni se extrajeron canales de XtremeTV.
- No se eluden tokens, paywalls, DRM ni restricciones de distribución.
- Los enlaces pueden cambiar o desaparecer sin aviso.
- **La versión LG webOS todavía no está probada en el televisor real.** Se mantiene `appinfo.json` listo para empaquetado futuro en `.ipk`.
