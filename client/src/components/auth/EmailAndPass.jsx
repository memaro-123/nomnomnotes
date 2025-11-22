import { auth } from '../../firebase'
import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    GoogleAuthProvider, signInWithPopup } from 'firebase/auth'


export default function EmailAndPassword({ handleAuthPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [error, setError] = useState("")
    const [authMode, setAuthMode] = useState('signUp')
    const [passwordVisibility, setPasswordVisibility] = useState('password')

    const checkValid = () => {
        setEmailError('')
        setPasswordError('')
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
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            valid = false;
        }
    
        return valid;
    }

    const handleLogin = () => {
        if (!checkValid()) {
            return;
        }
    
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
    }
    
    
    const handleSignUp = () => {
        if (!checkValid()) {
            return;
        }
    
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user
          console.log(user)
          setEmail("")
          setPassword("") 
        })
        .catch((error) => {
          setError(error.message)
        })   
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


    return(
        <div>
            <h1>nomnom notes</h1>
                <div>
                    {emailError && <span>{emailError}</span>}
                    email: <input value ={email} onChange ={e => setEmail(e.target.value)} type="text"/>
                    {passwordError && <span>{passwordError}</span>}
                    password:  <input value={password} onChange={e => setPassword(e.target.value)} type={passwordVisibility}/>
                    {passwordVisibility === 'password' && <button onClick={() => setPasswordVisibility('text')}>show</button>}
                    {passwordVisibility === 'text' && <button onClick={() => setPasswordVisibility('password')}>hide</button>}
                </div>
                {authMode === 'signUp' && 
                <div>
                    <button onClick={handleSignUp}>sign up</button>
                    Already have an account? <button onClick={() => setAuthMode('login')}>Login</button>
                </div>}
                {authMode === 'login' && 
                <div>
                    <button onClick={handleLogin}>login</button>
                    don't have an account yet? <button onClick={() => setAuthMode('signUp')}>sign up</button>
                </div>}
                <button onClick={() => handleAuthPage('forgotPassword')}>forgot password</button>
                {error && <span>{error}</span>}
                --------------- or login with -------------------
                <button onClick={handleGoogleSignIn}>google</button>
        </div>
    )
}