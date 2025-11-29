import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import Logout from './auth/logoutButton';
import { GearIcon } from "@phosphor-icons/react";

export default function SettingsModal() {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState({ username: '', permissions: {} });
  const [newPassword, setNewPassword] = useState('');
  const [open, setOpen] = useState(false)

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
    <div>
      <button onClick={() => setOpen(true)} className="flex items-center justify-center"><GearIcon size={28} weight={"fill"}/></button>
      {open && <div>
        <h2>Settings</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
        <p><strong>Username:</strong> {userMeta.username || 'N/A'}</p>
        <p><strong>Permissions:</strong> {userMeta.permissions ? JSON.stringify(userMeta.permissions) : 'N/A'}</p>

        <div>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword}>Change Password</button>
        </div>

        <div>
          <Logout />
        </div>

        <div>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>}
    </div>
  );
}