import { SealCheckIcon } from "@phosphor-icons/react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../../firebase';
import { toast } from 'react-hot-toast';

export default function ForgotPassword({ handleAuthPage }) {
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [success, setSuccess] = useState(false)

    const checkValid = () => {
        setEmailError('')
        let valid =  true

        if (email === '') {
            setEmailError('email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('invalid email format');
            valid = false;
        }
    
        return valid;
    }


    const handlePasswordReset = async () => {
        if(!checkValid()) {
            return;
        }

        const toastId = toast.loading('sending email...')

        try {
            await sendPasswordResetEmail(auth, email);
            setEmailError('')
            setSuccess(true)
            toast.dismiss(toastId);
        } catch (error) {
            console.log(error)
            toast.error("an error occurred. please try again.", {
                id: toastId,
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col items-start justify-center gap-5">

            {/* header */}
            <div className="flex flex-col gap-1 w-full">
                {success ? (
                    <div className="flex gap-2 items-center justify-center text-lime-500 text-5xl font-bold">
                        <SealCheckIcon size={35} weight={'fill'}/>
                        <span>reset link sent</span>
                    </div> 
                ):( 
                    <div className="text-5xl font-bold">
                        <span >forgot your login?</span>
                    </div>
                )}
                <span className="text-xl">{success ? 'check your inbox for the reset link' : "let's whisk up a new password"}</span>
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

            {/* buttons */}
            <div className="flex flex-col w-full max-w-[375px]">
                <div className="flex justify-between items-center">
                    <button 
                    className="text-gray-400 hover:underline hover:text-black decoration-dotted decoration-2 underline-offset-2 hover:cursor-pointer transition-all"
                    onClick={() => handleAuthPage('emailAndPassword')} >back to login</button>
                    <button 
                    className="hover:cursor-pointer bg-black text-white px-4 py-1 rounded-md"
                    onClick={handlePasswordReset} >{success ? 'resend' : 'send'}</button>
                </div>
            </div>
        </div>
        </div>
    )
}