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
import androidx.webkit.WebViewClientCompat;

public final class MainActivity extends Activity {
    private WebView webView;
    private View fullScreenView;
    private WebChromeClient.CustomViewCallback fullScreenCallback;
    private FrameLayout container;

    private final class PlayerBridge {
        // Solo admite una posicion de la lista incorporada. No URLs externas o tokens.
        @JavascriptInterface
        public void play(int index) {
            if (index < 0 || index >= PlayerActivity.URLS.length) return;
            runOnUiThread(() -> {
                Intent intent = new Intent(MainActivity.this, PlayerActivity.class);
                intent.putExtra("index", index);
                startActivity(intent);
            });
        }
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        container = new FrameLayout(this);
        webView = new WebView(this);
        container.addView(webView, new FrameLayout.LayoutParams(-1,-1));
        setContentView(container);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this))
            .build();
        webView.setWebViewClient(new WebViewClientCompat(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){
                return loader.shouldInterceptRequest(req.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){
                Uri uri=req.getUrl();
                if("appassets.androidplatform.net".equals(uri.getHost()))return false;
                if(!"https".equals(uri.getScheme()))return true;
                try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override public void onShowCustomView(View view,CustomViewCallback cb){
                if(fullScreenView!=null){cb.onCustomViewHidden();return;}
                fullScreenView=view;fullScreenCallback=cb;
                webView.setVisibility(View.GONE);
                container.addView(view,new FrameLayout.LayoutParams(-1,-1));
            }
            @Override public void onHideCustomView(){hideFullScreen();}
        });
        webView.addJavascriptInterface(new PlayerBridge(),"Guiy0Player");
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.loadUrl("https://appassets.androidplatform.net/assets/web/index.html");
    }

    private void hideFullScreen(){
        if(fullScreenView==null)return;
        container.removeView(fullScreenView);
        fullScreenView=null;
        webView.setVisibility(View.VISIBLE);
        if(fullScreenCallback!=null)fullScreenCallback.onCustomViewHidden();
        fullScreenCallback=null;
    }
    @Override @SuppressWarnings("deprecation")
    public void onBackPressed(){
        if(fullScreenView!=null){hideFullScreen();return;}
        finish();
    }
    @Override protected void onPause(){if(webView!=null)webView.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(webView!=null)webView.onResume();}
    @Override protected void onDestroy(){
        if(webView!=null){container.removeView(webView);webView.destroy();webView=null;}
        super.onDestroy();
    }
}
