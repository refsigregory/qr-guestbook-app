import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [login, setLogin] = useState(false);
   useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('token');
    if (token) {
      setLogin(true);
    }
  }, []);
  
  const handleLogout = () => {
      localStorage.removeItem('token');
      setLogin(false);
      
      window.location.reload();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to the QR Guestbook</h1>
      <p className="mb-8">Manage guests, generate access codes, and track logs efficiently.</p>
      <div className="flex flex-col space-y-4">
        {
            login ? 
                <div onClick={()=> handleLogout()} className="bg-blue-500 text-white px-4 py-2 rounded shadow cursor-pointer">
                  Logout
                </div>
            :
                <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded shadow">
                  Login
                </Link>
        }
        
        <Link href="/guests" className="bg-green-500 text-white px-4 py-2 rounded shadow">
          Manage Guests
        </Link>
        <Link href="/logs" className="bg-yellow-500 text-white px-4 py-2 rounded shadow">
          View Logs
        </Link>
      </div>
    </div>
  );
}
