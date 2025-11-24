import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import Logout from './auth/LogoutButton';

export default function SettingsModal({ onClose }) {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState({ username: '', permissions: {} });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  // Fetches the SQLite metadata
  useEffect(() => {
    const fetchUserMeta = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('http://localhost:8080/api/user/info', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user metadata');
        const data = await res.json();
        const parsedPermissions = typeof data.permissions === 'string'
          ? JSON.parse(data.permissions)
          : data.permissions;
        setUserMeta({ username: data.username, permissions: parsedPermissions });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserMeta();
  }, [user]);

  const handleChangePassword = async () => {
    if (!newPassword) return alert('Enter a new password');
    try {
      await auth.currentUser.updatePassword(newPassword);
      alert('Password updated successfully');
      setNewPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%'
      }}>
        <h2>Settings</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
        <p><strong>Username:</strong> {userMeta.username || 'N/A'}</p>
        <p><strong>Permissions:</strong> {userMeta.permissions ? JSON.stringify(userMeta.permissions) : 'N/A'}</p>

        <div style={{ marginTop: '10px' }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword}>Change Password</button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <Logout />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}