import { describe, it, expect } from "vitest";
import { detectGA4, detectGTM, detectConsentBanner } from "./detect";

describe("detectGA4", () => {
  it("finds GA4 when Google's gtag script is on the page", () => {
    const html = '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>';
    expect(detectGA4(html)).toBe(true);
  });

  it("returns false for a page without GA4", () => {
    const html = "<html><body><h1>Hello</h1></body></html>";
    expect(detectGA4(html)).toBe(false);
  });
});

describe("detectGTM", () => {
  it("finds GTM when the Tag Manager script is on the page", () => {
    const html = '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-XYZ789"></script>';
    expect(detectGTM(html)).toBe(true);
  });

  it("returns false for a page without GTM", () => {
    const html = "<html><body><h1>Hello</h1></body></html>";
    expect(detectGTM(html)).toBe(false);
  });
});

describe("detectConsentBanner", () => {
  it("finds a consent tool even with different capital letters", () => {
    const html = '<script src="https://cdn.cookielaw.org/OneTrust.js"></script>';
    expect(detectConsentBanner(html)).toBe(true);
  });

  it("returns false when no consent tool is on the page", () => {
    const html = "<html><body><h1>Hello</h1></body></html>";
    expect(detectConsentBanner(html)).toBe(false);
  });
});