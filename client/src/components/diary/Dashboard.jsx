
import EntryList from './EntryList'
import AddDiaryButton from './AddDiaryButton'
import { auth } from '../../firebase';
import { useEffect, useState } from 'react'
export default function Dashboard() {

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
    const fetchDiaries = async () => {
            setLoading(true)
            try {
                auth.onAuthStateChanged(async (user) => { 
                    //change this later so that you can pass the uid into the entrylist to change who's list ur viewing!!
                    const token = await user.getIdToken();

                    const fetchResponse = await fetch("http://localhost:8080/api/diary", {
                        headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }});

                    if (!fetchResponse.ok) {
                        throw new Error ('Error writing diary :/')
                    }

                    const diaryData = await fetchResponse.json()
                    console.log(diaryData)
                    setEntries(diaryData.diaryData)
                })
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false);
            }
        };
        useEffect(() => {
          fetchDiaries();
        }, []);

    return (
      <div>
        <AddDiaryButton fetchDiaries={fetchDiaries} />
        <EntryList entries={entries} loading={loading}  error={error}/>
      </div>
    )
  }