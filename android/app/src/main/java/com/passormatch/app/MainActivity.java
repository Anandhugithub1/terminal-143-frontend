package com.passormatch.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 15+ (targetSdk 35+) forces edge-to-edge and ignores the
        // Capacitor StatusBar plugin's setStyle/overlay/backgroundColor APIs
        // entirely (see @capacitor/status-bar docs), so neither the icon
        // color nor the WebView inset is handled unless done natively here.
        // Without this, status bar icons (battery %, clock, signal) default
        // to light/white content, which is invisible against our white
        // header — same appearance the JS setStyle(Dark) call used to fix
        // pre-Android 15.
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.show(WindowInsetsCompat.Type.statusBars());
            insetsController.setAppearanceLightStatusBars(true);
        }

        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            int topInset = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            View webViewParent = getBridge().getWebView();
            if (webViewParent != null) {
                webViewParent.setPadding(
                    webViewParent.getPaddingLeft(),
                    topInset,
                    webViewParent.getPaddingRight(),
                    webViewParent.getPaddingBottom()
                );
            }
            return insets;
        });
    }
}
