import { useState, useEffect } from 'react';
import { PencilIcon, XIcon, StarIcon } from "@phosphor-icons/react";
import StarRating from '../StarRating'
import styles from './DiaryForm.module.css'

export default function DiaryForm({ handleCloseForm, entry, loading, error, handleSubmit }) {
    const [name, setName] = useState(entry?.name || '')
    const [selectedCuisines, setSelectedCuisines] = useState(entry?.selectedCuisines || [])
    const [city, setCity] = useState(entry?.city || '')
    const [state, setState] = useState(entry?.state || '')
    const [selectedPrices, setSelectedPrices] = useState(entry?.selectedPrices || '')
    const [selectedLabels, setSelectedLabels] = useState(entry?.selectedLabels || [])
    const [images, setImages] = useState(entry?.images || [])
    const [notes, setNotes] = useState(entry?.notes || '')

    const [taste, setTaste] = useState(entry?.taste || 0)
    const [service, setService] = useState(entry?.service || 0)
    const [value, setValue] = useState(entry?.value || 0)

    const [nameError, setNameError] = useState('');


    const cuisines = ['Chinese', 'Indian', 'Italian', 'Mexican', 'Japanese']
    const prices = ['$', '$$', '$$$', '$$$$']
    const labels = ['breakfast', 'lunch', 'dinner', 'cash-only', 'apple pay']


    const handleCuisine = (cuisine) => {
        setSelectedCuisines(prev => prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]);
    }

    const handleLabel = (label) => {
        setSelectedLabels(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]);
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]; 
        if (file) setImages(prev => [...prev, URL.createObjectURL(file)]);
    };

    const deleteImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

    useEffect(() => console.log('Selected Cuisines:', selectedCuisines), [selectedCuisines]);
    useEffect(() => console.log('Selected Price:', selectedPrices), [selectedPrices]);
    useEffect(() => console.log('Selected Labels:', selectedLabels), [selectedLabels]);
    useEffect(() => console.log('Taste:', taste), [taste])

    if (loading) return (
        <div>Loading...</div>
    );

    if (error) return(
        <div>error</div>
    );

    return (
      <div className={styles.wrapper}>
      <div className={styles.container}>

        <div>
            <span>add entry <PencilIcon size={32}/></span>
            <button onClick={handleCloseForm}><XIcon size={12}/></button>
        </div>


        <div className={styles.columns}>

        {/* first column: title, location, notes */}
        <div>

            {/* title input */}
            <div>
                <div>
                    <span>title</span>
                    {nameError && <div>{nameError}</div>}
                </div>
                <div className={styles.inputContainer}>
                    <input value={name} onChange ={e => setName(e.target.value)} type="text" placeholder={'enter the title'}/>
                </div>
            </div>

            {/* location input */}
            <div>
                <span>location</span>
                <div> 
                    <div>
                        <input value={city} onChange ={e => setCity(e.target.value)} type="text" placeholder={'enter the city'}/>
                    </div>
                    <div>
                        <input value={state} onChange ={e => setState(e.target.value)} type="text" placeholder={'enter the state'}/>
                    </div>
                </div>
            </div>

            {/* notes input */}
            <div>
                <span>Notes</span>
                <div>
                    <textarea 
                        placeholder="Write your thoughts, recommendations, or any details about your experience..."
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}/>
                </div>
            </div>

        </div>


        {/* 2nd column: photos, preview, rankings */}
        <div>

            <div>
                <label htmlFor="fileInput">Add Photo</label>
                <input 
                    id="fileInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }}
                />

                <div>
                    {images.length > 0 && (
                        <div>
                            {images.map((image, i) => (
                                <div key={i}>
                                    <img src={image} alt={`Preview ${i + 1}`} />
                                    <button
                                        onClick={() => deleteImage(i)}
                                        aria-label="Delete image"
                                    > ✕ </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <span>Rating</span>

                {/* overall rating */}
                <div>
                    <StarIcon size={32} weight={'fill'}/>
                </div>

                <span>Taste</span>
                <StarRating
                value={taste}
                onChange={(value) => setTaste(value)}
                />

                <span>Service</span>

                <span>Value</span>
            </div>

        </div>


        {/* 3rd column: tags and searching thru them */}
        <div>
            <span>Cuisines</span>
            <div>
                {cuisines.map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleCuisine(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <span>Price Range</span>
            <div>
                {prices.map((p, i) => (
                    <button 
                        key={i} 
                        onClick={() => setSelectedPrices(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <span>Labels & Tags</span>
            <div>
                {labels.map((label, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleLabel(label)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
        </div>    

        {/* Submit Button */}
        <button
            onClick={() => handleSubmit({
                entryId: entry?.id || null,
                name, 
                selectedCuisines, 
                city, 
                state, 
                selectedPrices, 
                selectedLabels,
                images, 
                notes, 
                taste, 
                service, 
                value
            })}
            disabled={!name.trim()}
            style={!name.trim() ? {opacity: 0.6, cursor: 'not-allowed'} : {}}
        >
            {entry?.id ? 'Update Entry' : 'Add Entry'}
        </button>
    </div>
    </div>
    );
  }