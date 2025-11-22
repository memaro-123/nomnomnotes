import { useState } from 'react'
import { auth } from '../../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

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
        <div>
            <h1>{success ? 'reset link sent' : 'forgot your login?'}</h1>
            <span>{success ? 'check your inbox for the reset link' : "let's whisk up a new password"}</span>
            {emailError && <span>{emailError}</span>}
            email: <input value ={email} onChange={e => setEmail(e.target.value)} type="text"></input>
            <button onClick={handlePasswordReset}>{success ? 'resend' : 'send'}</button>
            {error && <span>{error}</span>}
            <button onClick={() => handleAuthPage('emailAndPassword')}>back to login</button>
        </div>
    )
}