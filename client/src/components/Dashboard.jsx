import Edit from './Edit'
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
        {openEdit && <Edit handleOpenEdit={handleOpenEdit}/>}
      </div>
    )
  }