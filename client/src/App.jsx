import { useState } from 'react'
import axios from 'axios'
import './App.css'
//import backendService from "./service/service.js"
import { initializeApp } from 'firebase/app'
import { getFirestore } from "firebase/firestore/lite"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyDZVBvXSIN_Dm0R2soFXuCLkar20-d7UtY",
  authDomain: "nomnomnotes-53.firebaseapp.com",
  projectId: "nomnomnotes-53",
  storageBucket: "nomnomnotes-53.firebasestorage.app",
  messagingSenderId: "623310579553",
  appId: "1:623310579553:web:1c9f0c6dc29b943d3d4720"
}
const app = initializeApp(firebaseConfig);

const auth = getAuth();

function App() {
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
    setEmail("")
    setPassword("") 
    alert("SUCESSFUL REGISTRATION")
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  })   
 
  
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
            <button type="button" onClick ={handleRegistration}>register</button>
          </div>
        </form>
      </div>
    </>
    
  )
}

export default App
