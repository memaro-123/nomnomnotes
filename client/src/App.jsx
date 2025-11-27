import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import MainAuth from './components/auth/MainAuth/MainAuth';
import Dashboard from './components/Dashboard';
import { auth } from './firebase';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (  
    <>
      <Toaster />
      {user ? <Dashboard /> : <MainAuth />}
    </>
  );
}