import { useState } from 'react'
import ForgotPassword from './ForgotPassword'
import EmailAndPass from './EmailAndPass'
// import styles from './MainAuth.module.css'

export default function MainAuth() {
    const [authPage, setAuthPage] = useState('emailAndPassword')

    const handleAuthPage = (newPage) => {
        setAuthPage(newPage)
    }

    return(
        <div className="flex items-center justify-center h-screen w-screen">

            <div className="flex flex-1">
                {authPage == 'emailAndPassword' && <EmailAndPass handleAuthPage={handleAuthPage}/>}
                {authPage == 'forgotPassword' && <ForgotPassword handleAuthPage={handleAuthPage}/>}
            </div>

            <div className="hidden lg:flex gap-5 shrink-0 flex-1 items-center justify-start lg:pr-45">
                <div className="flex flex-col gap-5 items-center justify-center shrink-0">
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="pudding.jpg" alt="boba" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="boba.jpg" alt="burger and fries" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="koreanfood.jpg" alt="orange chicken in a bowl" />
                </div>
                <div className="flex flex-col gap-5 items-center justify-center shrink-0">
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="macncheese.jpg" alt="boba" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="mozarellasticks.jpg" alt="burger and fries" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="dumplings.jpg" alt="orange chicken in a bowl" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="macncheese.jpg" alt="orange chicken in a bowl" />
                </div>
                <div className="flex flex-col gap-5 items-center justify-center shrink-0">
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="pancakes.jpg" alt="boba" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="burger.jpg" alt="burger and fries" />
                    <img className="w-[250px] h-auto rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]" src="orangechicken.jpg" alt="orange chicken in a bowl" />
                </div>
            </div>
        </div>
    )
}