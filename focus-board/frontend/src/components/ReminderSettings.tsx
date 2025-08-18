import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'focusboard-reminders-settings';

type LeadMinutes = 0 | 5 | 10 | 15 | 30 | 60;

interface ReminderPrefs {
  notificationsEnabled: boolean;
  defaultLeadMinutes: LeadMinutes;
}

const DEFAULT_PREFS: ReminderPrefs = {
  notificationsEnabled: false,
  defaultLeadMinutes: 10,
};

function loadPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as ReminderPrefs) };
  } catch (_) {}
  return DEFAULT_PREFS;
}

function savePrefs(prefs: ReminderPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

const ReminderSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<ReminderPrefs>(loadPrefs);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      setStatusMsg('Notifications are not supported in this browser.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setPrefs((p) => ({ ...p, notificationsEnabled: true }));
        setStatusMsg('Notifications enabled.');
      } else {
        setPrefs((p) => ({ ...p, notificationsEnabled: false }));
        setStatusMsg('Permission not granted.');
      }
    } catch (e) {
      setStatusMsg('Permission request failed.');
    }
  };

  const toggleNotifications = async () => {
    if (permission !== 'granted') {
      await requestPermission();
      return;
    }
    setPrefs((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }));
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value) as LeadMinutes;
    setPrefs((p) => ({ ...p, defaultLeadMinutes: value }));
  };

  const sendTest = async () => {
    if (permission !== 'granted' || !prefs.notificationsEnabled) {
      setStatusMsg('Enable notifications first.');
      return;
    }
    try {
      new Notification('FocusBoard Test Reminder', {
        body: `This is a test notification. Default lead time: ${prefs.defaultLeadMinutes} min`,
        silent: false,
      });
      setStatusMsg('Test notification sent.');
    } catch (e) {
      setStatusMsg('Failed to send notification.');
    }
  };

  return (
    <section aria-label="Reminders" style={{ display: 'grid', gap: '1rem', maxWidth: 520, margin: '1rem auto' }}>
      <h2 style={{ margin: 0 }}>Reminders</h2>
      <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>Configure browser notifications and default reminder lead time.</p>

      <div role="group" aria-label="Browser Notifications" style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="notif-toggle"
            type="checkbox"
            checked={prefs.notificationsEnabled && permission === 'granted'}
            onChange={toggleNotifications}
            aria-checked={prefs.notificationsEnabled && permission === 'granted'}
          />
          <label htmlFor="notif-toggle">Enable browser notifications</label>
        </div>
        <div aria-live="polite" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Status: {permission === 'unsupported' ? 'Not supported' : permission}
        </div>
        {permission !== 'granted' && permission !== 'unsupported' && (
          <button onClick={requestPermission} aria-label="Request notification permission">Grant Permission</button>
        )}
      </div>

      <div role="group" aria-label="Default Lead Time" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label htmlFor="lead-select">Default lead time:</label>
        <select id="lead-select" value={prefs.defaultLeadMinutes} onChange={handleLeadChange} aria-label="Default reminder lead time">
          <option value={0}>At time</option>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
        <button onClick={sendTest} aria-label="Send test notification">Send test</button>
      </div>

      {statusMsg && (
        <div aria-live="polite" style={{ color: 'var(--text-secondary)' }}>{statusMsg}</div>
      )}
    </section>
  );
};

export default ReminderSettings;
