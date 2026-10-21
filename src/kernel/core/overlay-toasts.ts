import type { RewardsNotification } from '../../types/notifications'

import { BrowserWindow, screen } from 'electron'

import {
  ingredientsJson,
  resourcesJson,
  trapsJson,
} from '../../config/constants/resources'
import { enduranceWaveLines } from '../../lib/stw/endurance-waves'
import { numberWithCommaSeparator } from '../../lib/parsers/numbers'
import { checkIfCustomDisplayNameIsValid } from '../../lib/validations/properties'

import { AccountsManager } from '../startup/accounts'

type OverlayToast = {
  id: string
  title: string
  lines: string[]
  duration: number
}

const OVERLAY_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body {
    margin: 0;
    background: transparent;
    overflow: hidden;
    font-family: "Segoe UI", system-ui, sans-serif;
    user-select: none;
  }
  #stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    padding: 12px;
  }
  .toast {
    width: 340px;
    max-width: 100%;
    background: rgba(18, 18, 22, 0.94);
    color: #f4f4f5;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    animation: in 0.22s ease-out;
  }
  .title {
    font-weight: 650;
    font-size: 13px;
    margin-bottom: 6px;
    color: #e9c4cc;
  }
  .line {
    font-size: 12px;
    line-height: 1.35;
    opacity: 0.92;
  }
  @keyframes in {
    from { transform: translateY(-8px); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
</style>
</head>
<body>
<div id="stack"></div>
<script>
window.__aerialAddToast = function (toast) {
  var stack = document.getElementById('stack');
  if (!stack) return;
  var el = document.createElement('div');
  el.className = 'toast';
  var title = document.createElement('div');
  title.className = 'title';
  title.textContent = toast.title || '';
  el.appendChild(title);
  (toast.lines || []).forEach(function (line) {
    var row = document.createElement('div');
    row.className = 'line';
    row.textContent = line;
    el.appendChild(row);
  });
  stack.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(function () { el.remove(); }, 320);
  }, toast.duration || 6000);
};
</script>
</body>
</html>`

export class OverlayToasts {
  private static window: BrowserWindow | null = null
  private static creating: Promise<BrowserWindow> | null = null
  private static ready = false
  private static queue: Array<OverlayToast> = []
  private static hideTimer: NodeJS.Timeout | null = null

  static destroy() {
    OverlayToasts.ready = false
    OverlayToasts.creating = null
    OverlayToasts.queue = []

    if (OverlayToasts.hideTimer) {
      clearTimeout(OverlayToasts.hideTimer)
      OverlayToasts.hideTimer = null
    }

    const current = OverlayToasts.window
    OverlayToasts.window = null

    if (current && !current.isDestroyed()) {
      current.destroy()
    }
  }

  static show(notifications: Array<RewardsNotification> | null | undefined) {
    if (!notifications || notifications.length <= 0) {
      return
    }

    const toasts = notifications
      .map(formatOverlayToast)
      .filter((toast): toast is OverlayToast => Boolean(toast))

    if (toasts.length <= 0) {
      return
    }

    OverlayToasts.ensureWindow()
      .then((win) => {
        OverlayToasts.placeWindow(win)
        OverlayToasts.pin(win)

        if (!win.isVisible()) {
          win.showInactive()
        }

        OverlayToasts.pin(win)
        OverlayToasts.push(toasts)
      })
      .catch(() => {})
  }

  private static push(toasts: Array<OverlayToast>) {
    let longest = 0

    toasts.forEach((toast) => {
      longest = Math.max(longest, toast.duration)
      OverlayToasts.queue.push(toast)
    })

    OverlayToasts.flush()
    OverlayToasts.scheduleHide(longest)
  }

  private static flush() {
    const win = OverlayToasts.window

    if (!win || win.isDestroyed() || !OverlayToasts.ready) {
      return
    }

    while (OverlayToasts.queue.length > 0) {
      const toast = OverlayToasts.queue.shift()

      if (!toast) {
        continue
      }

      win.webContents
        .executeJavaScript(
          `window.__aerialAddToast(${JSON.stringify(toast)})`,
        )
        .catch(() => {})
    }
  }

  private static scheduleHide(duration: number) {
    if (OverlayToasts.hideTimer) {
      clearTimeout(OverlayToasts.hideTimer)
    }

    OverlayToasts.hideTimer = setTimeout(() => {
      const win = OverlayToasts.window

      if (win && !win.isDestroyed()) {
        win.hide()
      }
    }, duration + 800)
  }

  private static async ensureWindow() {
    if (OverlayToasts.window && !OverlayToasts.window.isDestroyed()) {
      return OverlayToasts.window
    }

    if (OverlayToasts.creating) {
      return OverlayToasts.creating
    }

    OverlayToasts.creating = OverlayToasts.createWindow()

    try {
      return await OverlayToasts.creating
    } finally {
      OverlayToasts.creating = null
    }
  }

  private static async createWindow() {
    OverlayToasts.ready = false

    const win = new BrowserWindow({
      alwaysOnTop: true,
      backgroundColor: '#00000000',
      focusable: false,
      frame: false,
      fullscreenable: false,
      hasShadow: false,
      height: 520,
      maximizable: false,
      minimizable: false,
      resizable: false,
      show: false,
      skipTaskbar: true,
      transparent: true,
      width: 380,
      webPreferences: {
        contextIsolation: true,
        devTools: false,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    OverlayToasts.window = win
    OverlayToasts.placeWindow(win)
    OverlayToasts.pin(win)

    win.setMenu(null)

    await win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(OVERLAY_HTML)}`,
    )

    OverlayToasts.ready = true
    OverlayToasts.flush()

    win.on('closed', () => {
      if (OverlayToasts.window === win) {
        OverlayToasts.window = null
        OverlayToasts.ready = false
      }
    })

    return win
  }

  private static placeWindow(win: BrowserWindow) {
    const display = screen.getDisplayNearestPoint(
      screen.getCursorScreenPoint(),
    )
    const area = display.workArea
    const width = 380
    const height = Math.min(520, area.height)
    const x = area.x + area.width - width - 12
    const y = area.y + 12

    win.setBounds({ x, y, width, height })
  }

  private static pin(win: BrowserWindow) {
    win.setAlwaysOnTop(true, 'screen-saver', 1)
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    win.setIgnoreMouseEvents(true, { forward: true })
    win.moveTop()
  }
}

function formatOverlayToast(
  notification: RewardsNotification,
): OverlayToast | null {
  const lines = getRewardLines(notification)

  if (lines.length <= 0) {
    return null
  }

  const account = AccountsManager.getAccountById(notification.accountId)
  const accountName = checkIfCustomDisplayNameIsValid(
    account?.customDisplayName,
  )
    ? account!.customDisplayName
    : (account?.displayName ?? 'unknown-user')

  return {
    id: notification.id,
    title: `Claimed rewards · ${accountName}`,
    lines,
    duration: Math.min(14_000, 4_000 + lines.length * 900),
  }
}

function getRewardLines(notification: RewardsNotification) {
  const lines: Array<string> = enduranceWaveLines(notification.endurance)

  Object.entries(notification.rewards).forEach(([itemType, quantity]) => {
    if (!quantity) {
      return
    }

    lines.push(
      `${numberWithCommaSeparator(quantity)} × ${lookupRewardName(itemType)}`,
    )
  })

  const accoladesTotal =
    (notification.accolades?.totalMissionXPRedeemed ?? 0) +
    (notification.accolades?.totalQuestXPRedeemed ?? 0)

  if (accoladesTotal > 0) {
    lines.push(`${numberWithCommaSeparator(accoladesTotal)} × Accolades`)
  }

  return lines
}

function lookupRewardName(itemType: string) {
  const key = itemType
    .replace(/_((very)?low|medium|(very)?high|extreme)$/gi, '')
    .replace(/^AccountResource:/i, '')
    .replace(/^CardPack:zcp_/i, '')
    .replace(/^Ingredient:/i, '')
    .replace(/^Trap:/i, '')

  const tables = [resourcesJson, ingredientsJson, trapsJson] as Array<
    Record<string, { name?: string }>
  >

  for (const table of tables) {
    const hit = Object.entries(table).find(([id]) =>
      key.toLowerCase().includes(id.toLowerCase()),
    )

    if (hit?.[1]?.name) {
      return hit[1].name
    }
  }

  return key
}
