import { useState } from 'react';
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
            //entryData.entryId = entry.id idk what this is for so commenting out temporarily
            if (!entryData.entryId) {
                throw new Error("Entry ID is required for editing");
            }

            const formData = new FormData();
            
            formData.append('entryId', entryData.entryId)
            formData.append('title', entryData.title);
            formData.append('notes', entryData.notes);
            formData.append('taste', entryData.taste);
            formData.append('service', entryData.service);
            formData.append('value', entryData.value);
            formData.append('selectedPrices', entryData.selectedPrices);
            formData.append('selectedCuisines', JSON.stringify(entryData.selectedCuisines));
            formData.append('selectedLabels', JSON.stringify(entryData.selectedLabels));
            // formData.append('location', JSON.stringify(entryData.location)); i think doesn't handly location right
            if (entryData.location) {
                formData.append('location', JSON.stringify(entryData.location));
                if (entryData.location.placeId) {
                    formData.append('placeId', entryData.location.placeId);
                }
                if (entryData.location.lat && entryData.location.lng) {
                    formData.append('lat', entryData.location.lat);
                    formData.append('lng', entryData.location.lng);
                }
            }

            // handle images but better since can separate between new and old for editing function
            const existingImages = [];
            const newImages = [];

            entryData.images.forEach((img) => {
                if (img.type === 's3' && img.url) {
                    existingImages.push(img.url);
                } else if (img.file instanceof File) {
                    newImages.push(img.file);
                }
            });

            formData.append('existingImages', JSON.stringify(existingImages));
            newImages.forEach((file) => {
                formData.append('images', file);
            });

            console.log('=== EDIT FORM DATA DEBUG ===');
            console.log('Entry ID:', entryData.entryId);
            console.log('Existing images count:', existingImages.length);
            console.log('New images count:', newImages.length);
            console.log('Total images after edit:', existingImages.length + newImages.length);
            console.log('=== END DEBUG ===');

            const editResponse = await fetch("http://localhost:8080/api/diary/edit", {
                method: "PATCH",
                headers: {
                   Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!editResponse.ok) {
                const errorText = await editResponse.text();
                throw new Error (`Failed to edit diary: ${errorText}`);
            }
            await fetchDiaries();
        }

        toast.promise(
            saveDiaryEntry(),
            {
              loading: 'editing diary entry...',
              success: () => {
                handleCloseForm()
                return <span>diary entry edited successfully!</span>
            },
            error: (err) => {
                console.error('Error editing diary entry:', err);
                return <span>{err.message || 'failed to edit diary entry'}</span>
            },
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