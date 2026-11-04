"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silencioso — PWA é um bônus, não deve quebrar o app se falhar
      });
    }
  }, []);
  return null;
}
