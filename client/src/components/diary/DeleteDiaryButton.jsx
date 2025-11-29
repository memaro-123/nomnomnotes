import { useState } from 'react'
import { auth } from '../../firebase'
import { TrashIcon } from "@phosphor-icons/react";
import { toast } from 'react-hot-toast';
import { WarningIcon } from "@phosphor-icons/react";

export default function DeleteDiaryButton({ entry, handleCloseOptions, fetchDiaries }) {
    const [openForm, setOpenForm] = useState(false)

    const handleCloseForm = () => {
        setOpenForm(false)
        // handleCloseOptions()
    }

    const handleDelete = async () => {
        setOpenForm(false);
        const toastId = toast.loading('deleting entry...')
        try {
            const token = await auth.currentUser.getIdToken();

            if (!entry.id) {
                throw new Error("Entry ID is required for editing");
            }

            const deleteResponse = await fetch(`http://localhost:8080/api/diary/delete/${entry.id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
                },
            });

            if (!deleteResponse.ok) {
                throw new Error ('Error deleting diary :/')
            }
            
            toast.success('entry deleted successfully!', { id: toastId })
            handleCloseOptions()
            fetchDiaries()
        } catch (error) {
            console.log(error.message)
            toast.error(error.message || 'Failed to delete entry', { id: toastId })
        }
    };


    return(
        <div className="w-full h-full">
            <button 
            className="border-2 border-red-400 text-red-400 w-full h-full rounded-b-md flex items-center justify-center hover:bg-red-400 
            hover:text-white hover:cursor-pointer transition-all"
            onClick={() => setOpenForm(true)}><TrashIcon size={30} weight={'fill'}/></button>
            {openForm && 
                <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
                    <div className="bg-white border-3 border-red-400 rounded-2xl flex flex-col p-5 gap-5">
                        <div className="text-red-400 font-bold flex flex-col items-center justify-center gap-2 text-xl text-center">
                            <WarningIcon size={50} weight="fill"/>
                            <span>Are you sure you want to delete? <br/> This is permanent.</span>
                        </div>
                        <div className="flex items-center justify-around">
                            <button className="border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white px-4 py-2 rounded-md hover:cursor-pointer" onClick={handleDelete}>delete</button>
                            <button className="border-2 border-black text-black hover:bg-black hover:text-white px-4 py-2 rounded-md hover:cursor-pointer" onClick={handleCloseForm}>cancel</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}