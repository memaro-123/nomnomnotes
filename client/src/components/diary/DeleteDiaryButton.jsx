import { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { TrashIcon } from "@phosphor-icons/react";

export default function DeleteDiaryButton({ entry, handleCloseOptions, fetchDiaries }) {
    const [openForm, setOpenForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCloseForm = () => {
        setOpenForm(false)
        handleCloseOptions()
    }

    const handleDelete = async () => {
        setLoading(true)
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

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false);
            setOpenForm(false);
            handleCloseOptions();
            fetchDiaries()
        }
    };


    if (loading) { // the loading state should prob be handled differently but im just going thru stuff quickly to get it to function
        return(
            <div>Loading...</div>
        )
    }

    return(
        <div className="w-full h-full">
            <button 
            className="border-2 border-red-400 text-red-400 w-full h-full rounded-b-md flex items-center justify-center hover:bg-red-400 
            hover:text-white hover:cursor-pointer transition-all"
            onClick={() => setOpenForm(true)}><TrashIcon size={30} weight={'fill'}/></button>
            {openForm && 
                <div>
                    Are you sure you want to delete? This is permanent.
                    <button onClick={handleDelete}>Delete</button>
                    <button onClick={handleCloseForm}>Cancel</button>
                </div>
            }
            {error && <div>{error.message}</div>}
        </div>
    )
}