package com.passormatch.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.net.Uri;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int CAMERA_PERMISSION_REQUEST = 4271;

    // Holds a WebView camera request that arrived before the OS runtime CAMERA
    // permission was granted, so we can grant/deny it once the user responds.
    private PermissionRequest pendingWebCameraRequest;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Android 15 (SDK 35+) draws apps edge-to-edge by default. Opt in
        // explicitly for backward compatibility on older versions too, per
        // Google Play's edge-to-edge guidance. Must be called before
        // super.onCreate(). Window insets are handled in the WebView via CSS
        // env(safe-area-inset-*), which Capacitor maps from the system insets.
        EdgeToEdge.enable(this);

        super.onCreate(savedInstanceState);

        // The age-verification selfie liveness check runs inside the WebView via
        // getUserMedia. Capacitor's WebView denies WebChromeClient permission
        // requests by default, and Android needs the runtime CAMERA grant too.
        // We delegate to Capacitor's WebChromeClient so file inputs, JS dialogs,
        // console, etc. keep working — only adding onPermissionRequest.
        final WebView webView = getBridge().getWebView();
        final WebChromeClient delegate = new com.getcapacitor.BridgeWebChromeClient(getBridge());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean wantsCamera = false;
                    for (String r : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) wantsCamera = true;
                    }
                    if (!wantsCamera) {
                        // Not a camera request — deny only the unknown resources.
                        request.deny();
                        return;
                    }
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                            == PackageManager.PERMISSION_GRANTED) {
                        request.grant(request.getResources());
                    } else {
                        // Ask the OS for camera now; grant the WebView request in
                        // onRequestPermissionsResult once the user responds.
                        pendingWebCameraRequest = request;
                        ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{ Manifest.permission.CAMERA }, CAMERA_PERMISSION_REQUEST);
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView wv, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                return delegate.onShowFileChooser(wv, filePathCallback, fileChooserParams);
            }
        });

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

    // Resolve a WebView camera request that was waiting on the OS permission
    // dialog: grant it if the user allowed camera, otherwise deny so the web
    // layer's onError fires and shows the "camera needed" message.
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST && pendingWebCameraRequest != null) {
            final PermissionRequest req = pendingWebCameraRequest;
            pendingWebCameraRequest = null;
            boolean granted = grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            runOnUiThread(() -> {
                if (granted) {
                    req.grant(req.getResources());
                } else {
                    req.deny();
                }
            });
        }
    }
}
