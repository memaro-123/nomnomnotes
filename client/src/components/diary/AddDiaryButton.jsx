import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { auth } from "../../firebase";
import DiaryForm from "./DiaryForm";

export default function AddDiaryButton({ fetchDiaries }) {
  const [openForm, setOpenForm] = useState(false);

  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleSubmit = async (entryData) => {
    const saveDiaryEntry = async () => {
      const token = await auth.currentUser.getIdToken();

      console.log('add diary, starting to add to formdata')

      const formData = new FormData();

      formData.append('title', entryData.title);
      formData.append('notes', entryData.notes);
      formData.append('taste', entryData.taste);
      formData.append('service', entryData.service);
      formData.append('value', entryData.value);
      formData.append('selectedPrices', entryData.selectedPrices);
      formData.append('selectedCuisines', JSON.stringify(entryData.selectedCuisines));
      formData.append('selectedLabels', JSON.stringify(entryData.selectedLabels));
      formData.append('location', JSON.stringify(entryData.location));

      if (entryData.images && entryData.images.length > 0) {
        entryData.images.forEach((image) => {
          formData.append('images', image.file);
        });
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified
          });
        } else {
          console.log(key, value);
        }
      }

      console.log('calling api')

      const writeResponse = await fetch(
        "http://localhost:8080/api/diary/create",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
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
      <button 
      className="bg-black text-white px-4 py-1 rounded-md text-sm hover:cursor-pointer"
      onClick={() => setOpenForm(true)}>add entry</button>
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
