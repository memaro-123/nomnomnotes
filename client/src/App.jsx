import Dashboard from './components/diary/Dashboard'
import './styles/App.css'

export default function App() {
  return (
    // this is where you can control which pages are shown
    // create a user context, import it, and then u can conditionally render pages based on
    // whehter there is a user or not
    // <Login/>
    <Dashboard/>
  )
}