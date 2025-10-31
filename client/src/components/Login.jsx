import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from '../firebase'

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