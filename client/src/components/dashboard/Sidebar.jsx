import { useState, useEffect } from 'react'
import { CaretLeftIcon, UsersIcon, StarIcon, GearIcon } from "@phosphor-icons/react";
import FriendModal from '../FriendModal'
import WishlistModal from '../WishlistModal';
import SettingsModal from './SettingsModal';

export default function Sidebar({ openSidebar, myUsername, setMyUsername, 
    setOpenSidebar, wishlist, setWishlist, setActiveView}) {
    const [activeViewModal, setActiveViewModal] = useState('friends')
    const [openSettings, setOpenSettings] = useState(false)

    return (
        <div className="flex h-full gap-2 items-center justify-center lg:w-2/7">
            {/* mobile sidebar */}
            <div
            className={`
                fixed left-5 top-5 z-40
                h-[calc(100vh-40px)] bg-white pl-3
                w-[300px] rounded-md shadow-md border border-gray-300
                lg:hidden
                transform transition-transform duration-300 ease-in-out
                ${openSidebar ? 'translate-x-0 pointer-events-auto opacity-100' : '-translate-x-full pointer-events-none opacity-0'}
            `}
            aria-hidden={!openSidebar}
            >
                {openSidebar &&
                <div className="flex w-full h-full gap-2">
                    <div className="flex flex-col items-center justify-between h-full py-5">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <span className="font-pacifico text-3xl">n</span>
                            <button 
                                className="p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transition-all"
                                onClick={() => setOpenSidebar(false)}>
                                <CaretLeftIcon size={20} weight={'bold'}/>
                            </button>
                            <button 
                            className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeViewModal === 'friends' ? 'bg-gray-200' : ''}`}
                            onClick={() => setActiveViewModal('friends')}
                            >
                                <UsersIcon size={20} weight={'fill'}/>
                            </button>
                            <button 
                            className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeViewModal === 'wishlist' ? 'bg-gray-200' : ''}`}
                            onClick={() => setActiveViewModal('wishlist')}>
                                <StarIcon size={20} weight={'fill'}/>
                            </button>
                        </div>
                        <button onClick={() => setOpenSettings(true)} className="flex p-2 items-center justify-center hover:bg-gray-200 rounded-md hover:cursor-pointer">
                        <GearIcon size={20} weight={"fill"}/></button>
                    </div>

                    {activeViewModal === 'friends' && <FriendModal/>}
                    {activeViewModal === 'wishlist' && <WishlistModal wishlist={wishlist} setWishlist={setWishlist} setActiveView={setActiveView}/>}
                </div>
                }
            </div>

                {/* desktop sidebar */}
            <div className={'hidden lg:block h-full transition-all w-full rounded-md shadow-md border-gray-300 border-1'}>
                <div className="flex w-full h-full gap-2">
                    <div className="flex flex-col items-center justify-between h-full w-15 py-5 shrink-0">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <span className="font-pacifico text-3xl">n</span>
                            <button 
                                className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeViewModal === 'friends' ? 'bg-gray-200' : ''}`}
                                onClick={() => setActiveViewModal('friends')}
                                >
                                    <UsersIcon size={20} weight={'fill'}/>
                            </button>
                            <button 
                                className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeViewModal === 'wishlist' ? 'bg-gray-200' : ''}`}
                                onClick={() => setActiveViewModal('wishlist')}>
                                    <StarIcon size={20} weight={'fill'}/>
                            </button>
                        </div>
                        <button onClick={() => setOpenSettings(true)} className="flex p-2 items-center justify-center hover:bg-gray-200 rounded-md hover:cursor-pointer">
                        <GearIcon size={20} weight={"fill"}/></button>
                    </div>

                    {activeViewModal === 'friends' && <FriendModal/>}
                    {activeViewModal === 'wishlist' && <WishlistModal wishlist={wishlist} setWishlist={setWishlist} setActiveView={setActiveView}/>}
                </div>
            </div>

            {openSettings && <SettingsModal handleClose={setOpenSettings} myUsername={myUsername} handleUsername={setMyUsername}/>}
        </div>
    )}