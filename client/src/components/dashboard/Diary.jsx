import Filters from './Filters';
import Entry from '../diary/Entry';
import EntryList from '../diary/EntryList';
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Diary({ entries, fetchDiaries, loading, error }) {
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
      console.log('sorting')
      if (sortBy === 'recent') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
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
    <div>
      <span className="text-gray-500">sort by:</span>
      <select
      id='sort'
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
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

  <EntryList selectedEntry={selectedEntry} handleSelectEntry={handleSelectEntry} entries={sortedEntries} loading={loading}  error={error} search={search} cuisineFilters={cuisineFilters} priceFilters={priceFilters} labelFilters={labelFilters} fetchDiaries={fetchDiaries}/>
</div>

  <Entry entry={selectedEntry}/>
</div>
    )
}