import { useState, useEffect } from 'react'
import { CaretLeftIcon, UsersIcon, StarIcon } from "@phosphor-icons/react";
import SettingsButton from './SettingsButton'
import FriendModal from '../FriendModal'
import WishlistModal from '../WishlistModal';

export default function Sidebar({ openSidebar, myUsername, setMyUsername, setOpenSidebar, wishlist, setWishlist }) {
    const [activeView, setActiveView] = useState('friends')

    return (
        <div className="flex h-full gap-2 items-center justify-center lg:w-1/4">
            {/* mobile sidebar */}
            <div className={`bg-white left-5 top-5 pl-3 h-[calc(100vh-40px)] transition-all fixed z-40 lg:hidden ${openSidebar ? 'w-75 rounded-md shadow-md border-gray-300 border-1' : 'w-0'}`}>
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
                            className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeView === 'friends' ? 'bg-gray-200' : ''}`}
                            onClick={() => setActiveView('friends')}
                            >
                                <UsersIcon size={20} weight={'fill'}/>
                            </button>
                            <button 
                            className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeView === 'wishlist' ? 'bg-gray-200' : ''}`}
                            onClick={() => setActiveView('wishlist')}>
                                <StarIcon size={20} weight={'fill'}/>
                            </button>
                        </div>
                        <SettingsButton myUsername={myUsername} handleUsername={setMyUsername}/>
                    </div>

                    {activeView === 'friends' && <FriendModal/>}
                    {activeView === 'wishlist' && <WishlistModal wishlist={wishlist} setWishlist={setWishlist}/>}
                </div>
                }
            </div>

                {/* desktop sidebar */}
            <div className={'hidden lg:block h-full transition-all w-full rounded-md shadow-md border-gray-300 border-1'}>
                <div className="flex w-full h-full gap-2">
                    <div className="flex flex-col items-center justify-between h-full w-full py-5">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <span className="font-pacifico text-3xl">n</span>
                            <button 
                                className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeView === 'friends' ? 'bg-gray-200' : ''}`}
                                onClick={() => setActiveView('friends')}
                                >
                                    <UsersIcon size={20} weight={'fill'}/>
                            </button>
                            <button 
                                className={`p-2 hover:bg-gray-200 rounded-md hover:cursor-pointer transiton-all ${activeView === 'wishlist' ? 'bg-gray-200' : ''}`}
                                onClick={() => setActiveView('wishlist')}>
                                    <StarIcon size={20} weight={'fill'}/>
                            </button>
                        </div>
                        <SettingsButton myUsername={myUsername} handleUsername={setMyUsername}/>
                    </div>

                    {activeView === 'friends' && <FriendModal/>}
                    {activeView === 'wishlist' && <WishlistModal wishlist={wishlist} setWishlist={setWishlist}/>}
                </div>
            </div>

            {/* Second sidebar */}
            {/* <div className={`
                fixed lg:hidden left-[93px] top-5 h-[calc(100vh-40px)] z-40
                transition-all bg-white
                ${open ? 'w-64 rounded-md shadow-md border-gray-300 border-1' : 'w-0'}
            `}>
                {open &&
                <div className="flex flex-col h-full w-full p-5">
                    <h2 className="text-xl font-bold mb-4">Content Panel</h2>
                    <p>This opens with the sidebar!</p>
                </div>
                }
            </div> */}

            {/* <div className={`
                hidden lg:block fixed relative left-0 top-0 h-[calc(100vh-40px)] z-40
                transition-all bg-white
                ${open ? 'w-64 rounded-md shadow-md border-gray-300 border-1' : 'w-0'}
            `}>
                {open &&
                <div className="flex flex-col h-full w-full p-5">
                    <h2 className="text-xl font-bold mb-4">Content Panel</h2>
                    <p>This opens with the sidebar!</p>
                </div>
                }
            </div> */}

        </div>
    )}