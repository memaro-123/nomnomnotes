import { useState, useEffect } from 'react'
import DiaryForm from './DiaryForm'
import { auth } from '../../firebase'
import Validate from './InputValidation'

export default function AddDiaryButton({ fetchDiaries }) {
    const [openForm, setOpenForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCloseForm = () => {
        setOpenForm(false)
    }

    const handleSubmit = async (entryData) => {
        if(!Validate(entryData)){
            return
        }
        else{
            setLoading(true)
        try {
            const token = await auth.currentUser.getIdToken();

            const writeResponse = await fetch("http://localhost:8080/api/diary/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(entryData),
            });

            if (!writeResponse.ok) {
                throw new Error ('Error writing diary :/')
            }

            const writeData = await writeResponse.json()
            console.log(writeData)
            fetchDiaries()
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false);
            setOpenForm(false)
        }
        }
        
        
    };

    useEffect(() => {
        console.log({openForm})
    }, [openForm])

    return(
        <div>
            <button onClick={() => setOpenForm(true)}>add diary</button>
            {openForm && <DiaryForm handleCloseForm={handleCloseForm} entry={{}} loading={loading} error={error} handleSubmit={handleSubmit}/>}
        </div>
    )
}


// { 
//     name, 
//     selectedCuisines, 
//     city, 
//     state, 
//     selectedPrices,
//     selectedLabels,
//     images,
//     notes,
//     taste,
//     service, 
//     value,
// }