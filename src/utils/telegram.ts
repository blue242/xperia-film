import type { CatalogItem } from '../types/catalog';

interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
}

interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramWebAppInstance {
  initData?: string;
  platform?: string;
  version?: string;
  isExpanded?: boolean;
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  BackButton?: TelegramBackButton;
  HapticFeedback?: TelegramHapticFeedback;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppInstance;
    };
  }
}

export function getTelegramWebApp(): TelegramWebAppInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
}

export function isRunningInsideTelegram(): boolean {
  const tg = getTelegramWebApp();
  if (!tg) return false;
  return Boolean(tg.initData && tg.initData.length > 0) || (Boolean(tg.platform) && tg.platform !== 'unknown');
}

export function initTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();
  } catch {
    // Safe fallback outside Telegram container
  }

  try {
    tg.setHeaderColor?.('#06060b');
    tg.setBackgroundColor?.('#06060b');
  } catch {
    // Older Telegram WebApp clients may not support custom hex colors
  }

  try {
    tg.disableVerticalSwipes?.();
  } catch {
    // Supported in Bot API 7.7+; ignore safely on older clients
  }
}

export function triggerHaptic(
  kind: 'light' | 'medium' | 'heavy' | 'selection' | 'success' = 'light'
): void {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  try {
    if (kind === 'selection') {
      tg.HapticFeedback.selectionChanged();
    } else if (kind === 'success') {
      tg.HapticFeedback.notificationOccurred('success');
    } else {
      tg.HapticFeedback.impactOccurred(kind);
    }
  } catch {
    // Ignore when unsupported
  }
}

export function openTelegramLink(url: string): void {
  if (!url) return;
  triggerHaptic('medium');

  const tg = getTelegramWebApp();
  const isTgUrl = /^https?:\/\/(t\.me|telegram\.me)\//i.test(url);

  if (tg && isRunningInsideTelegram()) {
    try {
      if (isTgUrl && tg.openTelegramLink) {
        tg.openTelegramLink(url);
        return;
      }
      if (tg.openLink) {
        tg.openLink(url);
        return;
      }
    } catch {
      // Fallback to browser window.open below
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareCatalogItem(item: CatalogItem, primaryLink: string): boolean {
  triggerHaptic('selection');
  const categoryLabel =
    item.category === 'movies' ? 'Film' : item.category === 'series' ? 'Series' : 'Donghua';
  const ratingText = item.rating ? ` ⭐ ${item.rating.toFixed(1)}` : '';
  const yearText = item.year ? ` (${item.year})` : '';
  const shareText = `🎬 Nonton ${categoryLabel}: ${item.title}${yearText}${ratingText} — Sub Indo di Xperia Film!`;

  const tg = getTelegramWebApp();
  if (tg && isRunningInsideTelegram() && tg.openTelegramLink) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      primaryLink
    )}&text=${encodeURIComponent(shareText)}`;
    try {
      tg.openTelegramLink(shareUrl);
      return true;
    } catch {
      // Fallback
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator
      .share({
        title: `${item.title} — Xperia Film`,
        text: shareText,
        url: primaryLink,
      })
      .catch(() => {});
    return true;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(`${shareText}\n${primaryLink}`).catch(() => {});
  }
  return false;
}

let activeBackCallback: (() => void) | null = null;

export function syncTelegramBackButton(visible: boolean, onBack: () => void): () => void {
  const tg = getTelegramWebApp();
  const backButton = tg?.BackButton;
  if (!backButton) return () => {};

  try {
    if (activeBackCallback) {
      backButton.offClick(activeBackCallback);
      activeBackCallback = null;
    }

    if (visible) {
      activeBackCallback = onBack;
      backButton.onClick(onBack);
      backButton.show();
    } else {
      backButton.hide();
    }
  } catch {
    // Ignore outside Telegram
  }

  return () => {
    try {
      if (activeBackCallback) {
        backButton.offClick(activeBackCallback);
        activeBackCallback = null;
      }
    } catch {
      // Ignore
    }
  };
}
