# Guiy0-TV 📺🌴 — Versión 0.5

**Objetivo:** abrir la aplicación, elegir un canal y verlo. Nada de usuarios, listas, formularios ni configuración.

## Qué hace

- Muestra una grilla sencilla de canales.
- Al tocar una señal, **Android** abre un reproductor nativo a pantalla completa con Media3/ExoPlayer.
- En el reproductor Android, los botones **Anterior** y **Siguiente** cambian de señal sin regresar al catálogo.
- En **LG webOS y navegador**, usa video HLS nativo o hls.js según el dispositivo.
- Un video público de Mux sirve para comprobar que el reproductor funciona.
- No requiere cuenta, Firebase, servidor propio ni ingresar claves.

## Señales incluidas inicialmente

| Señal | Fuente | Estado |
|---|---|---|
| Canal 26 | Stream HLS publicado por Telecentro, fuente directa | Enlace candidato, no probado todavía en el equipo |
| UNLP TV | Stream HLS de infraestructura de UNLP | Enlace candidato, no probado todavía en el equipo |
| Telemax | Stream HLS publicado por Telecentro | Enlace candidato, no probado todavía en el equipo |
| NET TV | Stream HLS publicado por distribuidor de señal | Enlace candidato, no probado todavía en el equipo |
| Video de prueba | Mux Big Buck Bunny | El enlace se reprodujo previamente en BlueStacks |

**Limitaciones:** los canales pueden fallar o modificar sus políticas de distribución; las pruebas de una APK compilada no garantizan reproducción en un dispositivo. Se utilizan señales sin contraseñas ni mecanismos de acceso protegido. Si un canal no se abre, probar otro; el demo permite distinguir problemas del reproductor y de la fuente.

## Android y Android TV

GitHub Actions compila la APK desde la carpeta `android/`:

https://github.com/y0t3/Guiy0-TV/actions/workflows/android-apk.yml

Descargar el artifact de la compilación más reciente exitosa y extraer `app-debug.apk`.

**Advertencia sobre actualizaciones:** cada compilación debug puede usar otra firma y requerir desinstalar la anterior.

## LG webOS

`appinfo.json` configura la aplicación para su futuro empaquetado webOS `.ipk`. La versión LG **todavía no fue instalada ni validada en la televisión real**.

## Fuentes y permisos

Guiy0-TV no incluye señales de XtremeTV, credenciales Xtream Codes publicadas por terceros ni canales con DRM. Las transmisiones de cada proveedor están sujetas a su disponibilidad y condiciones de uso.

El código de versiones anteriores permanece en el historial GitHub, pero la pantalla principal ya no expone herramientas técnicas.
