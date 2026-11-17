"use client";

import { useEffect } from "react";

function injectMarkup(markup, target, position, marker) {
  if (!markup?.trim() || typeof document === "undefined") return () => {};
  const parsed = new DOMParser().parseFromString(`<body>${markup}</body>`, "text/html");
  const inserted = [];

  function appendNode(source, parent) {
    if (source.nodeType === Node.TEXT_NODE) {
      if (source.textContent?.trim()) parent.appendChild(document.createTextNode(source.textContent));
      return;
    }
    if (source.nodeType !== Node.ELEMENT_NODE) return;

    const element = document.createElement(source.tagName.toLowerCase());
    for (const attribute of Array.from(source.attributes)) element.setAttribute(attribute.name, attribute.value);
    if (element.tagName === "SCRIPT") {
      element.text = source.textContent || "";
      element.dataset.pingalManaged = marker;
      inserted.push(element);
      parent.appendChild(element); // Appending a newly-created script executes it.
      return;
    }
    for (const child of Array.from(source.childNodes)) appendNode(child, element);
    element.dataset.pingalManaged = marker;
    inserted.push(element);
    if (position === "start") parent.insertBefore(element, parent.firstChild);
    else parent.appendChild(element);
  }

  const parent = target === "head" ? document.head : document.body;
  const children = Array.from(parsed.body.childNodes);
  if (position === "start") {
    for (const child of children.reverse()) appendNode(child, parent);
  } else {
    for (const child of children) appendNode(child, parent);
  }

  return () => inserted.forEach((element) => element.remove());
}

export default function SiteCodeInjector({ headCode = "", bodyStartCode = "", bodyEndCode = "" }) {
  useEffect(() => {
    const cleanups = [
      injectMarkup(headCode, "head", "end", "head"),
      injectMarkup(bodyStartCode, "body", "start", "body-start"),
      injectMarkup(bodyEndCode, "body", "end", "body-end"),
    ];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [headCode, bodyStartCode, bodyEndCode]);

  return null;
}
