import withAuth from '@/components/withAuth';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

function Guests() {
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingGuest, setEditingGuest] = useState(null);
  const [newAccessCode, setNewAccessCode] = useState('');
  const [qrCodeUrls, setQrCodeUrls] = useState({});

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const res = await fetch('/api/guests');
    const data = await res.json();
    setGuests(data);
    generateQRCodes(data); // Generate QR codes when guests are fetched
  };

  const generateQRCodes = async (guestList) => {
    const urls = {};
    await Promise.all(guestList.map(async (guest) => {
      const codes = guest.accessCodes.map(ac => ac.code); // Get access codes for QR generation
      if (codes.length > 0) {
        const qrCode = await QRCode.toDataURL(codes.join('\n')); // Generate QR code for all access codes
        urls[guest.id] = qrCode; // Map guest ID to QR code URL
      }
    }));
    setQrCodeUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/guests/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      fetchGuests(); // Refresh guests after adding
      setName('');
      setDescription('');
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to add guest');
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setName(guest.name);
    setDescription(guest.description);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/guests/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchGuests(); // Refresh guest list after delete
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to delete guest');
    }
  };

  const handleAddAccessCode = async (guestId) => {
    const res = await fetch('/api/access-codes/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestId, code: newAccessCode }),
    });

    if (res.ok) {
      fetchGuests(); // Refresh guests to show new access code
      setNewAccessCode(''); // Clear the input field
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to add access code');
    }
  };

  const handleDeleteAccessCode = async (codeId) => {
    const res = await fetch(`/api/access-codes/${codeId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchGuests(); // Refresh the list after deletion
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to delete access code');
    }
  };

  const downloadQRCode = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png'; // Name of the downloaded file
    a.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">Guest Management</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mt-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Add Guest
        </button>
      </form>

      <ul className="mt-4">
        {guests.length === 0 ? (
          <li className="border p-2 mb-2">No guests found. Please add a guest.</li>
        ) : (
          guests.map((guest) => (
            <li key={guest.id} className="border p-2 mb-2 flex flex-col">
              <div className="flex justify-between">
                <div>
                  <strong>{guest.name}</strong> - {guest.description}
                </div>
                <div>
                  <button onClick={() => handleEdit(guest)} className="text-blue-500">Edit</button>
                  <button onClick={() => handleDelete(guest.id)} className="text-red-500 ml-2">Delete</button>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold">Access Codes</h3>
                {guest.accessCodes.length === 0 ? (
                  <div>No access codes found for this guest.</div>
                ) : (
                  guest.accessCodes.map((accessCode) => (
                    <div key={accessCode.id} className="flex justify-between">
                      <span>QR Code for Access Code</span>
                      <div>
                        <img src={qrCodeUrls[guest.id]} alt="QR Code" className="mb-2" />
                        <button onClick={() => downloadQRCode(qrCodeUrls[guest.id])} className="bg-gray-500 text-white p-2 rounded mt-2">
                          Download QR Code
                        </button>
                        <button onClick={() => handleDeleteAccessCode(accessCode.id)} className="text-red-500 ml-2">Delete</button>
                      </div>
                    </div>
                  ))
                )}
                <input
                  type="text"
                  placeholder="New Access Code"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  className="border p-2 mt-2 w-full"
                />
                <button onClick={() => handleAddAccessCode(guest.id)} className="bg-green-500 text-white p-2 rounded mt-2">
                  Add Access Code
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default withAuth(Guests);
