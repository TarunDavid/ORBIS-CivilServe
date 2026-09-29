import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Smartphone, Database, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../api';

interface DeviceState {
  id: number;
  device_id: string;
  last_sync_time: string | null;
  sync_status: string;
  created_at: string;
}

export default function EdgeIndex() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: string; conflicts: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchDevices();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/edge/devices/');
      setDevices(res.data);
    } catch (err) {
      console.error('Failed to fetch devices', err);
    }
  };

  const triggerManualSync = async () => {
    if (!isOnline) {
      alert("Cannot sync while offline.");
      return;
    }
    
    setSyncing(true);
    setSyncResult(null);
    
    try {
      // Mocking a payload that an edge device might send
      const mockPayload = {
        device_id: `browser-${navigator.userAgent.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`,
        payload: {
          offline_records: Math.floor(Math.random() * 50),
          conflicts: Math.random() > 0.5 ? ['rec1', 'rec2'] : []
        }
      };
      
      const res = await api.post('/edge/devices/sync_push/', mockPayload);
      setSyncResult({ status: res.data.status, conflicts: res.data.conflicts_resolved });
      fetchDevices(); // refresh table
    } catch (err) {
      console.error('Sync failed', err);
      setSyncResult({ status: 'failed', conflicts: 0 });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-jakarta">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Edge Synchronization</h1>
          <p className="text-gray-500">Manage offline-first payloads and conflict resolution.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm border ${
          isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Registered Devices</h3>
            <p className="text-2xl font-black text-gray-900">{devices.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Local Queue</h3>
            <p className="text-2xl font-black text-gray-900">{isOnline ? '0' : '12'}</p>
            <p className="text-xs text-gray-500 mt-1">Pending uploads</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <button 
            onClick={triggerManualSync}
            disabled={!isOnline || syncing}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              !isOnline ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
              syncing ? 'bg-primary/20 text-primary' : 'bg-primary text-white hover:bg-primary-dark shadow-md'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Force Sync Now'}
          </button>
          
          {syncResult && (
            <div className={`mt-3 text-xs font-bold flex items-center justify-center gap-1 ${
              syncResult.status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {syncResult.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {syncResult.status === 'success' ? `Synced (Resolved ${syncResult.conflicts} conflicts)` : 'Sync Failed'}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Device Fleet State</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Device ID</th>
                <th className="px-6 py-4 font-bold">Last Sync</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    No devices registered. Click "Force Sync Now" to register this browser.
                  </td>
                </tr>
              ) : (
                devices.map(device => (
                  <tr key={device.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{device.device_id}</td>
                    <td className="px-6 py-4">
                      {device.last_sync_time ? new Date(device.last_sync_time).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        device.sync_status === 'synced' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {device.sync_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
