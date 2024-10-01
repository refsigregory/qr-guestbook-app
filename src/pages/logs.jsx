import withAuth from '@/components/withAuth';
import { useEffect, useState } from 'react';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        if (!res.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">Logs</h1>
      <ul className="mt-4">
        {logs.length === 0 ? (
          <li>No logs available.</li>
        ) : (
          logs.map((log) => (
            <li key={log.id} className="border p-2 mb-2">
              {log.accessCode} - {new Date(log.createdAt).toLocaleString()}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default withAuth(Logs);

