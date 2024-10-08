import withAuth from '@/components/withAuth';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

function Guests() {
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
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
    setGuests(data?.data);
    generateQRCodes(data?.data); // Generate QR codes when guests are fetched
  };

  const generateQRCodes = async (guestList) => {
    const urls = {};
    await Promise.all(guestList?.map(async (guest) => {
      const codes = guest.accessCodes.map(ac => ac.code); // Get access codes for QR generation
      if (codes.length > 0) {
        const qrs = await Promise.all(codes.map(async (code) => {
          if (code) {
            const qrCode = await QRCode.toDataURL(code);
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
      fetchGuests(); // Refresh guests after adding
      setName('');
      setDescription('');
      
      if (isEdit) {
        setIsEdit(false);
        setSelectedID(null);
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

  const downloadInvitation = async (guest, number = 1) => {
    const templateImg = '/assets/template.png'; // Path to your template image
    const qrCodeUrl = qrCodeUrls[guest.id]?.[0]; // Assuming you want the first QR code

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const template = new Image();
    const qrCodeImage = new Image();

    // Set canvas size (adjust as needed)
    canvas.width = 500; // Template width
    canvas.height = 500; // Template height

    template.src = templateImg;
    qrCodeImage.src = qrCodeUrl;

    template.onload = () => {
      setLoadingGenerate(true);

      ctx.drawImage(template, 0, 0); // Draw template
      qrCodeImage.onload = () => {
        ctx.drawImage(qrCodeImage, 50, 100, 150, 150); // Position and size of the QR code
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black'; // Text color
        ctx.fillText(guest.name, 50, 300); // Position of the guest's name

        setLoadingGenerate(false);

        // Download the canvas as an image
        const link = document.createElement('a');
        link.download = `invitation-${guest.name}(${number}).png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
    };
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
          {isEdit ? 'Save' : 'Add'}
        </button>
      </form>

      <ul>
        {guests?.length === 0 ? (
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
                      {
                        guest.accessCodes.map((accessCode, index) => (
                          <div key={accessCode.id} className="flex justify-between">
                            <div className="m-auto qr-code-container">
                              <img 
                                src={qrCodeUrls[guest.id]?.[index]} 
                                title={accessCode.code} 
                                alt={`QR Code ${accessCode.code}`} 
                                className="mb-2" 
                              />
                              <div className="hide action-guest-qr flex flex-col"> {/* Apply both classes */}
                                <button 
                                  onClick={() => downloadInvitation(guest, index+1)} 
                                  className="font-sm bg-blue-500 text-white p-2 rounded mt-2"
                                  title={`Generate ${accessCode.code} (#${index+1})`}
                                >
                                  {loadingGenerate ? 'Download' : 'Generate Invitation'}
                                </button>
                                <button onClick={() => handleDeleteAccessCode(accessCode.id)} className="text-red-500">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default withAuth(Guests);
