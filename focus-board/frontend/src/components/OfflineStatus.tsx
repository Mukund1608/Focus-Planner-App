import React, { useEffect, useState } from 'react';
import { runSyncIfOnline } from '../offline';
import { useNetworkStatus } from '../offline/useNetworkStatus';

const OfflineStatus: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function doSync() {
      if (isOnline) {
        setSyncing(true);
        await runSyncIfOnline();
        if (!cancel) setSyncing(false);
      }
    }
    doSync();
    return () => { cancel = true; };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div title="Offline" style={{ color: '#ff8a15', fontWeight: 600 }}>
        ⛓️ Offline
      </div>
    );
  }

  if (syncing) {
    return (
      <div title="Syncing" style={{ color: '#007bff', fontWeight: 600 }}>
        🔄 Syncing...
      </div>
    );
  }

  return (
    <div title="All changes synced" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
      ✓ Synced
    </div>
  );
};

export default OfflineStatus;
