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
        <button className="bg-black text-white hover:cursor-pointer p-2 rounded-md" onClick={logout}>logout</button>
    )
}