import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth'
import { useState } from 'react'
import { auth } from '../../../firebase'
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { FcGoogle } from "react-icons/fc";
import styles from './EmailAndPass.module.css'


export default function EmailAndPassword({ handleAuthPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [error, setError] = useState("")
    const [authMode, setAuthMode] = useState('signUp')
    const [passwordVisibility, setPasswordVisibility] = useState('password')
    const [loading, setLoading] = useState(false)

    const checkValid = () => {
        setEmailError('')
        setPasswordError('')
        setError('')
        let valid =  true

        if (email === '') {
            setEmailError('Email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format');
            valid = false;
        }
    
        if (password === '') {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6 && authMode === 'signUp') {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }
    
        return valid;
    }

    const handleLogin = () => {
        if (!checkValid()) {
            return;
        }

        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user
            console.log(user)
            setEmail("")
            setPassword("") 
          })
          .catch((error) => {
            switch (error.code) {
                case 'auth/invalid-credential':
                    setError('Incorrect email or password.')
                    break;
                default:
                    console.log(error.message)
                    setError('An unexpected error occured. Please try again.')
            }
          })
          .finally(() => {
            setLoading(false);
          });
    }
    
    
    const handleSignUp = () => {
        if (!checkValid()) {
            return;
        }
    
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user
          console.log(user)
          setEmail("")
          setPassword("") 
        })
        .catch((error) => {
            switch (error.code) {
                case 'auth/invalid-credential':
                    setError('Incorrect email or password.')
                    break;
                case 'auth/email-already-in-use':
                    setError('Email already in use.')
                    break;
                default:
                    console.log(error.message)
                    setError('An unexpected error occured. Please try again.')
            }
        })
        .finally(() => {
            setLoading(false);
        });
    }


    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          console.log("Google sign-in successful:", user);
        } catch (error) {
          setError(error.message)
        }
    }

    const handleSwitchAuthMode = (authMode) => {
        setEmailError('')
        setPasswordError('')
        setError('')
        setAuthMode(authMode)
    }

    if (loading) {
        return (
            <div>Loading...</div>
        );
    }

    return(
        <div className={styles.container}>
            {error && <span className={styles.error}>{error}</span>}

            <span className={styles.title}>nomnom notes</span>

            <div className={styles.caption}> <button onClick={()=> handleSwitchAuthMode('login')}>login</button> or <button onClick={()=> handleSwitchAuthMode('signUp')}>sign up</button> to start your food journal</div>


            {/* email input */}
            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <span>email</span>
                    {emailError && <span className={styles.error}>{emailError}</span>}
                </div>
                <div className={styles.inputContainer}>
                    <input value={email} onChange ={e => setEmail(e.target.value)} type="text" placeholder={'enter your password'}/>
                </div>
            </div>


            {/* password input */}
            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <span>password</span>
                    {passwordError && <span className={styles.error}>{passwordError}</span>}
                </div>
                <div className={styles.inputContainer}>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={passwordVisibility} placeholder={'enter your password'}/>
                    {passwordVisibility === 'password' && <EyeIcon size={15} onClick={() => setPasswordVisibility('text')}/>}
                    {passwordVisibility === 'text' && <EyeSlashIcon size={15} onClick={() => setPasswordVisibility('password')}/>}
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <button onClick={() => handleAuthPage('forgotPassword')} className={styles.directoryButton}>forgot password</button>

                {authMode === 'signUp' && 
                    <button onClick={handleSignUp} className={styles.authButton}>sign up</button>
                }

                {authMode === 'login' && 
                    <button onClick={handleLogin} className={styles.authButton}>login</button>
                }
            </div>

            <div className={styles.divider}><hr/><span>or login with</span><hr/></div>
            <button onClick={handleGoogleSignIn} className={styles.authButton}><FcGoogle/>google</button>
        </div>
    )
}