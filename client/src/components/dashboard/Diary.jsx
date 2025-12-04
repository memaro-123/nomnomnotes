import Filters from './Filters';
import Entry from '../diary/Entry';
import EntryList from '../diary/EntryList';
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Diary({ entries, fetchDiaries, loading, error,viewingFriendId }) {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [cuisineFilters, setCuisineFilters] = useState([])
    const [labelFilters, setLabelFilters] = useState([])
    const [priceFilters, setPriceFilters] = useState([])
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('recent')

    useEffect(() => {
        if (window.innerWidth < 800) {
          toast((t) => (
            <span className="flex items-center justify-center">
              🍳 expand the window to see your diary entry
              <button onClick={() => toast.dismiss(t.id)}>
                <XIcon/>
              </button>
            </span>
          ));
        }
    }, [])


    useEffect(() => {
      fetchDiaries()
      
    }, [])

    const sortedEntries = [...entries].sort((a, b) => {
      
      if (sortBy === 'recent') {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        
        return dateB - dateA;
      } else if (sortBy === 'rating') {
        const getRating = (entry) => {
          const taste = entry.taste || 0;
          const service = entry.service || 0;
          const value = entry.value || 0;
          return (taste + service + value) / 3;
        };
        
        const ratingA = getRating(a);
        const ratingB = getRating(b);
        return ratingB - ratingA;
      }
      
      return 0;
    });

    useEffect(() => {
      if (entries.length > 0) {
        setSelectedEntry(entries?.[0])
      } else {
        setSelectedEntry(null)
      }
    }, [entries])

    const handleSelectEntry = ( newEntry ) => {
    setSelectedEntry(newEntry)
    }

    const handleCuisineFilter = (filter) => {
    setCuisineFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handleLabelFilter = (filter) => {
    setLabelFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handlePriceFilter = (filter) => {
    setPriceFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    return(
<div className="flex items-center justify-center w-full h-full max-h-full gap-4">

<div className="w-full flex flex-col flex-1 md:w-2/5 h-full gap-2">
  <span className="font-pacifico text-2xl">table of contents</span>
  {/* searching */}
  <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-full w-full px-2 py-1 focus-within:shadow-lg transition-shadow">
    <MagnifyingGlassIcon size={16}/>
    <input 
    className="focus:outline-none w-full"
    type="text" placeholder="search entries" value={search} onChange={e => setSearch(e.target.value)}/>
  </div>

  {/* filters */}
  <div className="flex w-full items-center justify-between">
    <div className="flex items-center justify-center gap-2 text-gray-500">
      <span>sort by:</span>
      <select
      id='sort'
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="focus:outline-none"
      >
        <option value='recent'>most recent</option>
        <option value='rating'>highest rating</option>
      </select>
    </div>
    <Filters 
      handleCuisineFilter={handleCuisineFilter} 
      handleLabelFilter={handleLabelFilter} 
      handlePriceFilter={handlePriceFilter}
      cuisineFilters={cuisineFilters}
      labelFilters={labelFilters}
      priceFilters={priceFilters}
      />
  </div>

  <EntryList selectedEntry={selectedEntry} handleSelectEntry={handleSelectEntry} entries={sortedEntries} loading={loading}  error={error} search={search} cuisineFilters={cuisineFilters} priceFilters={priceFilters} labelFilters={labelFilters} fetchDiaries={fetchDiaries}  isReadOnly={viewingFriendId}/>
</div>

  {selectedEntry && <Entry entry={selectedEntry}/>}
</div>
    )
}