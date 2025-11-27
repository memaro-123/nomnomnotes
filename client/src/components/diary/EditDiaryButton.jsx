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

    useEffect(() => {
        console.log({openForm})
    }, [openForm])

    return(
        <div>
            <button onClick={() => setOpenForm(true)}>edit</button>
            {openForm && <DiaryForm handleCloseForm={handleCloseForm} entry={entry} handleSubmit={handleSubmit}/>}
        </div>
    )
}