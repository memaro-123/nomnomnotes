import { MagnifyingGlassIcon, PlusIcon, StarIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import LocationAuto from './LocationAuto'
import { cuisines, labels, prices } from '../../utils/tags'

export default function DiaryForm({ handleCloseForm, entry, handleSubmit }) {
    const [title, setTitle] = useState(entry?.title || '')
    const [location, setLocation] = useState(entry.location || {})
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

    const [titleError, setTitleError] = useState('')
    const [ratingError, setRatingError] = useState('')
    const [imageError, setImageError] = useState('')
    const [locationError, setLocationError] = useState('')
    const [priceError, setPriceError] = useState('')
    const [cuisineError, setCuisineError] = useState('')

    const handleCuisine = (cuisine) => {
        setSelectedCuisines(prev => prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]);
    }

    const handleLabel = (label) => {
        setSelectedLabels(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]);
    }

    const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
        setImages(prev => [...prev, {
            type: 'new',
            url: URL.createObjectURL(file),
            file: file
        }]);
    }
    };


    const deleteImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

    const handleValidate = () => {
        let error = false;
        setTitleError('')
        setRatingError('')
        setImageError('')
        setLocationError('')
        setPriceError('')
        setCuisineError('')

        if (!title) {
            setTitleError('required')
            error = true;
        }

        if (!taste || !service || !value) {
            setRatingError('required')
            error = true;
        }

        if (images.length > 10) {
            setImageError('only 10 images')
            error = true;
        }

        if(!location || !location.name) {
            setLocationError('required')
            error = true;
        }

        if (!selectedCuisines || selectedCuisines.length === 0) {
            setCuisineError('required')
            error = true;
        }

        if (!selectedPrices || selectedPrices.trim() === '') {
            setPriceError('required')
            error = true;
        }


        if (!error) {
            handleSubmit({
                entryId: entry?.id || null,
                title, 
                selectedCuisines, 
                location,
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

    // useEffect(() => console.log('Selected Cuisines:', selectedCuisines), [selectedCuisines]);
    // useEffect(() => console.log('Selected Price:', selectedPrices), [selectedPrices]);
    // useEffect(() => console.log('Selected Labels:', selectedLabels), [selectedLabels]);
    // useEffect(() => console.log('Taste:', taste), [taste])
    // useEffect(() => console.log('Location:', location), [location])

    useEffect(() => {
    if(entry && entry.images) {
        const existingImages = entry.images.map((url) => ({
            type: 's3',
            url: url,
            file: null
        }));
        setImages(existingImages);
    }
    }, [entry]);

    useEffect(() => {console.log('images', images)}, [images])

    return (
<div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000] p-4">
  <div className="bg-white rounded-2xl flex flex-col w-full max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 gap-4 md:gap-5">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="relative inline-block">
        <span className="font-pacifico text-2xl sm:text-3xl">{entry.id ? 'edit' : 'add'} entry</span>
        <svg className="absolute -right-7 sm:-right-9 bottom-1 w-8 h-8 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M8.82 19.79a1 1 0 0 0-1.42 0l-1.29 1.29l-1.29-1.29a1 1 0 0 0-1.35-.06l-3 2.5a1 1 0 0 0-.13 1.41a1 1 0 0 0 1.41.13l2.3-1.92l1.35 1.36a1 1 0 0 0 1.42 0l1.29-1.3l.79.8a1 1 0 0 0 1.42-1.42ZM23.78 3.36a2.9 2.9 0 0 0-1.38-1.72L19.49.07a.51.51 0 0 0-.68.19l-8 14.46a.5.5 0 0 0 0 .38a.52.52 0 0 0 .24.3l2.48 1.37a.5.5 0 0 0 .24.06a.49.49 0 0 0 .44-.26L21.46 3.4a.9.9 0 0 1 .39.52a.87.87 0 0 1-.07.67l-3.64 6.61a1 1 0 0 0 .39 1.36a1 1 0 0 0 1.36-.39l3.64-6.61a2.9 2.9 0 0 0 .25-2.2M13.1 17.54l-2.48-1.36a.52.52 0 0 0-.51 0a.49.49 0 0 0-.23.44l.1 2.75a.47.47 0 0 0 .26.42a.5.5 0 0 0 .49 0l2.38-1.39a.47.47 0 0 0 .24-.43a.52.52 0 0 0-.25-.43"/>
        </svg>
      </div>
      <button className="hover:cursor-pointer hover:bg-gray-200 p-2 rounded-full transition-all" onClick={handleCloseForm}>
        <XIcon size={16}/>
      </button>
    </div>

    <div className="flex flex-col items-center justify-center w-full h-full lg:items-start gap-4 md:gap-5">

      {/* First section: title, location, notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
        
        {/* Title input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div><span className="font-semibold">title</span><span className="text-red-500">*</span></div>
            {titleError && <span className="text-red-500 text-xs">{titleError}</span>}
          </div>
          <div className="border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
            <input 
              className="focus:outline-none w-full text-sm"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              type="text" 
              placeholder={'enter the title'}
            />
          </div>
        </div>

        {/* Location input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div><span className="font-semibold">location</span><span className="text-red-500">*</span></div>
            {locationError && <span className="text-red-500 text-xs">{locationError}</span>}
          </div>
          <div className="border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
            <LocationAuto
              defaultLocation={location.name || ''}
              onPlaceSelected={(place) => {
                setLocation(place);
              }}
            />
          </div>
        </div>

        {/* Notes input */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <span className="font-semibold mb-1">notes</span>
          <div className="border-1 border-solid rounded-md w-full h-full min-h-[80px] p-2 focus-within:shadow-lg transition-shadow">
            <textarea 
              className="focus:outline-none resize-none w-full h-full box-border text-sm"
              placeholder="ex. i love fooooooooooooooood"
              value={notes} 
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Second section: photos, preview, ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
        
        {/* Image input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div className="flex gap-1 items-center justify-center">
              {images.length < 10 && (
                <div>
                  <label htmlFor="fileInput" className="hover:cursor-pointer">
                    <PlusIcon size={12}/>
                  </label>
                  <input 
                    id="fileInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              <span className="font-semibold">photos</span>
              <span className="text-sm">({images.length} / 10)</span>
            </div>
            {imageError && <span className="text-red-500 text-xs">{imageError}</span>}
          </div>

          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-1 border-solid rounded-md w-full h-[150px] overflow-y-auto p-2">
              {images.map((image, i) => (
                <div key={i} className="flex items-start gap-1 relative">
                  <img className="h-24 sm:h-32 w-auto rounded" src={image.url} alt={`Preview ${i + 1}`} />
                  <button
                    onClick={() => deleteImage(i)}
                    className="absolute -top-1 -right-1 bg-white rounded-full"
                  >
                    <XIcon size={16}/>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-1 border-dashed border-solid rounded-md w-full h-[150px] flex items-center justify-center">
              <label htmlFor="fileInput" className="text-gray-400 hover:underline hover:text-black hover:cursor-pointer decoration-2 decoration-dotted transition-all text-sm">
                add photos
              </label>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div><span className="font-semibold">rating</span><span className="text-red-500">*</span></div>
            {ratingError && <span className="text-red-500 text-xs">{ratingError}</span>}
          </div>

          {/* Overall rating */}
          <div className="flex h-full w-full items-center justify-center min-h-[150px]">
            <div className={`relative flex items-center justify-center ${taste && service && value ? "text-amber-400" : "text-gray-400"}`}>
              <StarIcon size={120} className="sm:w-[150px] sm:h-[150px]" weight={'fill'}/>
              <span className="absolute text-xl sm:text-2xl text-center text-white font-semibold">
                {taste && value && service ? ((taste + value + service) / 3).toFixed(2) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Individual ratings */}
        <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>taste</span>
              {taste > 0 && <span>{taste} / 5</span>}
            </div>
            <StarRating
              value={taste}
              onChange={(value) => setTaste(value)}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>service</span>
              {service > 0 && <span>{service} / 5</span>}
            </div>
            <StarRating
              value={service}
              onChange={(value) => setService(value)}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
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

      {/* Third section: tags */}
      <div className="flex flex-col w-full">
        <span className="font-semibold mb-2">tags</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          
          {/* Price */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div><span className="text-sm">price</span><span className="text-red-500">*</span></div>
              {priceError && <span className="text-red-500 text-xs">{priceError}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {prices.map((p, i) => (
                <button 
                  className={`py-1 px-3 text-sm rounded-md hover:cursor-pointer ${selectedPrices === p ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white border border-gray-300'}`}
                  key={i} 
                  onClick={() => setSelectedPrices(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <div><span className="text-sm">cuisine</span><span className="text-red-500">*</span></div>
              {cuisineError && <span className="text-red-500 text-xs">{cuisineError}</span>}
            </div>
            <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
              <MagnifyingGlassIcon size={16}/>
              <input 
                data-testid="cuisine-input"
                className="focus:outline-none text-sm flex-1"
                type="text" 
                placeholder="search cuisines" 
                value={searchCuisine} 
                onChange={e => setSearchCuisine(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto rounded-md p-2">
              {cuisines
                .filter(c => c.toLowerCase().includes(searchCuisine.toLowerCase()))
                .map((c, i) => (
                  <button 
                    className={`py-1 px-2 text-xs rounded-md hover:cursor-pointer h-auto self-start ${selectedCuisines.includes(c) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white border border-gray-300'}`}
                    key={i} 
                    onClick={() => handleCuisine(c)}
                  >
                    {c}
                  </button>
                ))}
            </div>
          </div>

          {/* Labels */}
          <div className="flex flex-col gap-1 w-full sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center">
              <span className="text-sm">labels</span>
            </div>
            <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
              <MagnifyingGlassIcon size={16}/>
              <input 
                data-testid="label-input"
                className="focus:outline-none text-sm flex-1"
                type="text" 
                placeholder="search labels" 
                value={searchLabel} 
                onChange={e => setSearchLabel(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto rounded-md p-2">
              {labels
                .filter(l => l.toLowerCase().includes(searchLabel.toLowerCase()))
                .map((l, i) => (
                  <button 
                    className={`py-1 px-2 text-xs rounded-md hover:cursor-pointer h-auto self-start ${selectedLabels.includes(l) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white border border-gray-300'}`}
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
    <div className="flex items-center justify-end pt-2">
      <button
        className="bg-black text-white px-6 py-2 rounded-md hover:cursor-pointer hover:bg-gray-800 transition-all"
        onClick={handleValidate}
      >
        save
      </button>
    </div>
  </div>
</div>
    );
  }