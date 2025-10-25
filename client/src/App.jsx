import { useState } from 'react'
import axios from 'axios'
import './App.css'
import backendService from "./service/service.js"

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleUsernameTyping = (event) =>{//event handler for typing in the username spot
    setUsername(event.target.value)
    console.log(event.target.value)
  }
  const handlePasswordTyping = (event) =>{//event handler for typing in the password spot
    setPassword(event.target.value)
    console.log(event.target.value)
  }
  const handleSubmit = (event) =>{ //submit event handler
    event.preventDefault() //this just stops the page from reloading and lets us do our own stuff
    backendService.login({username,password})
    .then((response)=>{
      alert(`your login is ${response.data}`)
      setUsername("")
      setPassword("")
    
    }
    
  )
}
  const handleRegistration = (event) => {//event handler for the registration button
    backendService.register({username,password})
    .then((response)=>{
      alert(`your login is ${response.data}`)
      setUsername("")
      setPassword("")
    })
  }
    

  return (
    <>
      <h1>NOMNOMNOTES</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            username: <input value ={username } onChange ={handleUsernameTyping} type="text"></input>
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
