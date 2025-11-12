import "../../styles/entrystyle.css";
import { useState, useEffect } from 'react';

export default function DiaryForm({ handleCloseForm, entry, loading, error, handleSubmit }) {
    const [name, setName] = useState(entry?.name || '')
    const [selectedCuisines, setSelectedCuisines] = useState(entry?.selectedCuisines || [])
    const [city, setCity] = useState(entry?.city || '')
    const [state, setState] = useState(entry?.state || '')
    const [selectedPrices, setSelectedPrices] = useState(entry?.selectedPrices || '')
    const [selectedLabels, setSelectedLabels] = useState(entry?.selectedLabels || [])
    const [images, setImages] = useState(entry?.images || [])
    const [notes, setNotes] = useState(entry?.notes || '')
    const [taste, setTaste] = useState(entry?.taste || 5)
    const [service, setService] = useState(entry?.service || 5)
    const [value, setValue] = useState(entry?.value || 5)

    const cuisines = ['Chinese', 'Indian', 'Italian', 'Mexican', 'Japanese']
    const price = ['$', '$$', '$$$', '$$$$']
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

    if (loading) return (
        <div className="editwrapper">
            <div className="edit-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{fontSize: '1.2rem', color: '#ff6f61'}}>Loading...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="editwrapper">
            <div className="edit-container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px'}}>
                <div style={{fontSize: '1.2rem', color: '#ff3b2f'}}>{error}</div>
                <button className="submit-btn" onClick={handleCloseForm}>Close</button>
            </div>
        </div>
    );

    return (
      <div className="editwrapper">
        <div className="edit-container">
            <button className="exit-btn" onClick={handleCloseForm}>✕</button>
            
            {/* Main Form Section */}
            <div className="form-main">
                <span>Enter name of food or restaurant *</span>
                <input 
                    type="text" 
                    placeholder="e.g., Joe's Pizza, Pad Thai"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                />

                <span>Cuisines</span>
                <div className="chip-group">
                    {cuisines.map((c, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleCuisine(c)} 
                            className={selectedCuisines.includes(c) ? "chip selected" : "chip"}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <span>Location</span>
                <div className="location-inputs">
                    <input 
                        type="text" 
                        placeholder="City" 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        placeholder="State" 
                        value={state} 
                        onChange={e => setState(e.target.value)} 
                    />
                </div>

                <span>Price Range</span>
                <div className="chip-group">
                    {price.map((p, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedPrices(p)} 
                            className={selectedPrices === p ? "chip selected" : "chip"}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <span>Labels & Tags</span>
                <div className="chip-group">
                    {labels.map((label, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleLabel(label)} 
                            className={selectedLabels.includes(label) ? "chip selected" : "chip"}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <span>Add Photos</span>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                />

                {images.length > 0 && (
                    <>
                        <p>Image Previews ({images.length})</p>
                        <div className="image-preview-container">
                            {images.map((image, i) => (
                                <div key={i} className="image-preview">
                                    <img src={image} alt={`Preview ${i + 1}`} />
                                    <button 
                                        className="delete-img" 
                                        onClick={() => deleteImage(i)}
                                        aria-label="Delete image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <span>Notes & Comments</span>
                <textarea 
                    placeholder="Write your thoughts, recommendations, or any details about your experience..."
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                ></textarea>
            </div>

            {/* Sidebar Rankings Section */}
            <div className="form-sidebar">
                <span>Rankings</span>

                <span>Taste</span>
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5" 
                    value={taste} 
                    onChange={e => setTaste(Number(e.target.value))} 
                />
                <span>{taste.toFixed(1)}</span>

                <span>Service</span>
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5" 
                    value={service} 
                    onChange={e => setService(Number(e.target.value))} 
                />
                <span>{service.toFixed(1)}</span>

                <span>Value</span>
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5" 
                    value={value} 
                    onChange={e => setValue(Number(e.target.value))} 
                />
                <span>{value.toFixed(1)}</span>
            </div>

            {/* Submit Button */}
            <button 
                className="submit-btn" 
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