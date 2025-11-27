import { useState, useEffect } from 'react';
import { PencilIcon, XIcon, StarIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import StarRating from '../StarRating'
import styles from './DiaryForm.module.css'

export default function DiaryForm({ handleCloseForm, entry, handleSubmit }) {
    const [name, setName] = useState(entry?.name || '')
    const [city, setCity] = useState(entry?.city || '')
    const [state, setState] = useState(entry?.state || '')
    const [images, setImages] = useState(entry?.images || [])
    const [notes, setNotes] = useState(entry?.notes || '')

    const [selectedCuisines, setSelectedCuisines] = useState(entry?.selectedCuisines || [])
    const [selectedPrices, setSelectedPrices] = useState(entry?.selectedPrices || '')
    const [selectedLabels, setSelectedLabels] = useState(entry?.selectedLabels || [])

    const [searchCuisine, setSearchCuisine] = useState('')
    const [searchLabel, setSearchLabel] = useState('')

    const [taste, setTaste] = useState(entry?.taste || 0)
    const [service, setService] = useState(entry?.service || 0)
    const [value, setValue] = useState(entry?.value || 0)

    const [nameError, setNameError] = useState('error')
    const [ratingError, setRatingError] = useState('error')
    const [imageError, setImageError] = useState('error')
    const [locationError, setLocationError] = useState('error')

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

    const handleValidate = () => {
        let error = false;
        setNameError('')
        setRatingError('')
        setImageError('')
        setLocationError('')

        if (!name) {
            setNameError('title is required')
            error = true;
        }

        if (!taste && !service && !value) {
            setRatingError('rating is required')
            error = true;
        }

        if (images.length === 0) {
            setImageError('image is required')
            error = true;
        }

        if(!city || !state) {
            setLocationError('location is required')
            error = true;
        }


        if (!error) {
            handleSubmit({
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
            })
        }
    }

    useEffect(() => console.log('Selected Cuisines:', selectedCuisines), [selectedCuisines]);
    useEffect(() => console.log('Selected Price:', selectedPrices), [selectedPrices]);
    useEffect(() => console.log('Selected Labels:', selectedLabels), [selectedLabels]);
    useEffect(() => console.log('Taste:', taste), [taste])

    return (
      <div className={styles.wrapper}>
      <div className={styles.container}>

        <div className={styles.header}>
            <span>{entry.id? 'edit' : 'add'} entry 
            <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.82 19.79a1 1 0 0 0-1.42 0l-1.29 1.29l-1.29-1.29a1 1 0 0 0-1.35-.06l-3 2.5a1 1 0 0 0-.13 1.41a1 1 0 0 0 1.41.13l2.3-1.92l1.35 1.36a1 1 0 0 0 1.42 0l1.29-1.3l.79.8a1 1 0 0 0 1.42-1.42ZM23.78 
            3.36a2.9 2.9 0 0 0-1.38-1.72L19.49.07a.51.51 0 0 0-.68.19l-8 14.46a.5.5 0 0 0 0 .38a.52.52 0 0 0 .24.3l2.48 1.37a.5.5 0 0 0 .24.06a.49.49 0 0 0 .44-.26L21.46 3.4a.9.9 0 0 1 .39.52a.87.87 0 0 1-.07.67l-3.64 6.61a1 1 0 0 0 
            .39 1.36a1 1 0 0 0 1.36-.39l3.64-6.61a2.9 2.9 0 0 0 .25-2.2M13.1 17.54l-2.48-1.36a.52.52 0 0 0-.51 0a.49.49 0 0 0-.23.44l.1 2.75a.47.47 0 0 0 .26.42a.5.5 0 0 0 .49 0l2.38-1.39a.47.47 0 0 0 .24-.43a.52.52 0 0 0-.25-.43"/>
            </svg>
            </span>
            <button onClick={handleCloseForm} className={styles.xButton}><XIcon size={12}/></button>
        </div>

        <div className={styles.columns}>

        {/* first column: title, location, notes */}
        <div className={styles.column}>

            {/* title input */}
            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <span>title</span><span className={styles.required}>*</span>
                    {nameError && <span className={styles.error}>{nameError}</span>}
                </div>
                <div className={styles.inputContainer}>
                    <input value={name} onChange ={e => setName(e.target.value)} type="text" placeholder={'enter the title'}/>
                </div>
            </div>

            {/* location input */}
            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <span>location</span><span className={styles.required}>*</span>
                    {locationError && <span className={styles.error}>{locationError}</span>}
                </div>
                <div className={styles.row}> 
                    <div className={styles.inputContainer}>
                        <input value={city} onChange ={e => setCity(e.target.value)} type="text" placeholder={'enter the city'}/>
                    </div>
                    <div className={styles.inputContainer}>
                        <input value={state} onChange ={e => setState(e.target.value)} type="text" placeholder={'enter the state'}/>
                    </div>
                </div>
            </div>

            {/* notes input */}
            <div className={styles.inputWrapper}>
                <span>Notes</span>
                <div className={styles.inputContainer}>
                    <textarea 
                        placeholder="ex. i love fooooooooooooooood"
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}/>
                </div>
            </div>

        </div>


        {/* 2nd column: photos, preview, rankings */}
        <div className={styles.column}> {/*this needs to be columns */}

            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <label htmlFor="fileInput" className={styles.xButton}><PlusIcon size={12}/></label>
                    <input 
                        id="fileInput" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }}
                    />
                    <span>photos ({images.length})</span><span className={styles.required}>*</span>
                    {imageError && <span className={styles.error}>{imageError}</span>}
                </div>

                <div className={styles.scrollContainer}>
                        {images.map((image, i) => (
                        <div key={i} className={styles.imageContainer}>
                            <img src={image} alt={`Preview ${i + 1}`} />
                            <button
                                onClick={() => deleteImage(i)}
                                className={styles.xButton}
                            > ✕ </button>
                        </div>
                    ))}
                </div>
            </div>


            <div className={styles.inputWrapper}>
                <div className={styles.labelContainer}>
                    <span>rating</span><span className={styles.required}>*</span>
                    {ratingError && <span className={styles.error}>{ratingError}</span>}
                </div>
            </div>

            <div className={styles.row}> {/*this needs to be row */}
                {/* overall rating */}
                <div className={styles.overallRatingContainer}>
                    <StarIcon size={100} weight={'fill'}/>
                    <span>{taste && value && service ? ((taste + value + service) / 3).toFixed(2) : '--'}</span>
                </div>

                <div>
                    <div>
                        <span>taste</span>
                        <StarRating
                        value={taste}
                        onChange={(value) => setTaste(value)}
                        />
                    </div>

                    <div>
                        <span>service</span>
                        <StarRating
                        value={service}
                        onChange={(value) => setService(value)}
                        />
                    </div>

                    <div>
                        <span>value</span>
                        <StarRating
                        value={value}
                        onChange={(value) => setValue(value)}
                        />
                    </div>
                </div>
            </div>
        </div>


        {/* 3rd column: tags and searching thru them */}
        <div className={styles.column}> {/* this is column */}
            <span>tags</span>

            <div> {/* this is row */}
                <span>price</span>
                    {prices.map((p, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedPrices(p)}
                        >
                            {p}
                        </button>
                    ))}
            </div>


            <span>cuisines</span>
            <div>
                <MagnifyingGlassIcon size={16}/>
                <input type="text" placeholder="search cuisines" value={searchCuisine} onChange={e => setSearchCuisine(e.target.value)}/>
            </div>
            <div>
                {cuisines
                .filter(c =>
                    c.toLowerCase().includes(searchCuisine.toLowerCase())
                )
                .map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleCuisine(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <span>Labels</span>
            <div>
                <MagnifyingGlassIcon size={16}/>
                <input type="text" placeholder="search labels" value={searchLabel} onChange={e => setSearchLabel(e.target.value)}/>
            </div>
            <div>
                {labels
                .filter(l =>
                    l.toLowerCase().includes(searchLabel.toLowerCase())
                )
                .map((label, i) => (
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
            onClick={handleValidate}
        >
            save
        </button>
    </div>
    </div>
    );
  }