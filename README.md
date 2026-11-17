# Guiy0-TV 📺🌴

Un reproductor de TV para **LG webOS, Android TV, Android y navegador**, con diseño retro Miami (rosa, turquesa y violeta) inspirado en la identidad de Guiy0.

## Versión 0.4 — Catálogo de canales

El proyecto dejó de ser únicamente un laboratorio: ahora incluye

- **Pantalla principal de TV:** tarjetas con nombres, categorías y señales.
- **Reproductor HLS** con selección de canal, Anterior / Siguiente, Detener y Pantalla completa.
- **Favoritos** locales: se guardan por dispositivo con localStorage, sin cuentas ni Firebase.
- **Búsqueda y filtros** por categoría.
- **Agregar canales** con URL completa HTTPS o HTTP (solo donde las políticas lo permitan).
- **Importar listas M3U** pegando su contenido textual. Las URL con parámetros comunes de autenticación se omiten para evitar guardar secretos.
- **Navegación con teclado/control remoto:** flechas para enfocar, Enter para abrir, Re Pág/Av Pág para cambiar de canal, Atrás para detener. El control LG se verificará con un dispositivo real.
- **Laboratorio XtremeTV:** conserva únicamente las pruebas HTTP HEAD que investigamos en v0.3, sin enviar credenciales ni intentar extraer transmisiones.

### Fuentes iniciales

| Señal | Tipo | Procedencia | Estado |
|---|---|---|---|
| UNLP TV | Canal universitario en vivo | URL bajo infraestructura de UNLP | Enlace público candidato; reproducción externa no verificada todavía |
| Cine de prueba (Big Buck Bunny) | Video de prueba HLS | Mux | **Probado en BlueStacks en v0.3** |
| Cortometraje HD (Tears of Steel) | Video de prueba HLS | Unified Streaming | Reproducción pendiente de validar |
| Calidad adaptable (BipBop) | Video de prueba HLS | Apple Developer | Reproducción pendiente de validar |

**Importante:** que una señal se publique gratuitamente en Internet no implica necesariamente que un proveedor conceda derechos de redistribución. Guiy0-TV es un reproductor; no hospeda ni redistribuye esas transmisiones. Los enlaces pueden dejar de funcionar o bloquear reproductores externos.

La app **no incluye los canales de XtremeTV**. Las capturas PCAPdroid identificaron servidores de video pero no confirmaron rutas completas ni permisos para reproducir contenido mediante aplicaciones alternativas.

## Android TV / móvil

Abrí [GitHub Actions](https://github.com/y0t3/Guiy0-TV/actions/workflows/android-apk.yml). Dentro de una ejecución **exitosa**, descargá el Artifact `Guiy0-TV-Android-debug` y extraé `app-debug.apk`.

La aplicación Android utiliza un WebView con WebViewAssetLoader y empaqueta los mismos archivos web del proyecto. Sigue siendo una **APK experimental**, no una versión de producción ni un reproductor con DRM.

**Actualización:** los APK debug generados en distintas ejecuciones pueden tener distintas firmas; si Android rechaza la actualización, desinstalá la versión anterior antes de instalar la nueva. Eso puede eliminar favoritos o canales personales almacenados localmente. Para evitarlo en el futuro, se necesita una firma release estable.

## Web / Windows

Para publicar la web estática, habilitá **Settings → Pages → Deploy from a branch → main / (root)**. Una vez habilitado y desplegado, el enlace suele ser https://y0t3.github.io/Guiy0-TV/ .

También puede ejecutarse localmente con Python:

```sh
python -m http.server 8000
```

Abrí http://localhost:8000 desde la carpeta del repositorio.

## LG webOS

`appinfo.json` contiene la configuración para empaquetar la aplicación `.ipk`. **Aún no fue instalada ni probada en el LG OLED C2**. La futura prueba requerirá activar Developer Mode en la TV cuando no la estés utilizando como monitor.

## Arquitectura

- `index.html` — navegación, panel de canales y laboratorio.
- `styles.css` — diseño TV, tamaño grande y adaptación móvil.
- `app.js` — canales, controles, reproducción HLS, favoritos y almacenamiento local.
- `appinfo.json` — metadatos webOS.
- `android/` — empaquetado APK y puente diagnóstico Android.
- `.github/workflows/android-apk.yml` — compilación automática.

## Seguridad y límites

- Solo deben añadirse fuentes de streaming cuya reproducción externa esté autorizada.
- El repositorio no contiene credenciales, tokens de terceros ni contenido protegido.
- Las URL personales y favoritos se almacenan **solo en el dispositivo** y no se sincronizan.
- HLS puede fallar por CORS, red, codec, región o requisitos de autenticación.
- El laboratorio no evade DRM ni bloqueos, y un HTTP 200/404 en una ruta base no demuestra acceso a canales.
