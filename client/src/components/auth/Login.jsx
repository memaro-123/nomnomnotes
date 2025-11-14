import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from '../../firebase'
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmailTyping = (event) =>{//event handler for typing in the email spot
    setEmail(event.target.value)
    console.log(event.target.value)
  }
  const handlePasswordTyping = (event) =>{//event handler for typing in the password spot
    setPassword(event.target.value)
    console.log(event.target.value)
  }
  const handleSubmit = (event) => {
    event.preventDefault();

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      console.log(user)
      setEmail("")
      setPassword("") 
      alert("we in :fire:")

    })
    .catch((error) => {
      alert(error.message)
    })
  }

  const handleRegistration = (event) =>{ //submit event handler
    event.preventDefault() //this just stops the page from reloading and lets us do our own stuff
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      console.log(user)
      setEmail("")
      setPassword("") 
      alert("SUCESSFUL REGISTRATION")
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage)
    })   
  }

  const handlePasswordReset = async () => {
    if(!email) {
      alert("Please enter your email address first.")
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(error.message);
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google sign-in successful:", user);
      alert(`Welcome, ${user.displayName}!`);
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  }

  return (
    <>
      <h1>NOMNOMNOTES</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            email: <input value ={email } onChange ={handleEmailTyping} type="text"></input>
          </div>
          <div>
            password:  <input value={password} onChange ={handlePasswordTyping} type="password"></input>
          </div>
          <div>
            <input type="submit"></input>
            <button type="button" onClick ={handleRegistration}> Register </button>
          </div>
          <div>
            <button type="button" onClick={handleGoogleSignIn}> Sign in with Google </button>
          </div>
          <div>
            <button type="button" onClick={handlePasswordReset}> Forgot Password? </button>
          </div>
        </form>
      </div>
    </>
    
  )
}