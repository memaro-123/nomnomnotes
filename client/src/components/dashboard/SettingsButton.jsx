import { useState } from 'react'
import { GearIcon} from "@phosphor-icons/react";
import SettingsModal from './SettingsModal';

export default function SettingsButton({ myUsername, handleUsername }) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        console.log('close button clicked')
        setOpen(false)
    }

    return (
        <div>
            <button onClick={() => setOpen(true)} className="flex items-center justify-center hover:cursor-pointer"><GearIcon size={28} weight={"fill"}/></button>
            {open && <SettingsModal handleClose={handleClose} myUsername={myUsername} handleUsername={handleUsername}/>}
        </div>

    )
}