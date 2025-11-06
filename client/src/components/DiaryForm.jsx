import "../styles/edit.css";
import { useState, useEffect } from 'react';
import { auth } from '../firebase'

export default function DiaryForm({ handleOpenEdit }) {
    const [name, setName] = useState('')
    const [selectedCuisines, setSelectedCuisines] = useState([])
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [selectedPrices, setSelectedPrices] = useState('')
    const [selectedLabels, setSelectedLabels] = useState('')
    const [images, setImages] = useState([])
    const [notes, setNotes] = useState('')
    const [taste, setTaste] = useState(5)
    const [service, setService] = useState(5)
    const [value, setValue] = useState(5)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const token = await auth.currentUser.getIdToken();

            const writeResponse = await fetch("http://localhost:8080/api/write-diary", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
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
                    value,
                }),
            }
        );

            if (!writeResponse.ok) {
                throw new Error ('Error writing diary :/')
            }

            const writeData = await writeResponse.json()
            console.log(writeData)

        } catch (error) {
            setError(error)
        } finally {
            setLoading(false);
            handleOpenEdit();
        }
    };

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
                <button onClick={handleOpenEdit}>x</button>
            </div>
        )
    }

  return (
      <div className="edit-container">
        <button onClick={handleOpenEdit}>x</button>
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

      <button className="submit-btn" onClick={handleSubmit}> 
        Submit
      </button>
    </div>
  );
}