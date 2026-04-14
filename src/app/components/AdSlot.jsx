// src/app/components/AdSlot.jsx
// Componentes de Adsterra para diferentes posiciones

"use client";
import { useEffect, useRef } from "react";

/**
 * Banner horizontal (728x90) — para header y entre contenido
 */
export function AdBanner({ zoneId = "TU_ZONE_ID" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !zoneId || zoneId === "TU_ZONE_ID" || zoneId.startsWith("ZONE_ID")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `//ads.adsterra.com/js/${zoneId}.js`;
    ref.current.appendChild(script);
  }, [zoneId]);

  return (
    <div className="ad-mid">
      <div className="ad-mid-inner">
        <div>
          <div className="ad-label">Publicidad</div>
          <div ref={ref} style={{ minWidth: 300, minHeight: 60 }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Ad de sidebar (300x250) — para la columna lateral del post
 */
export function AdSidebar({ zoneId = "TU_SIDEBAR_ZONE_ID" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !zoneId || zoneId.startsWith("ZONE_ID")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `//ads.adsterra.com/js/${zoneId}.js`;
    ref.current.appendChild(script);
  }, [zoneId]);

  return (
    <div className="sidebar-ad">
      <div className="ad-label" style={{ marginBottom: 8 }}>Publicidad</div>
      <div ref={ref} style={{ minWidth: 250, minHeight: 200 }} />
    </div>
  );
}

/**
 * Native/In-article ad — se mezcla con el contenido del post
 * Este formato tiene el mejor RPM en Adsterra
 */
export function AdNative({ zoneId = "TU_NATIVE_ZONE_ID" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !zoneId || zoneId.startsWith("ZONE_ID")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `//ads.adsterra.com/js/${zoneId}.js`;
    ref.current.appendChild(script);
  }, [zoneId]);

  return (
    <div style={{ margin: "2rem 0", padding: "1rem", background: "var(--bg2)", borderRadius: 4, border: "1px solid var(--border)" }}>
      <div className="ad-label" style={{ marginBottom: 8 }}>Patrocinado</div>
      <div ref={ref} />
    </div>
  );
}
