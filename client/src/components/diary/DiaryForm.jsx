import { MagnifyingGlassIcon, PlusIcon, StarIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { cuisines, labels, prices } from './tags'
// import styles from './DiaryForm.module.css'

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

    const [nameError, setNameError] = useState('')
    const [ratingError, setRatingError] = useState('')
    const [imageError, setImageError] = useState('')
    const [locationError, setLocationError] = useState('')

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
            setNameError('required')
            error = true;
        }

        if (!taste || !service || !value) {
            setRatingError('required')
            error = true;
        }

        if (images.length === 0) {
            setImageError('required')
            error = true;
        }

        if(!city || !state) {
            setLocationError('required')
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
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
      <div className="bg-white rounded-2xl flex flex-col w-2xl h-4xl lg:w-4xl overflow-y-auto p-8 gap-5">

        <div className="flex items-center justify-between">
            <div className="relative inline-block">
                <span className="font-pacifico text-3xl">{entry.id? 'edit' : 'add'} entry </span>
                <svg className="absolute -right-9 bottom-1" xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8.82 19.79a1 1 0 0 0-1.42 0l-1.29 1.29l-1.29-1.29a1 1 0 0 0-1.35-.06l-3 2.5a1 1 0 0 0-.13 1.41a1 1 0 0 0 1.41.13l2.3-1.92l1.35 1.36a1 1 0 0 0 1.42 0l1.29-1.3l.79.8a1 1 0 0 0 1.42-1.42ZM23.78 
                3.36a2.9 2.9 0 0 0-1.38-1.72L19.49.07a.51.51 0 0 0-.68.19l-8 14.46a.5.5 0 0 0 0 .38a.52.52 0 0 0 .24.3l2.48 1.37a.5.5 0 0 0 .24.06a.49.49 0 0 0 .44-.26L21.46 3.4a.9.9 0 0 1 .39.52a.87.87 0 0 1-.07.67l-3.64 6.61a1 1 0 0 0 
                .39 1.36a1 1 0 0 0 1.36-.39l3.64-6.61a2.9 2.9 0 0 0 .25-2.2M13.1 17.54l-2.48-1.36a.52.52 0 0 0-.51 0a.49.49 0 0 0-.23.44l.1 2.75a.47.47 0 0 0 .26.42a.5.5 0 0 0 .49 0l2.38-1.39a.47.47 0 0 0 .24-.43a.52.52 0 0 0-.25-.43"/>
                </svg>
            </div>
            <button className="hover:cursor-pointer" onClick={handleCloseForm}><XIcon size={16}/></button>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full lg:items-start gap-5">

        {/* first column: title, location, notes */}
        <div className="grid grid-cols-3 gap-6 w-full">

            {/* title input */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <div><span className="font-bold">title</span><span className="text-red-500">*</span></div>
                    {nameError && <span className="text-red-500">{nameError}</span>}
                </div>
                <div className="border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow">
                    <input className="w-full box-border" value={name} onChange ={e => setName(e.target.value)} type="text" placeholder={'enter the title'}/>
                </div>
            </div>

            {/* location input */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <div><span className="font-bold">location</span><span className="text-red-500">*</span></div>
                    {locationError && <span className="text-red-500">{locationError}</span>}
                </div>
                <div className="flex flex-col gap-2"> 
                    <div className="border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow">
                        <input value={city} onChange ={e => setCity(e.target.value)} type="text" placeholder={'enter the city'}/>
                    </div>
                    <div className="border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow">
                        <input  className="w-full box-border" value={state} onChange ={e => setState(e.target.value)} type="text" placeholder={'enter the state'}/>
                    </div>
                </div>
            </div>

            {/* notes input */}
            <div className="flex flex-col flex-1">
                <span className="font-bold">notes</span>
                <div className="border-1 border-solid rounded-sm w-full h-full p-1 focus-within:shadow-lg transition-shadow">
                    <textarea 
                        className="focus:outline-none resize-none w-full box-border"
                        placeholder="ex. i love fooooooooooooooood"
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}/>
                </div>
            </div>
        </div>


        {/* 2nd column: photos, preview, ratings */}
        <div className="grid grid-cols-3 gap-6 w-full">

            {/* image input */}
            <div className="flex flex-col">

                <div className="flex justify-between items-center">
                    <div className="flex gap-1 items-center justify-center">
                        <label htmlFor="fileInput" className="hover:cursor-pointer"><PlusIcon size={12}/></label>
                        <input 
                            id="fileInput" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            style={{ display: 'none' }}
                        />
                        <span className="font-bold">photos </span><span>({images.length}) </span><span className="text-red-500">*</span>
                    </div>
                    {imageError && <span className="text-red-500">{imageError}</span>}
                </div>

                {images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border-1 border-solid rounded-sm w-full h-[150px] overflow-y-auto p-2">
                            {images.map((image, i) => (
                            <div key={i} className="flex items-start gap-1">
                                <img className="h-32 w-auto" src={image} alt={`Preview ${i + 1}`} />
                                <button
                                    onClick={() => deleteImage(i)}
                                ><XIcon/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border-1 border-solid rounded-sm w-full h-[150px] flex items-center justify-center">
                        <label htmlFor="fileInput" className="text-gray-400 hover:underline hover:text-black hover:cursor-pointer decoration-2 decoration-dotted transition-all">add photos</label>
                    </div>
                )}
            </div>

            {/* rating */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <div><span className="font-bold">rating</span><span className="text-red-500">*</span></div>
                    {ratingError && <span className="text-red-500">{ratingError}</span>}
                </div>

                {/* overall rating */}
                <div className="flex h-full w-full items-center justify-center">
                    <div className={`relative flex items-center justify-center ${taste && service && value ? "text-amber-400" : "text-gray-400"}`}>
                        <StarIcon size={150} weight={'fill'}/>
                        <span className="absolute text-2xl text-center text-white font-bold">
                            {taste && value && service ? ((taste + value + service) / 3).toFixed(2) : '--'}
                        </span>
                    </div>
                </div>
            </div>

            {/* individual ratings */}
            <div>
                <div className="flex flex-col">
                    <div className="flex justify-between">
                        <span>taste</span>
                        {taste > 0 && <span>{taste} / 5</span>}
                    </div>
                    <StarRating
                    value={taste}
                    onChange={(value) => setTaste(value)}
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <span>service</span>
                        {service > 0 && <span>{service} / 5</span>}
                    </div>
                    <StarRating
                    value={service}
                    onChange={(value) => setService(value)}
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <span>value</span>
                        {value > 0 && <span>{value} / 5</span>}
                    </div>
                    <StarRating
                    value={value}
                    onChange={(value) => setValue(value)}
                    />
                </div>
            </div>
        </div>


        {/* 3rd column: tags and searching thru them */}
        <div className="flex flex-col">
        <span className="font-bold">tags</span>
        <div className="grid grid-cols-3 gap-6 w-full">
            <div className="flex flex-col gap-1"> {/* this is row */}
                <span>price</span>
                <div className="flex gap-2">
                    {prices.map((p, i) => (
                        <button 
                            className={`p-2 rounded-md hover:cursor-pointer ${selectedPrices === p ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                            key={i} 
                            onClick={() => setSelectedPrices(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span>cuisines</span>
                <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow">
                    <MagnifyingGlassIcon size={16}/>
                    <input type="text" placeholder="search cuisines" value={searchCuisine} onChange={e => setSearchCuisine(e.target.value)}/>
                </div>
                <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto">
                    {cuisines
                    .filter(c =>
                        c.toLowerCase().includes(searchCuisine.toLowerCase())
                    )
                    .map((c, i) => (
                        <button 
                        className={`p-2 rounded-md hover:cursor-pointer ${selectedCuisines.includes(c) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                            key={i} 
                            onClick={() => handleCuisine(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span>labels</span>
                <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow">
                    <MagnifyingGlassIcon size={16}/>
                    <input type="text" placeholder="search labels" value={searchLabel} onChange={e => setSearchLabel(e.target.value)}/>
                </div>
                <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto">
                    {labels
                    .filter(l =>
                        l.toLowerCase().includes(searchLabel.toLowerCase())
                    )
                    .map((l, i) => (
                        <button 
                        className={`p-2 rounded-md hover:cursor-pointer ${selectedLabels.includes(l) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                            key={i} 
                            onClick={() => handleLabel(l)}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        </div>
    </div>    

        {/* Submit Button */}
        <div className="flex items-center justify-end">
            <button
                className="bg-black text-white flex-end px-4 py-2 rounded-md"
                onClick={handleValidate}
            >
                save
            </button>
        </div>
    </div>
    </div>
    );
  }