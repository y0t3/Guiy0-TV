package com.guiy0.tv;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;

public final class PlayerActivity extends Activity {
    // Fuentes gratuitas de acceso web. La disponibilidad y los permisos de reproducción
    // dependen del emisor. No se incluyen claves ni credenciales de terceros.
    public static final String[] URLS = {
        "https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8",
        "https://stream-gtlc.telecentro.net.ar/hls/telemaxhls/main.m3u8",
        "https://unlimited1-us.dps.live/nettv/nettv.smil/playlist.m3u8",
        "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    };
    private static final String[] TITLES = {
        "Canal 26","UNLP TV","Telemax","NET TV","Video de prueba"
    };
    private ExoPlayer player;
    private TextView title;
    private TextView feedback;
    private int current;

    private int dip(float value){
        return (int)(value * getResources().getDisplayMetrics().density + .5f);
    }
    private Button action(String text){
        Button b=new Button(this);
        b.setText(text);
        b.setTextColor(Color.WHITE);
        b.setTextSize(15);
        b.setAllCaps(false);
        b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(46,36,73)));
        b.setPadding(dip(12),dip(8),dip(12),dip(8));
        return b;
    }
    private TextView text(String value,int size){
        TextView t=new TextView(this);
        t.setText(value);
        t.setTextSize(size);
        t.setTextColor(Color.WHITE);
        t.setGravity(Gravity.CENTER);
        return t;
    }

    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        current=Math.max(0,Math.min(URLS.length-1,getIntent().getIntExtra("index",0)));
        FrameLayout root=new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        PlayerView view=new PlayerView(this);
        view.setUseController(true);
        root.addView(view,new FrameLayout.LayoutParams(-1,-1));

        LinearLayout top=new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setBackgroundColor(Color.argb(205,14,12,29));
        top.setPadding(dip(14),dip(7),dip(14),dip(7));
        Button back=action("‹ Volver");
        back.setOnClickListener(v->finish());
        top.addView(back,new LinearLayout.LayoutParams(dip(116),dip(54)));
        title=text(TITLES[current],20);
        title.setGravity(Gravity.START|Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0,dip(54),1);
        lp.leftMargin=dip(15);top.addView(title,lp);
        FrameLayout.LayoutParams topLp=new FrameLayout.LayoutParams(-1,dip(73),Gravity.TOP);
        root.addView(top,topLp);

        LinearLayout bottom=new LinearLayout(this);
        bottom.setGravity(Gravity.CENTER);
        bottom.setPadding(dip(10),dip(10),dip(10),dip(10));
        bottom.setBackgroundColor(Color.argb(205,14,12,29));
        Button prev=action("◀ Anterior");
        Button next=action("Siguiente ▶");
        prev.setOnClickListener(v->switchTo((current-1+URLS.length)%URLS.length));
        next.setOnClickListener(v->switchTo((current+1)%URLS.length));
        bottom.addView(prev,new LinearLayout.LayoutParams(dip(170),dip(54)));
        feedback=text("Conectando…",14);
        LinearLayout.LayoutParams fb=new LinearLayout.LayoutParams(0,dip(54),1);
        fb.leftMargin=dip(8);fb.rightMargin=dip(8);
        bottom.addView(feedback,fb);
        bottom.addView(next,new LinearLayout.LayoutParams(dip(170),dip(54)));
        FrameLayout.LayoutParams botLp=new FrameLayout.LayoutParams(-1,dip(76),Gravity.BOTTOM);
        root.addView(bottom,botLp);
        setContentView(root);

        player=new ExoPlayer.Builder(this).build();
        view.setPlayer(player);
        player.addListener(new Player.Listener(){
            @Override public void onPlaybackStateChanged(int state){
                if(state==Player.STATE_READY)feedback.setText("");
                else if(state==Player.STATE_BUFFERING)feedback.setText("Cargando…");
                else if(state==Player.STATE_ENDED)feedback.setText("Finalizó la reproducción");
            }
            @Override public void onPlayerError(PlaybackException error){
                feedback.setText("Esta señal no está disponible. Probá otra.");
            }
        });
        switchTo(current);
    }

    private void switchTo(int index){
        current=index;
        title.setText(TITLES[current]);
        feedback.setText("Conectando…");
        MediaItem item=new MediaItem.Builder().setUri(URLS[current])
            .setMimeType(MimeTypes.APPLICATION_M3U8).build();
        player.stop();
        player.setMediaItem(item);
        player.prepare();
        player.play();
    }

    @Override protected void onPause(){
        if(player!=null)player.pause();
        super.onPause();
    }
    @Override protected void onResume(){
        super.onResume();
        if(player!=null)player.play();
    }
    @Override protected void onDestroy(){
        if(player!=null){player.release();player=null;}
        super.onDestroy();
    }
}
