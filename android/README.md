# Guiy0-TV — Android y Android TV

La misma interfaz web de la raíz del repositorio se distribuye dentro de una aplicación Android nativa con WebViewAssetLoader.

## Obtener la APK

1. En GitHub, abrí Actions → Guiy0-TV - Android APK.
2. Iniciá Run workflow o elegí una ejecución automática que haya terminado correctamente.
3. Descargá el artifact Guiy0-TV-Android-debug de esa ejecución.
4. Descomprimí y encontrarás app-debug.apk para instalar en Android y Android TV.

No hay ninguna APK garantizada hasta que GitHub Actions termine con éxito.

## Base técnica

- Java, Android Gradle Plugin 8.9.2, JDK 17, Android API 35.
- WebViewAssetLoader ofrece los archivos locales con un origen HTTPS virtual, en lugar de file://.
- Copia index.html, styles.css y app.js de la raíz durante la compilación.
- En Android TV aparece mediante LEANBACK_LAUNCHER; en móviles, mediante LAUNCHER.
- Se requieren datos o Wi-Fi para cargar hls.js y los videos HLS remotos.
- No se incorporan canales ajenos, tokens ni medidas para superar protección DRM.

## Limitaciones de esta primera versión

- Todavía no está probada en dispositivo Android real.
- La reproducción depende de los codecs, las políticas de red y CORS de cada stream.
- El flujo entrega una APK debug. Una nueva compilación puede usar una clave debug diferente y requerir desinstalar la versión previa; para actualizaciones estables hay que configurar una clave release de manera segura.
- Hay que seguir ajustando navegación por control remoto y pantalla completa para televisores.

## Probar localmente

Abrí el directorio android/ en Android Studio; copiá los archivos web de la raíz a android/app/src/main/assets/web/ antes de compilar.
