// src/app/components/AdSlot.jsx
// Componentes de Adsterra — soporta formato atOptions (iframe) y container (native)

"use client";
import { useEffect, useRef } from "react";

/**
 * Formato atOptions (iframe) — Banner 728x90 y Sidebar 300x250
 * Script: highperformanceformat.com
 */
function AdOptionsSlot({ zoneKey, width, height, className, style, label = "Publicidad" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!zoneKey || !ref.current) return;

    const atScript = document.createElement("script");
    atScript.type = "text/javascript";
    atScript.text = `
      atOptions = {
        'key': '${zoneKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://www.highperformanceformat.com/${zoneKey}/invoke.js`;

    ref.current.appendChild(atScript);
    ref.current.appendChild(invokeScript);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [zoneKey]);

  if (!zoneKey) return null;

  return (
    <div className={className} style={style}>
      <div className="ad-label" style={{ marginBottom: 8 }}>{label}</div>
      <div ref={ref} style={{ minWidth: width, minHeight: height }} />
    </div>
  );
}

/**
 * Formato container (native/in-article)
 * Script: profitablecpmratenetwork.com
 */
function AdContainerSlot({ zoneKey, className, style, label = "Patrocinado" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!zoneKey || !containerRef.current) return;

    containerRef.current.id = `container-${zoneKey}`;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `https://pl29153153.profitablecpmratenetwork.com/${zoneKey}/invoke.js`;
    containerRef.current.parentNode.insertBefore(script, containerRef.current);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [zoneKey]);

  if (!zoneKey) return null;

  return (
    <div className={className} style={style}>
      <div className="ad-label" style={{ marginBottom: 8 }}>{label}</div>
      <div ref={containerRef} />
    </div>
  );
}

/**
 * Banner horizontal 728x90 — header / entre contenido
 */
export function AdBanner({ zoneKey }) {
  return (
    <AdOptionsSlot
      zoneKey={zoneKey}
      width={728}
      height={90}
      className="ad-mid"
      style={{ margin: "2rem 0" }}
    />
  );
}

/**
 * Sidebar 300x250 — columna lateral del post
 */
export function AdSidebar({ zoneKey }) {
  return (
    <AdOptionsSlot
      zoneKey={zoneKey}
      width={300}
      height={250}
      className="sidebar-ad"
      style={{ marginBottom: "1.5rem" }}
    />
  );
}

/**
 * Native / In-article — se mezcla con el contenido del post
 */
export function AdNative({ zoneKey }) {
  return (
    <AdContainerSlot
      zoneKey={zoneKey}
      className="ad-native"
      style={{ margin: "2rem 0", padding: "1rem", background: "var(--bg2)", borderRadius: 4, border: "1px solid var(--border)" }}
    />
  );
}
