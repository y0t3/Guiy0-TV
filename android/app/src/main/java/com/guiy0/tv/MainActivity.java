package com.guiy0.tv;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.webkit.WebViewAssetLoader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.UnknownHostException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import javax.net.ssl.SSLException;
import java.io.IOException;
import org.json.JSONObject;
import androidx.webkit.WebViewClientCompat;

public final class MainActivity extends Activity {
    private WebView webView;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private FrameLayout container;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );

        container = new FrameLayout(this);
        webView = new WebView(this);
        container.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(container);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);

        // Los assets se sirven con un origen HTTPS virtual, nunca file://.
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost())) return false;
                // No permitir navegaciones no HTTPS a sitios externos.
                if (!"https".equals(uri.getScheme())) return true;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (Exception ignored) { }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view;
                customViewCallback = callback;
                webView.setVisibility(View.GONE);
                container.addView(view, new FrameLayout.LayoutParams(-1, -1));
            }
            @Override public void onHideCustomView() {
                hideCustomView();
            }
        });

        // Puente muy limitado: únicamente dos rutas base predefinidas.
        // No permite URLs arbitrarias, tokens ni descargas.
        webView.addJavascriptInterface(new DiagnosticBridge(), "Guiy0Android");

        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.loadUrl("https://appassets.androidplatform.net/assets/web/index.html");
    }


    private final class DiagnosticBridge {
        @JavascriptInterface
        public void probe(String target) {
            final String url;
            if ("xtreme".equals(target)) {
                url = "https://ch.xtremetv.top/live/";
            } else if ("m3u".equals(target)) {
                url = "http://tv.m3uts.xyz/stream/gen/";
            } else {
                return;
            }
            new Thread(() -> runProbe(target, url), "guıy0-head-diagnostic").start();
        }
    }

    private void runProbe(String target, String url) {
        HttpURLConnection connection = null;
        String message;
        try {
            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(7000);
            connection.setReadTimeout(7000);
            connection.setInstanceFollowRedirects(false);
            connection.setUseCaches(false);
            int code = connection.getResponseCode();
            if (code >= 300 && code < 400) {
                message = "HTTP " + code + " (redirección). El servidor responde, pero no confirma acceso a canales.";
            } else if (code == 405 || code == 501) {
                message = "HTTP " + code + ": el servidor no admite HEAD en esa ruta. No concluyente.";
            } else {
                message = "HTTP " + code + ": respuesta recibida sin CORS. No demuestra acceso a canales.";
            }
        } catch (UnknownHostException ex) {
            message = "Error DNS: Android no pudo resolver el dominio.";
        } catch (SocketTimeoutException ex) {
            message = "Tiempo agotado: el servidor no respondió a tiempo.";
        } catch (SSLException ex) {
            message = "Error TLS/certificado HTTPS. No es un bloqueo de app demostrado.";
        } catch (ConnectException ex) {
            message = "No se pudo conectar con el servidor.";
        } catch (IOException ex) {
            message = "Error de red o política de conexión (" + ex.getClass().getSimpleName() + ").";
        } catch (SecurityException ex) {
            message = "Android bloqueó la conexión por una política de seguridad.";
        } finally {
            if (connection != null) connection.disconnect();
        }

        final String callback = "window.guiy0NativeResult && window.guiy0NativeResult(" +
            JSONObject.quote(target) + "," + JSONObject.quote(message) + ");";
        runOnUiThread(() -> {
            if (webView != null) webView.evaluateJavascript(callback, null);
        });
    }

    private void hideCustomView() {
        if (customView == null) return;
        container.removeView(customView);
        customView = null;
        webView.setVisibility(View.VISIBLE);
        if (customViewCallback != null) customViewCallback.onCustomViewHidden();
        customViewCallback = null;
    }

    @Override @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (customView != null) { hideCustomView(); return; }
        webView.evaluateJavascript(
            "(function(){var v=document.getElementById('player');" +
            "if(v&&v.style.display==='block'){var b=document.getElementById('stop');" +
            "if(b)b.click();return 'stopped';}return 'exit';})()",
            value -> { if ("\"exit\"".equals(value)) finish(); }
        );
    }

    @Override protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }
    @Override protected void onDestroy() {
        if (webView != null) {
            container.removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
