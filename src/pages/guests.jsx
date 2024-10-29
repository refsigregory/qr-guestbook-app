import withAuth from '@/components/withAuth';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

function Guests() {
  const [loading, setLoading] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingGuest, setEditingGuest] = useState(null);
  const [newAccessCode, setNewAccessCode] = useState('');
  const [qrCodeUrls, setQrCodeUrls] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Default limit for pagination
  const [totalGuests, setTotalGuests] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGuests();
  }, [page, limit, search]); // Fetch guests whenever page, limit, or search changes

  useEffect(() => {
    setPage(0);
  }, [limit]);

  const fetchGuests = async () => {
    setLoading(true);
    const res = await fetch(`/api/guests?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (res.ok) {
      setGuests(data?.data);
      setTotalGuests(data.pagination.totalGuests); // Set total guests for pagination
      generateQRCodes(data?.data); // Generate QR codes when guests are fetched
    } else {
      alert('Failed to fetch guests.');
    }
    setLoading(false);
  };

  const generateQRCodes = async (guestList) => {
    const urls = {};
    await Promise.all(guestList?.map(async (guest) => {
      const codes = guest.accessCodes.map(ac => ac.code);
      if (codes.length > 0) {
        const qrs = await Promise.all(codes.map(async (code) => {
          if (code) {
            const qrCode = await QRCode.toDataURL(code, {
              type: 'image/png',
              scale: 15,
            });
            return qrCode; 
          }
        }));
        urls[guest.id] = qrs;
      }
    }));
    setQrCodeUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/guests/${isEdit ? selectedID : 'add'}`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      fetchGuests();
      setName('');
      setDescription('');
      
      if (isEdit) {
        alert('Data updated');
        setIsEdit(false);
        setSelectedID(null);
      } else {
        alert('Data added');
      }
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to add guest');
    }
  };

  const handleEdit = (guest) => {
    setIsEdit(true);
    setEditingGuest(guest);
    setSelectedID(guest.id);
    setName(guest.name);
    setDescription(guest.description);
    document.getElementById('form-guest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/guests/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('Data Deleted');
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
      body: JSON.stringify({ guestId }),
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

  const downloadInvitation = async (guest, qrCodeUrl, number = 1) => {
    const templateImg = '/assets/graduation.png'; // Path to your template image

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1080; // Template width
    canvas.height = 1080; // Template height

    const template = new Image();
    const qrCodeImage = new Image();

    template.src = templateImg;
    qrCodeImage.src = qrCodeUrl;

    template.onload = () => {
      setLoadingGenerate(true);
      ctx.drawImage(template, 0, 0);
      qrCodeImage.onload = () => {
        const imgWidth = 500;
        const textVertical = 810;

        ctx.drawImage(qrCodeImage, ((canvas.height/2) - (imgWidth / 2)), 280, imgWidth, imgWidth); // Position and size of the QR code

        ctx.font = '30px Arial';
        ctx.fillStyle = 'black'; // Text color
        ctx.textAlign = "center";

        const guestName = `${guest.name} ${number > 1 ? `(${number})` : ''}`
        ctx.fillText(guestName, (canvas.width/2), textVertical); // Position of the guest's name

        ctx.font = '18px Arial';
        ctx.fillStyle = '#333'; 
        ctx.fillText(guest.description, (canvas.height/2), textVertical + 30); 

        setLoadingGenerate(false);
        const link = document.createElement('a');
        link.download = `invitation-${guest.name}(${number}).png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
    };
  };

  // Pagination controls
  const totalPages = Math.ceil(totalGuests / limit);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">Guest Management</h1>
      
      {/* Search Input */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
      </div>

      <form onSubmit={handleSubmit} id="form-guest" className="bg-white p-6 rounded shadow-md mt-4">
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
          {isEdit ? 'Save' : 'Add'}
        </button>
      </form>
      
      {loading ? (
        <div className="my-2 text-center">Loading...</div>
      ) : (
        <ul>
          {guests.length === 0 ? (
            <li className="border p-2 mb-2">No guests found. Please add a guest.</li>
          ) : (
            guests.map((guest) => (
              <li key={guest.id} className="mt-4 bg-white border p-5 mb-2 flex flex-col">
                <div className="flex justify-between">
                  <div className="text-center text-xl">
                    <strong>{guest.name}</strong> - {guest.description}
                  </div>
                  <div>
                    <button onClick={() => handleEdit(guest)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(guest.id)} className="text-red-500 ml-2">Delete</button>
                  </div>
                </div>
                <div className="mx-auto mt-2 max-w-[600px]">
                  <h3 className="font-semibold text-center">Access Codes
                    <button onClick={() => handleAddAccessCode(guest.id)} className="ml-2 bg-green-500 text-white px-1 rounded" title="Add New Access Code">+</button>
                  </h3>

                  <div className="mt-5">
                    {guest.accessCodes.length === 0 ? (
                      <div>No access codes found for this guest.</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {guest.accessCodes.map((accessCode, index) => (
                          <div key={accessCode.id} className="flex justify-between">
                            <div className="m-auto qr-code-container">
                              <img 
                                src={qrCodeUrls[guest.id]?.[index]} 
                                title={accessCode.code} 
                                alt={`QR Code ${accessCode.code}`} 
                                className="mb-2" 
                              />
                              <div className="hide action-guest-qr flex flex-col">
                                <button 
                                  onClick={() => downloadInvitation(guest, qrCodeUrls[guest.id]?.[index], index + 1)} 
                                  className="font-sm bg-blue-500 text-white p-2 rounded mt-2"
                                  title={`Generate ${accessCode.code} (#${index + 1})`}
                                >
                                  {loadingGenerate ? 'Download' : 'Generate Invitation'}
                                </button>
                                <button onClick={() => handleDeleteAccessCode(accessCode.id)} className="text-red-500">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Per-Page Selector */}
      <div className="mt-4">
        <label htmlFor="limit">Guests per page:</label>
        <select 
          id="limit" 
          value={limit} 
          onChange={(e) => setLimit(parseInt(e.target.value))} 
          className="border p-2 ml-2"
        >
          {[10, 20, 50, 100, 500, 1000].map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button 
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
          disabled={page === 1} 
          className="bg-gray-300 p-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page} of {totalPages} from {totalGuests} Guests</span>
        <button 
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} 
          disabled={page === totalPages} 
          className="bg-gray-300 p-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default withAuth(Guests);
