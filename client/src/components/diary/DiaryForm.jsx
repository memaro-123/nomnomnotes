import "../../styles/edit.css";
import { useState, useEffect } from 'react';

export default function DiaryForm({ handleCloseForm, entry, loading, error, handleSubmit }) {
    const [name, setName] = useState(entry.name || '')
    const [selectedCuisines, setSelectedCuisines] = useState(entry.selectedCuisines || [])
    const [city, setCity] = useState(entry.city || '')
    const [state, setState] = useState(entry.state || '')
    const [selectedPrices, setSelectedPrices] = useState(entry.selectedPrices || '')
    const [selectedLabels, setSelectedLabels] = useState(entry.selectedLabels || '')
    const [images, setImages] = useState(entry.images || [])
    const [notes, setNotes] = useState(entry.notes || '')
    const [taste, setTaste] = useState(entry.taste || 5)
    const [service, setService] = useState(entry.service || 5)
    const [value, setValue] = useState(entry.value || 5)

    const cuisines = ['Chinese', 'Indian', 'Italian']
    const price = ['$', '$$', '$$$', '$$$$']
    const labels = ['breakfast', 'lunch', 'dinner', 'cash-only', 'apple pay']

    const handleCuisine = (cuisine) => {
        setSelectedCuisines((prevSelected) =>
            prevSelected.includes(cuisine)
              ? prevSelected.filter((c) => c !== cuisine) // remove if already selected
              : [...prevSelected, cuisine] // add if not selected
        );
    }

    const handleLabel = (label) => {
        setSelectedLabels((prevSelected) =>
            prevSelected.includes(label)
              ? prevSelected.filter((c) => c !== label) // remove if already selected
              : [...prevSelected, label] // add if not selected
        );
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]; 
        if (file) {
          setImages((prev) => { 
            return(
                [...prev, URL.createObjectURL(file)]
            )}); 
        }
    };

    const deleteImage = (index) => {
        setImages((prevSelected) => prevSelected.filter((_, i) => index !== i) );
    }

    useEffect(() => {
        console.log(selectedCuisines)
    }, [selectedCuisines])

    useEffect(() => {
        console.log(selectedPrices)
    }, [selectedPrices])

    useEffect(() => {
        console.log(selectedLabels)
    }, [selectedLabels])

    if (loading) {
        return(
            <div>Loading...</div>
        )
    }

    if (error) {
        return (
            <div>
                {error}
                <button onClick={handleCloseForm}>x</button>
            </div>
        )
    }

  return (
      <div className="edit-container">
        <button onClick={handleCloseForm}>x</button>
        <span>Enter name of food or restaurant</span>
        <input 
          type="text" 
          value={name} 
          onChange={ e => setName(e.target.value)}
        />

        <span>Cuisines</span>
        <div className="chip-group">
        {cuisines.map((c, i) => (
          <button
            onClick={() => handleCuisine(c)}
            key={i}
            className={selectedCuisines.includes(c) ? "chip selected" : "chip"}
          >
            {c}
          </button>
        ))}
        </div>

        <span>Enter Location</span>
        <input 
          type="text" 
          placeholder="City" 
          value={city} 
          onChange={e => setCity(e.target.value)}/>    
        <input 
          type="text" 
          placeholder="State" 
          value={state} 
          onChange={e => setState(e.target.value)}/>  

        <span>Price</span>
        <div className="chip-group">
        {price.map((p, i) => (
          <button
            onClick={() => setSelectedPrices(p)}
            key={i}
            className={selectedPrices === p ? "chip selected" : "chip"}
          >
            {p}
          </button>
        ))}
        </div>

        <span>Labels</span>
        <div className="chip-group">
        {labels.map((c, i) => (
          <button
            onClick={() => handleLabel(c)}
            key={i}
            className={selectedLabels.includes(c) ? "chip selected" : "chip"}
          >
            {c}
          </button>
        ))}
        </div>

        <span>Photos</span>
        <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
        />

        {images.length > 0 && 
        (<>
            <p>Preview:</p>
            <div className="image-preview-container">
                {images.map((image, i) => (
                <div className="image-preview" key={i}>
                    <img src={image} alt="Preview" />
                    <button
                    className="delete-img"
                    onClick={() => deleteImage(i)}>
                    x
                    </button>
                </div>
                ))}
            </div>
        </>
      )}

      <span>Notes:</span>
      <textarea
        placeholder="Write your notes..."
        onChange={e => setNotes(e.target.value)}
        value={notes}
      ></textarea>

      <span>Ranking</span>
        <span>Taste</span>
        <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={taste}
            onChange={e => setTaste(Number(e.target.value))}
        />
        <span>{taste}</span>

        <span>Service</span>
        <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={service}
            onChange={e => setService(Number(e.target.value))}
        />
        <span>{service}</span>

        <span>Value</span>
        <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={value}
            onChange={e => setValue(Number(e.target.value))}
        />
        <span>{value}</span>

      <button className="submit-btn" onClick={() => handleSubmit({
          entryId: entry.id || null,
          name: name, 
          selectedCuisines: selectedCuisines, 
          city: city, 
          state: state, 
          selectedPrices: selectedPrices,
          selectedLabels: selectedLabels,
          images: images,
          notes: notes,
          taste: taste,
          service: service, 
          value: value,
      })}> 
        Submit
      </button>
    </div>
  );
}