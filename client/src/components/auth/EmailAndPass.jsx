import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { auth } from '../../firebase';
import { toast } from 'react-hot-toast';


export default function EmailAndPassword({ handleAuthPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [authMode, setAuthMode] = useState('signUp')
    const [passwordVisibility, setPasswordVisibility] = useState('password')

    const checkValid = () => {
        setEmailError('')
        setPasswordError('')
        let valid =  true

        if (email === '') {
            setEmailError('email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('invalid email format');
            valid = false;
        }
    
        if (password === '') {
            setPasswordError('password is required');
            valid = false;
        } else if (password.length < 6 && authMode === 'signUp') {
            setPasswordError('password must be at least 6 characters');
            valid = false;
        }
        return valid;
    }

    const handleLogin = () => {
        if (!checkValid()) {
            return;
        }

        const toastId = toast.loading('logging in...')

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user
            console.log(user)
            setEmail("")
            setPassword("") 
            toast.dismiss(toastId);
          })
        .catch((error) => {
            switch (error.code) {
                case 'auth/invalid-credential':
                    console.log(error.message)
                    toast.error("invalid email or password", {
                        id: toastId,
                    });
                    break;
                default:
                    toast.error("an error occurred. please try again.", {
                        id: toastId,
                    });
                    console.log(error.message)
            }
        })
    }
    
    const handleSignUp = async () => {
        if (!checkValid()) {
            return;
        }
    
        const toastId = toast.loading('signing up...');
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            const token = await user.getIdToken();
            const response = await fetch("http://localhost:8080/api/diary/initfriend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ myID: user.uid }),
            });
    
            if (!response.ok) {
                console.error("Failed to init user in DB");
                await auth.signOut();
                throw new Error('account creation failed. please try again.');
            }
    
            console.log("User initialized in DB");
            setEmail("");
            setPassword("");
            toast.success("account created successfully!", { id: toastId });
    
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-credential":
                    console.log(error.message);
                    toast.error("invalid email or password", { id: toastId });
                    break;
                case "auth/email-already-in-use":
                    console.log(error.message);
                    toast.error("this email is already being used", { id: toastId });
                    break;
                default:
                    console.log(error.message);
                    toast.error(error.message || "an error occurred. please try again.", { id: toastId });
            }
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        const toastId = toast.loading('signing in with Google...');
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            const token = await user.getIdToken();
            const response = await fetch("http://localhost:8080/api/diary/initfriend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ myID: user.uid }),
            });
    
            if (!response.ok) {
                console.error('Failed to init Google user in DB');
                await auth.signOut();
                toast.error('account creation failed. please try again.', { id: toastId });
            } else {
                console.log('Google user init success');
                toast.success('signed in successfully!', { id: toastId });
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message || "an error occurred. please try again.", { id: toastId });
        }
    }

    const handleSwitchAuthMode = (authMode) => {
        setEmailError('')
        setPasswordError('')
        setAuthMode(authMode)
    }

    return(
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-start justify-center gap-3">

                {/* header + catpion */}
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-5xl font-bold">nomnom notes</span>
                    <div className="text-xl">
                        <button className="text-gray-400 hover:underline hover:text-black decoration-dotted decoration-2 underline-offset-2 hover:cursor-pointer transition-all" 
                        onClick={()=> handleSwitchAuthMode('login')}>login</button> 
                        <span> or </span> 
                        <button className="text-gray-400 hover:underline hover:text-black decoration-dotted decoration-2 underline-offset-2 hover:cursor-pointer transition-all" onClick={()=> handleSwitchAuthMode('signUp')}>sign up</button>
                        <span> to start your food journal</span>
                    </div>
                </div>

                {/* email input */}
                <div className="flex flex-col w-full max-w-[375px]">
                    <div className="flex justify-between items-center">
                        <div><span>email</span><span className="text-red-500">*</span></div>
                        {emailError && <span className="text-red-500">{emailError}</span>}
                    </div>
                    <div className="border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
                        <input 
                        className="focus:outline-none w-full"
                        value={email} 
                        onChange ={e => setEmail(e.target.value)} 
                        type="text" placeholder={'enter your email'}/>
                    </div>
                </div>


                {/* password input */}
                <div className="flex flex-col w-full max-w-[375px]">
                    <div className="flex justify-between items-center">
                        <div><span>password</span><span className="text-red-500">*</span></div>
                        {passwordError && <span className="text-red-500">{passwordError}</span>}
                    </div>
                    <div className="border-1 border-solid rounded-md w-ful p-2 focus-within:shadow-lg transition-shadow flex items-center justify-between overflow-hidden">
                        <input 
                        className="focus:outline-none flex-1 min-w-0 w-full"
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        type={passwordVisibility} placeholder={'enter your password'}/>
                        <div className="flex-shrink-0">
                            {passwordVisibility === 'password' && <EyeIcon size={16} onClick={() => setPasswordVisibility('text')}/>}
                            {passwordVisibility === 'text' && <EyeSlashIcon size={16} onClick={() => setPasswordVisibility('password')}/>}
                        </div>
                    </div>
                </div>

                {/* forgot password + authbutton */}
                <div className="flex flex-col w-full max-w-[375px]">
                    <div className="flex items-center justify-between ">
                        <button className="text-gray-400 hover:underline hover:text-black decoration-dotted decoration-2 underline-offset-2 hover:cursor-pointer" onClick={() => handleAuthPage('forgotPassword')} >forgot password</button>

                        {authMode === 'signUp' && 
                            <button 
                            className="bg-black text-white px-4 py-1 rounded-md hover:cursor-pointer"
                            onClick={handleSignUp}>sign up</button>
                        }

                        {authMode === 'login' && 
                            <button 
                            className="bg-black text-white px-4 py-1 rounded-md hover:cursor-pointer"
                            onClick={handleLogin} >login</button>
                        }
                    </div>
                </div>

                {/* or divider */}
                <div className="flex items-center w-full gap-3 my-6">
                    <hr className="flex-1 border-t border-gray-300" />
                    <span className="text-sm text-gray-500 whitespace-nowrap">or</span>
                    <hr className="flex-1 border-t border-gray-300" />
                </div>

                {/* google button */}
                <div className="flex items-center justify-center w-full">
                    <button 
                    className="flex gap-2 items-center justify-center hover:cursor-pointer bg-black text-white px-4 py-1 rounded-md"
                    onClick={handleGoogleSignIn}><FcGoogle size={24}/>continue with google</button>
                </div>
            </div>
        </div>
    )
}