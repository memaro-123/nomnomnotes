import { auth } from '../../firebase'
export default function Logout(){
    const logout =async  () =>{
        try {
            await auth.signOut()
  }         catch (error) {
            console.error('signout error:', error);
  }
    }
    return(
        <button onClick={logout}>Logout</button>
    )
}