(function () {
  const BACKEND_URL = "https://lunaar-v-3.onrender.com";
  const CHAT_BASE_URL = "https://lunaar.online";
 
  const currentScript = document.currentScript;
  const token = currentScript && currentScript.getAttribute("data-chatbot-token");
 
  if (!token) {
    console.warn("[Lunaar widget] Missing data-chatbot-token attribute, widget will not load.");
    return;
  }
 
  // Avoid double-init if the script tag somehow runs twice
  if (window.__lunaarWidgetInitialized) return;
  window.__lunaarWidgetInitialized = true;
 
  // ---- Defaults, used until/if metadata fetch resolves ----
  const DEFAULTS = {
    color: "#5b5bd6",
    logo_url: null,
    name: "Chat",
    position: "right" // "right" or "left"
  };
 
  let bubble, iframe, isOpen = false;
 
  function getTextColor(bgColor) {
    if (!bgColor) return "#ffffff";
    let r, g, b;
    try {
      if (bgColor.startsWith("rgb")) {
        [r, g, b] = bgColor.match(/\d+/g).map(Number);
      } else {
        const hex = bgColor.replace("#", "").substring(0, 6);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? "#000000" : "#ffffff";
    } catch (e) {
      return "#ffffff";
    }
  }
 
  function createBubble(meta) {
    const side = meta.position === "left" ? "left" : "right";
 
    bubble = document.createElement("button");
    bubble.setAttribute("aria-label", "Open chat");
    bubble.id = "lunaar-widget-bubble";
 
    Object.assign(bubble.style, {
      position: "fixed",
      bottom: "20px",
      [side]: "20px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      border: "none",
      background: meta.color || DEFAULTS.color,
      color: getTextColor(meta.color || DEFAULTS.color),
      fontSize: "22px",
      lineHeight: "56px",
      textAlign: "center",
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      zIndex: "2147483646", // just under max, stays above virtually everything
      transition: "transform 0.15s ease",
      padding: "0"
    });
 
    if (meta.logo_url) {
      const img = document.createElement("img");
      img.src = meta.logo_url;
      img.alt = "";
      Object.assign(img.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        objectFit: "cover",
        verticalAlign: "middle"
      });
      bubble.appendChild(img);
    } else {
      bubble.textContent = "💬";
    }
 
    bubble.addEventListener("mouseenter", () => {
      bubble.style.transform = "scale(1.06)";
    });
    bubble.addEventListener("mouseleave", () => {
      bubble.style.transform = "scale(1)";
    });
 
    bubble.addEventListener("click", toggleWidget);
 
    document.body.appendChild(bubble);
  }
 
  function createIframe(meta) {
    const side = meta.position === "left" ? "left" : "right";
 
    iframe = document.createElement("iframe");
    iframe.title = meta.name || DEFAULTS.name;
    iframe.src = `${CHAT_BASE_URL}/chat/${encodeURIComponent(token)}?embed=true`;
    iframe.allow = "clipboard-write";
 
    Object.assign(iframe.style, {
      position: "fixed",
      bottom: "90px",
      [side]: "20px",
      width: "380px",
      height: "min(600px, 75vh)",
      maxWidth: "92vw",
      border: "none",
      borderRadius: "16px",
      boxShadow: "0 10px 32px rgba(0,0,0,0.22)",
      zIndex: "2147483646",
      display: "none",
      opacity: "0",
      transition: "opacity 0.15s ease"
    });
 
    document.body.appendChild(iframe);
  }
 
  function toggleWidget() {
    isOpen = !isOpen;
 
    if (isOpen) {
      iframe.style.display = "block";
      // small delay so the display:block takes effect before fading in
      requestAnimationFrame(() => {
        iframe.style.opacity = "1";
      });
      bubble.textContent = "";
      bubble.innerHTML = "✕";
      bubble.setAttribute("aria-label", "Close chat");
    } else {
      iframe.style.opacity = "0";
      bubble.setAttribute("aria-label", "Open chat");
      setTimeout(() => {
        if (!isOpen) iframe.style.display = "none";
      }, 150);
      // restore bubble icon/logo
      restoreBubbleIcon();
    }
  }
 
  function restoreBubbleIcon() {
    // Re-render whatever the bubble should show when closed.
    // Cheap approach: re-run createBubble's icon logic via a data attribute.
    const logoUrl = bubble.getAttribute("data-logo-url");
    bubble.innerHTML = "";
    if (logoUrl) {
      const img = document.createElement("img");
      img.src = logoUrl;
      img.alt = "";
      Object.assign(img.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        objectFit: "cover",
        verticalAlign: "middle"
      });
      bubble.appendChild(img);
    } else {
      bubble.textContent = "💬";
    }
  }
 
  function init(meta) {
    createBubble(meta);
    createIframe(meta);
    if (meta.logo_url) bubble.setAttribute("data-logo-url", meta.logo_url);
  }
 
  // Fetch per-chatbot styling, but don't block forever — fall back to
  // defaults if the request is slow or fails, so the widget still appears.
  let resolved = false;
 
  const fallbackTimer = setTimeout(() => {
    if (resolved) return;
    resolved = true;
    init(DEFAULTS);
  }, 2500);
 
  fetch(`${BACKEND_URL}/api/chatbot-meta?token=${encodeURIComponent(token)}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
    .then((meta) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimer);
      init({ ...DEFAULTS, ...meta });
    })
    .catch(() => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimer);
      init(DEFAULTS);
    });
})();