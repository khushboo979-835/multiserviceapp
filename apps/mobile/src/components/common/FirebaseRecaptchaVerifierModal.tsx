import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { ApplicationVerifier } from "firebase/auth";

export interface FirebaseRecaptchaConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface FirebaseRecaptchaVerifierModalProps {
  firebaseConfig: FirebaseRecaptchaConfig;
  title?: string;
  cancelLabel?: string;
  attemptInvisibleVerification?: boolean;
}

export interface FirebaseRecaptchaVerifierRef extends ApplicationVerifier {
  verify: () => Promise<string>;
  clear: () => void;
  readonly type: string;
}

const CustomWebView = WebView as any;

export const FirebaseRecaptchaVerifierModal = forwardRef<
  FirebaseRecaptchaVerifierRef,
  FirebaseRecaptchaVerifierModalProps
>(({ firebaseConfig, title = "Security Verification", cancelLabel = "Cancel", attemptInvisibleVerification = true }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const resolverRef = useRef<((token: string) => void) | null>(null);
  const rejecterRef = useRef<((reason: any) => void) | null>(null);
  const webViewRef = useRef<any>(null);

  const clear = useCallback(() => {
    setVisible(false);
    setLoading(true);
    if (rejecterRef.current) {
      rejecterRef.current(new Error("reCAPTCHA verification cancelled"));
      rejecterRef.current = null;
      resolverRef.current = null;
    }
  }, []);

  const verify = useCallback(async (): Promise<string> => {
    // If on web, return placeholder
    if (Platform.OS === "web") {
      return Promise.resolve("web_token_placeholder");
    }

    return new Promise<string>((resolve, reject) => {
      resolverRef.current = resolve;
      rejecterRef.current = reject;
      setLoading(true);
      setVisible(true);
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      type: "recaptcha",
      verify,
      clear,
      _reset: () => {},
    }),
    [verify, clear]
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "verify" && data.token) {
        setVisible(false);
        if (resolverRef.current) {
          resolverRef.current(data.token);
          resolverRef.current = null;
          rejecterRef.current = null;
        }
      } else if (data.type === "ready") {
        setLoading(false);
      } else if (data.type === "error") {
        console.warn("[Firebase reCAPTCHA WebView Error]:", data.error);
        setVisible(false);
        if (rejecterRef.current) {
          rejecterRef.current(new Error(data.error || "reCAPTCHA error"));
          rejecterRef.current = null;
          resolverRef.current = null;
        }
      }
    } catch {
      // Ignore unparseable messages
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #recaptcha-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div id="recaptcha-container"></div>
  <script>
    try {
      var config = ${JSON.stringify(firebaseConfig)};
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      var verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: '${attemptInvisibleVerification ? "invisible" : "normal"}',
        callback: function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verify', token: token }));
        },
        'expired-callback': function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: 'reCAPTCHA expired' }));
        },
        'error-callback': function(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: String(err) }));
        }
      });
      verifier.render().then(function(widgetId) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
        ${attemptInvisibleVerification ? "verifier.verify();" : ""}
      }).catch(function(err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: String(err) }));
      });
    } catch(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: e.message }));
    }
  </script>
</body>
</html>
  `;

  if (!visible && Platform.OS !== "web") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={clear}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={clear} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.webViewContainer}>
          <CustomWebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{
              html: htmlContent,
              baseUrl: `https://${firebaseConfig.authDomain}`,
            }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            mixedContentMode="always"
            style={styles.webView}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ef4444" />
              <Text style={styles.loadingText}>Verifying security...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

FirebaseRecaptchaVerifierModal.displayName = "FirebaseRecaptchaVerifierModal";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
});

export default FirebaseRecaptchaVerifierModal;
