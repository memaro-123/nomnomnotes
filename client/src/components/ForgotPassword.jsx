import { SealCheckIcon } from "@phosphor-icons/react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../firebase';

export default function ForgotPassword({ handleAuthPage }) {
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const checkValid = () => {
        setEmailError('')
        let valid =  true

        if (email === '') {
            setEmailError('Email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format');
            valid = false;
        }
    
        return valid;
    }


    const handlePasswordReset = async () => {
        if(!checkValid()) {
            return;
        }

        try {
            setLoading(true)
            await sendPasswordResetEmail(auth, email);
            setError('')
            setEmailError('')
            setSuccess(true)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div>Loading...</div>
        );
    }

    return (
        <div >
            {error && <span >{error}</span>}
            {success ? (
                <div >
                    <SealCheckIcon size={35} weight='fill'/>
                    <span>reset link sent</span>
                </div> 
            ):( 
                <div>
                    <span >forgot your login?</span>
                </div>
            )}
            <span >{success ? 'check your inbox for the reset link' : "let's whisk up a new password"}</span>
            
            {/* email input */}
            <div >
                <div >
                    <span>email</span>
                    {emailError && <span >{emailError}</span>}
                </div>
                <div >
                    <input value={email} onChange ={e => setEmail(e.target.value)} type="text" placeholder={'enter your password'}/>
                </div>
            </div>

            <div >
                <button onClick={() => handleAuthPage('emailAndPassword')} >back to login</button>
                <button onClick={handlePasswordReset} >{success ? 'resend' : 'send'}</button>
            </div>
        </div>
    )
}