import { useState, useEffect } from "react";
import DiaryForm from "./DiaryForm/DiaryForm";
import { auth } from "../../firebase";
import { toast } from 'react-hot-toast';

export default function AddDiaryButton({ fetchDiaries }) {
  const [openForm, setOpenForm] = useState(false);

  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleSubmit = async (entryData) => {
    const saveDiaryEntry = async () => {
      const token = await auth.currentUser.getIdToken();
      const writeResponse = await fetch(
        "http://localhost:8080/api/diary/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(entryData),
        }
      )
      if (!writeResponse.ok) {
        throw new Error("error writing diary");
      }

      const writeData = await writeResponse.json();
      console.log(writeData);
      fetchDiaries();
      return writeData;
    }
    
    toast.promise(
      saveDiaryEntry(),
      {
        loading: 'creating diary entry...',
        success: () => {
          handleCloseForm()
          return <span>diary entry created successfully!</span>}
        ,
        error: (err) => <span>{err.message || 'faliled to create diary entry'}</span>,
      }
    )
  };

  useEffect(() => {
    console.log({ openForm });
  }, [openForm]);

  return (
    <div>
      <button onClick={() => setOpenForm(true)}>add diary</button>
      {openForm && (
        <DiaryForm
          handleCloseForm={handleCloseForm}
          entry={{}}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
