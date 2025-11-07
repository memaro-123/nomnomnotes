import { useState, useEffect } from 'react'
import DiaryForm from './DiaryForm'
import { auth } from '../firebase'

export default function EditDiaryButton({ entry, handleCloseOptions }) {
    const [openForm, setOpenForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCloseForm = () => {
        setOpenForm(false)
        handleCloseOptions()
    }

    const handleSubmit = async (entryData) => {
        setLoading(true)
        try {
            const token = await auth.currentUser.getIdToken();

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
                throw new Error ('Error writing diary :/')
            }

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false);
            setOpenForm(false);
            handleCloseOptions();
        }
    };

    useEffect(() => {
        console.log({openForm})
    }, [openForm])

    return(
        <div>
            <button onClick={() => setOpenForm(true)}>edit</button>
            {openForm && <DiaryForm handleCloseForm={handleCloseForm} entry={entry} loading={loading} error={error} handleSubmit={handleSubmit}/>}
        </div>
    )
}