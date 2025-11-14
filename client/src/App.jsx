import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/auth/Login'
import Dashboard from './components/Dashboard'
import './styles/App.css'

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
    // this is where you can control which pages are shown
    // create a user context, import it, and then u can conditionally render pages based on
    // whehter there is a user or not    

    <>
      {user ? <Dashboard /> : <Login />}
    </>
  );
}