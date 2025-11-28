

export default function Entry({ handleCloseEntry, entry }) {
    return (
        <div>
            <button onClick={handleCloseEntry}>x</button>
            {entry.title}
        </div>
    )
}