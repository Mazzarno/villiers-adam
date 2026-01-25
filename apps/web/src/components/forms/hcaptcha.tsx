'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement, params: Record<string, unknown>) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

type HCaptchaWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  size?: 'normal' | 'compact';
};

export function HCaptchaWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  size = 'normal',
}: HCaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.hcaptcha) return;

    if (widgetId.current !== null) {
      window.hcaptcha.reset(widgetId.current);
      return;
    }

    widgetId.current = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey,
      size,
      callback: (token: string) => onVerify(token),
      'expired-callback': () => onExpire?.(),
      'error-callback': () => onError?.(),
    });
  }, [scriptReady, siteKey, size, onVerify, onExpire, onError]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
