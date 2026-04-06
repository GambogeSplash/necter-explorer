"use client";

const STORAGE_KEY = "necter_dev_mode";

export function getDevMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setDevMode(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event("devmode-change"));
}
