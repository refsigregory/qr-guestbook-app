import { ConfirmationModal } from '@/components/ConfirmationModal';
import withAuth from '@/components/withAuth';
import { useEffect, useState } from 'react';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await res.json();
      setLogs(data?.data);
      setFilteredLogs(data?.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleDelete = async () => {
    if (!logToDelete) return;

    try {
      const res = await fetch(`/api/logs/${logToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete log');
      }
      // Remove the deleted log from state
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logToDelete));
      setFilteredLogs((prevLogs) => prevLogs.filter((log) => log.id !== logToDelete));
      setLogToDelete(null); // Reset the log to delete
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterLogs(value, dateFilter);
  };

  const handleDateFilter = (e) => {
    const value = e.target.value;
    setDateFilter(value);
    filterLogs(searchTerm, value);
  };

  const filterLogs = (search, date) => {
    const filtered = logs.filter((log) => {
      const matchesName = log.guest.name.toLowerCase().includes(search.toLowerCase());
      const matchesDate = date ? new Date(log.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString() : true;
      return matchesName && matchesDate;
    });
    setFilteredLogs(filtered);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">Logs</h1>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="border p-2 rounded mr-2"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={handleDateFilter}
          className="border p-2 rounded mr-2"
        />
        <button className="text-sm bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-2 border border-gray-400 rounded shadow" onClick={fetchLogs}>Refresh</button>
      </div>

      <ul className="mt-4">
        {filteredLogs.length === 0 ? (
          <li>No logs available.</li>
        ) : (
          filteredLogs.map((log) => (
            <li key={log.id} className="border p-2 mb-2 flex justify-between items-center">
              <div>
                <b>{log.guest.name}</b> ({log.accessCode}) - {new Date(log.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
              </div>
              <button
                onClick={() => {
                  setLogToDelete(log.id);
                  setIsModalOpen(true);
                }}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default withAuth(Logs);
