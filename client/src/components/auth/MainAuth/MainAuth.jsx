import { useState } from 'react'
import EmailAndPass from '../EmailAndPass'
import ForgotPassword from '../ForgotPassword'

export default function MainAuth() {
    const [authPage, setAuthPage] = useState('emailAndPassword')

    const handleAuthPage = (newPage) => {
        setAuthPage(newPage)
    }

    return(
        <div style={{display: 'flex'}}>
            {authPage == 'emailAndPassword' && <EmailAndPass handleAuthPage={handleAuthPage}/>}
            {authPage == 'forgotPassword' && <ForgotPassword handleAuthPage={handleAuthPage}/>}
            <div>
                
            </div>
        </div>
    )
}