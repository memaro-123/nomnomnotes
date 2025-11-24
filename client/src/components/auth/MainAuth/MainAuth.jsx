import { useState } from 'react'
import EmailAndPass from '../EmailAndPass/EmailAndPass'
import ForgotPassword from '../ForgotPassword'
import styles from './MainAuth.module.css'

export default function MainAuth() {
    const [authPage, setAuthPage] = useState('emailAndPassword')

    const handleAuthPage = (newPage) => {
        setAuthPage(newPage)
    }

    return(
        <div className={styles.container}>
            <div className={styles.authWrapper}>
                {authPage == 'emailAndPassword' && <EmailAndPass handleAuthPage={handleAuthPage}/>}
                {authPage == 'forgotPassword' && <ForgotPassword handleAuthPage={handleAuthPage}/>}
            </div>
            <div className={styles.imgWrapper}>
                <div className={styles.imgContainer}>
                    <img src="pudding.jpg" alt="boba" className={styles.imgCard}/>
                    <img src="boba.jpg" alt="burger and fries" className={styles.imgCard}/>
                    <img src="koreanfood.jpg" alt="orange chicken in a bowl" className={styles.imgCard}/>
                </div>
                <div className={styles.imgContainer}>
                    <img src="pancakes.jpg" alt="boba" className={styles.imgCard}/>
                    <img src="burger.jpg" alt="burger and fries" className={styles.imgCard}/>
                    <img src="orangechicken.jpg" alt="orange chicken in a bowl" className={styles.imgCard}/>
                </div>
                <div className={styles.imgContainer}>
                    <img src="macncheese.jpg" alt="boba" className={styles.imgCard}/>
                    <img src="mozarellasticks.jpg" alt="burger and fries" className={styles.imgCard}/>
                    <img src="dumplings.jpg" alt="orange chicken in a bowl" className={styles.imgCard}/>
                    <img src="macncheese.jpg" alt="orange chicken in a bowl" className={styles.imgCard}/>
                </div>
            </div>
        </div>
    )
}