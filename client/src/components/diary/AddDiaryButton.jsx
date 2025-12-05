import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { auth } from "../../firebase";
import DiaryForm from "./DiaryForm";
import { PlusIcon } from "@phosphor-icons/react";

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

      entryData.images.forEach((image) => {
        formData.append('images', image.file);
      });

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
      className="bg-black text-white p-2 md:px-4 md:py-1 rounded-md text-sm hover:cursor-pointer hover:bg-gray-800"
      onClick={() => setOpenForm(true)}>
        <PlusIcon size={15} weight={"bold"} className="md:hidden"/>
        <span className="hidden md:block">add entry</span>
        </button>
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
