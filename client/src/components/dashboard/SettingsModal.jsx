import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import Logout from '../auth/logoutButton';
import { GearIcon, XIcon, EyeIcon, EyeSlashIcon} from "@phosphor-icons/react";
import { toast } from 'react-hot-toast';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider} from 'firebase/auth';


export default function SettingsModal({ handleClose }) {
  const [user, setUser] = useState(null);
  const [signInMeth, setSignInMeth] = useState(null)
  const [permissions, setPermissions] = useState({});
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('')
  const [passwordVisibility, setPasswordVisibility] = useState('password')
  const [newPasswordVisibility, setNewPasswordVisibility] = useState('password')

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setSignInMeth(currentUser.providerData[0]?.providerId);
    }
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

        setPermissions(parsedPermissions)
        setName(data.username || 'N/A');
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserMeta();
  }, [user]);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
      toast.success('copied uid')
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('error copying uid')
    }
  };

  const handleChangePassword = async () => {
    const toastId = toast.loading('updating password...')
    try {
      if (!password || !newPassword){
        throw new Error('please enter both passwords')
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(auth.currentUser, newPassword);

      toast.success('updated password successfully', {id: toastId})
      setPassword('')
      setNewPassword('')
    } catch (error) {
      console.log(error.message)
      switch (error.code) {
        case 'auth/invalid-credential':
            toast.error("invalid password", {
                id: toastId,
            });
            break;
        default:
            toast.error("an error occurred. please try again.", {
                id: toastId,
            });
      }
    }
  }

  useEffect(() => {setName('text name cuz i dont think the metadata thing is working')}, [])

  if (!user) return null;

  return (
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
        <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-start justify-center">
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-start gap-2">
              <GearIcon size={45} weight={"fill"}/>
              <span className="font-pacifico text-3xl">settings</span>
            </div>
            <button onClick={handleClose}><XIcon/></button>
          </div>

          <span>email: {user.email || ''}</span>
          <button 
            onClick={handleCopyUid}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy UID"
          >
              uid: {user.uid}
          </button>
          
          <div className="w-full">
            <span>name</span>
            <div className="flex gap-2">
              <div className="border-1 border-solid rounded-md flex-1 p-2 focus-within:shadow-lg transition-shadow flex items-center justify-between overflow-hidden">
                  <input 
                  className="focus:outline-none flex-1 min-w-0 w-full"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  type={'text'} placeholder={'enter your name'}/>
              </div>
              <button className="bg-black text-white hover:cursor-pointer px-2 py-1 text-sm rounded-md">change name</button>
            </div>
          </div>

          <span>permissions: {permissions.length > 0 && permissions ? JSON.stringify(permissions) : 'N/A'}</span>

          {signInMeth === 'password' && 
          <div className="flex flex-col justify-center gap-2">
            <span>password reset</span>
            <div className="border-1 border-solid rounded-md w-ful p-2 focus-within:shadow-lg transition-shadow flex items-center justify-between overflow-hidden">
                <input 
                className="focus:outline-none flex-1 min-w-0 w-full"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type={passwordVisibility} placeholder={'enter current password'}/>
                <div className="flex-shrink-0">
                    {passwordVisibility === 'password' && <EyeIcon size={16} onClick={() => setPasswordVisibility('text')}/>}
                    {passwordVisibility === 'text' && <EyeSlashIcon size={16} onClick={() => setPasswordVisibility('password')}/>}
                </div>
            </div>

            <div className="flex gap-2">
              <div className="border-1 border-solid rounded-md w-ful p-2 focus-within:shadow-lg transition-shadow flex items-center justify-between overflow-hidden">
                  <input 
                  className="focus:outline-none flex-1 min-w-0 w-full"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  type={newPasswordVisibility} placeholder={'enter new password'}/>
                  <div className="flex-shrink-0">
                      {newPasswordVisibility === 'password' && <EyeIcon size={16} onClick={() => setNewPasswordVisibility('text')}/>}
                      {newPasswordVisibility === 'text' && <EyeSlashIcon size={16} onClick={() => setNewPasswordVisibility('password')}/>}
                  </div>
              </div>

              <button className="bg-black text-white hover:cursor-pointer px-2 py-1 text-sm rounded-md" onClick={handleChangePassword}>change password</button>
            </div>
          </div>
          }
        
          <Logout />
        </div>
      </div>
  );
}