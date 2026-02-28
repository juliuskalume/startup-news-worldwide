package com.sentirax.news;

import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
  private static final long BACK_EXIT_WINDOW_MS = 1500L;
  private static final long BACK_NAV_SPINNER_MS = 1200L;
  private static final String PRIMARY_APP_HOST = "news.sentirax.com";
  private static final String FALLBACK_APP_HOST = "startup-news-worldwide.vercel.app";

  private long lastBackPressTimeMs = 0L;
  private FrameLayout nativeLoadingOverlay;
  private final Handler uiHandler = new Handler(Looper.getMainLooper());
  private Runnable hideOverlayRunnable;
  private boolean nativeHapticsBridgeAttached = false;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    initNativeLoadingOverlay();
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
    hideNativeLoadingOverlay();
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (hideOverlayRunnable != null) {
      uiHandler.removeCallbacks(hideOverlayRunnable);
      hideOverlayRunnable = null;
    }
  }

  private boolean navigateWebViewBackIfPossible() {
    Bridge bridge = getBridge();
    if (bridge == null) {
      return false;
    }

    WebView webView = bridge.getWebView();
    if (webView != null && webView.canGoBack()) {
      if (shouldShowBackSpinner(webView.getUrl())) {
        showNativeLoadingOverlay(BACK_NAV_SPINNER_MS);
      }
      webView.goBack();
      return true;
    }

    return false;
  }

  private boolean shouldShowBackSpinner(String currentUrl) {
    if (currentUrl == null || currentUrl.isEmpty()) {
      return false;
    }

    try {
      Uri uri = Uri.parse(currentUrl);
      String host = uri.getHost();
      if (host == null || host.isEmpty()) {
        return false;
      }

      String normalizedHost = host.toLowerCase(Locale.US);
      return !normalizedHost.contains(PRIMARY_APP_HOST)
          && !normalizedHost.contains(FALLBACK_APP_HOST);
    } catch (Exception ignored) {
      return false;
    }
  }

  private void initNativeLoadingOverlay() {
    ViewGroup root = findViewById(android.R.id.content);
    if (root == null || nativeLoadingOverlay != null) {
      return;
    }

    nativeLoadingOverlay = new FrameLayout(this);
    nativeLoadingOverlay.setVisibility(View.GONE);
    nativeLoadingOverlay.setClickable(true);
    nativeLoadingOverlay.setBackgroundColor(Color.parseColor("#6607101D"));

    ProgressBar spinner = new ProgressBar(this);
    spinner.setIndeterminate(true);

    FrameLayout.LayoutParams spinnerParams =
        new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
    spinnerParams.gravity = Gravity.CENTER;
    nativeLoadingOverlay.addView(spinner, spinnerParams);

    FrameLayout.LayoutParams overlayParams =
        new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT);
    root.addView(nativeLoadingOverlay, overlayParams);
  }

  private void showNativeLoadingOverlay(long durationMs) {
    if (nativeLoadingOverlay == null) {
      return;
    }

    nativeLoadingOverlay.setVisibility(View.VISIBLE);

    if (hideOverlayRunnable != null) {
      uiHandler.removeCallbacks(hideOverlayRunnable);
    }

    hideOverlayRunnable =
        new Runnable() {
          @Override
          public void run() {
            hideNativeLoadingOverlay();
          }
        };

    uiHandler.postDelayed(hideOverlayRunnable, durationMs);
  }

  private void hideNativeLoadingOverlay() {
    if (nativeLoadingOverlay == null) {
      return;
    }

    if (hideOverlayRunnable != null) {
      uiHandler.removeCallbacks(hideOverlayRunnable);
      hideOverlayRunnable = null;
    }

    nativeLoadingOverlay.setVisibility(View.GONE);
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
    attachNativeHapticsBridge(webView);
    webView.setHapticFeedbackEnabled(true);

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

  private void attachNativeHapticsBridge(WebView webView) {
    if (nativeHapticsBridgeAttached) {
      return;
    }

    webView.addJavascriptInterface(new NativeHapticsBridge(webView), "AndroidHaptics");
    nativeHapticsBridgeAttached = true;
  }

  private final class NativeHapticsBridge {
    private final WebView webView;

    NativeHapticsBridge(WebView webView) {
      this.webView = webView;
    }

    @JavascriptInterface
    public void touchDown() {
      perform(HapticFeedbackConstants.VIRTUAL_KEY);
    }

    @JavascriptInterface
    public void touchUp() {
      perform(HapticFeedbackConstants.VIRTUAL_KEY_RELEASE);
    }

    @JavascriptInterface
    public void confirm() {
      perform(HapticFeedbackConstants.CONFIRM);
    }

    @JavascriptInterface
    public void reject() {
      perform(HapticFeedbackConstants.REJECT);
    }

    private void perform(int feedbackConstant) {
      runOnUiThread(
          () -> {
            if (webView != null) {
              webView.performHapticFeedback(feedbackConstant);
            }
          });
    }
  }
}
