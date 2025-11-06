import DiaryForm from './DiaryForm'
import EntryList from './EntryList'
import { useState, useEffect } from 'react'

export default function Dashboard() {
    const [openEdit, setOpenEdit] = useState(false)

    const handleOpenEdit = () => {
        setOpenEdit(false)
    }

    useEffect(() => {
        console.log({openEdit})
    }, [openEdit])


    return (
      <div>
        <button onClick={() => setOpenEdit(prev => !prev)}>add diary</button>
        {openEdit && <DiaryForm handleOpenEdit={handleOpenEdit}/>}
        <EntryList/>
      </div>
    )
  }