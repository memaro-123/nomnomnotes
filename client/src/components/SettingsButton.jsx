import { useState } from 'react'
import { GearIcon} from "@phosphor-icons/react";
import SettingsModal from './SettingsModal';

export default function SettingsButton() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(true)} className="flex items-center justify-center"><GearIcon size={28} weight={"fill"}/></button>
            {open && <SettingsModal handleClose={() => setOpen(false)} />}
        </div>

    )
}