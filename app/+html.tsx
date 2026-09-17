import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * De HTML-huls rond de webversie. Dit bestand wordt ALLEEN gebruikt bij
 * `expo export --platform web`, niet in de telefoon-app.
 *
 * Hier staat wat van de webversie een "echte" app maakt: het manifest, de
 * iOS-instellingen om vanaf het startscherm te openen, en de service worker.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover zodat de app onder de notch doorloopt */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        <title>Brouwersstraat 21</title>
        <meta name="description" content="Kot-taken en afvalkalender voor Brouwersstraat 21, Leuven." />

        {/* PWA: hierdoor mag de app op het startscherm gezet worden */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#07060A" />
        <meta name="color-scheme" content="dark" />

        {/* iOS: openen zonder browserbalk, met eigen icoon */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BS21" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.png" />

        {/* Voorkomt dat de achtergrond meescrollt op iOS */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: BASE_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: REGISTER_SW }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const BASE_STYLE = `
  html, body { background-color: #07060A; }
  body {
    margin: 0;
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }
  /* Op een breed scherm de app in een telefoonformaat houden, gecentreerd. */
  @media (min-width: 720px) {
    body { display: flex; justify-content: center; }
    #root { width: 100%; max-width: 480px; box-shadow: 0 0 80px rgba(255,59,0,0.18); }
  }
`;

const REGISTER_SW = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
`;
