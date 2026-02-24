package com.startupnews.worldwide;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private long lastBackPressTimeMs = 0L;
  private static final long BACK_EXIT_WINDOW_MS = 1500L;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    configureWebViewForMobileViewport();

    getOnBackPressedDispatcher()
        .addCallback(
            this,
            new OnBackPressedCallback(true) {
              @Override
              public void handleOnBackPressed() {
                if (navigateWebViewBackIfPossible()) {
                  return;
                }

                long now = System.currentTimeMillis();
                if ((now - lastBackPressTimeMs) < BACK_EXIT_WINDOW_MS) {
                  moveTaskToBack(true);
                  return;
                }

                lastBackPressTimeMs = now;
                Toast.makeText(
                        MainActivity.this, "Press back again to exit", Toast.LENGTH_SHORT)
                    .show();
              }
            });
  }

  @Override
  public void onResume() {
    super.onResume();
    configureWebViewForMobileViewport();
  }

  private boolean navigateWebViewBackIfPossible() {
    Bridge bridge = getBridge();
    if (bridge == null) {
      return false;
    }

    WebView webView = bridge.getWebView();
    if (webView != null && webView.canGoBack()) {
      webView.goBack();
      return true;
    }

    return false;
  }

  private void configureWebViewForMobileViewport() {
    Bridge bridge = getBridge();
    if (bridge == null) {
      return;
    }

    WebView webView = bridge.getWebView();
    if (webView == null) {
      return;
    }

    WebSettings settings = webView.getSettings();
    // Respect responsive viewport meta tag and fit page width to device.
    settings.setUseWideViewPort(true);
    settings.setLoadWithOverviewMode(true);
    settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
    settings.setSupportZoom(false);
    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);

    webView.setHorizontalScrollBarEnabled(false);
    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
  }
}
