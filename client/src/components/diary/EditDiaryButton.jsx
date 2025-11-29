import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { auth } from '../../firebase';
import DiaryForm from './DiaryForm';

export default function EditDiaryButton({ entry, handleCloseOptions, fetchDiaries}) {
    const [openForm, setOpenForm] = useState(false)

    const handleCloseForm = () => {
        setOpenForm(false)
        handleCloseOptions()
    }

    const handleSubmit = async (entryData) => {
        const saveDiaryEntry = async() => {
            const token = await auth.currentUser.getIdToken();
            entryData.entryId = entry.id
            if (!entryData.entryId) {
                throw new Error("Entry ID is required for editing");
            }

            const editResponse = await fetch("http://localhost:8080/api/diary/edit", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(entryData),
            });

            if (!editResponse.ok) {
                throw new Error ('error writing diary')
            }

            if (fetchDiaries) {
                await fetchDiaries();
            }
        }

        toast.promise(
            saveDiaryEntry(),
            {
              loading: 'editing diary entry...',
              success: () => {
                handleCloseForm()
                return <span>diary entry edited successfully!</span>}
              ,
              error: (err) => <span>{err.message || 'faliled to edit diary entry'}</span>,
            }
        )
    };

    return(
        <div className="w-full h-full">
            <button onClick={() => setOpenForm(true)} className="w-full h-full border-lime-500 text-lime-500 rounded-t-md flex items-center justify-center border-2 
            hover:cursor-pointer hover:bg-lime-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8.82 19.79a1 1 0 0 0-1.42 0l-1.29 1.29l-1.29-1.29a1 1 0 0 0-1.35-.06l-3 2.5a1 1 0 0 0-.13 1.41a1 1 0 0 0 1.41.13l2.3-1.92l1.35 1.36a1 1 0 0 0 1.42 0l1.29-1.3l.79.8a1 1 0 0 0 1.42-1.42ZM23.78 
                    3.36a2.9 2.9 0 0 0-1.38-1.72L19.49.07a.51.51 0 0 0-.68.19l-8 14.46a.5.5 0 0 0 0 .38a.52.52 0 0 0 .24.3l2.48 1.37a.5.5 0 0 0 .24.06a.49.49 0 0 0 .44-.26L21.46 3.4a.9.9 0 0 1 .39.52a.87.87 0 0 1-.07.67l-3.64 6.61a1 1 0 0 0 
                    .39 1.36a1 1 0 0 0 1.36-.39l3.64-6.61a2.9 2.9 0 0 0 .25-2.2M13.1 17.54l-2.48-1.36a.52.52 0 0 0-.51 0a.49.49 0 0 0-.23.44l.1 2.75a.47.47 0 0 0 .26.42a.5.5 0 0 0 .49 0l2.38-1.39a.47.47 0 0 0 .24-.43a.52.52 0 0 0-.25-.43"/>
                </svg>
            </button>
            {openForm && <DiaryForm handleCloseForm={handleCloseForm} entry={entry} handleSubmit={handleSubmit}/>}
        </div>
    )
}