export function detectGA4(html: string): boolean {
  return html.includes("gtag/js?id=G-") || html.includes("'G-") || html.includes('"G-');
}

export function detectGTM(html: string): boolean {
  return html.includes("googletagmanager.com/gtm.js") || html.includes("GTM-");
}

const CONSENT_TOOLS: string[] = [
  "cookielaw.org",
  "onetrust",
  "cookiebot",
  "trustarc",
  "usercentrics",
  "didomi",
  "osano",
  "cookieyes",
  "quantcast",
];

export function detectConsentBanner(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return CONSENT_TOOLS.some((tool) => lowerHtml.includes(tool));
}