export const registerServiceWorker = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA Service Worker] Registered successfully with scope:", registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("[PWA Service Worker] New version available! Refresh to update.");
                  } else {
                    console.log("[PWA Service Worker] Content cached for offline access.");
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn("[PWA Service Worker] Registration failed:", error);
        });
    });
  }
};
