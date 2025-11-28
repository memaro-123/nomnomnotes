import { useEffect, useState } from "react";
export default function PendingReqs  ({ pendingRequests, handleRequestAction,getUsername }) {
    const [usernames, setUsernames] = useState({});

    useEffect(() => {
    const fetchUsernames = async () => {
      const newUsernames = {};
      for (const uid of pendingRequests) {
        const name = await getUsername(uid);
        newUsernames[uid] = name || uid; 
      }
      setUsernames(newUsernames);
    };
    fetchUsernames();
  }, [pendingRequests, getUsername]);

    return(
        <>
         {/* Pending friend requests, accept or reject */}
        <h2 style={{ marginTop: 0 }}>Pending Friend Requests</h2>
        {pendingRequests.length === 0 ? <p>No pending requests</p> : (
          <ul>
            {pendingRequests.map(r => (
              <li key={r} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>{usernames[r] || "Loading..."}</span>
                <div>
                  <button 
                    onClick={() => handleRequestAction(r, "accept")}
                    style={{ marginRight: "5px", cursor: "pointer" }}
                  >Accept</button>
                  <button 
                    onClick={() => handleRequestAction(r, "reject")}
                    style={{ cursor: "pointer" }}
                  >Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr style={{ margin: "15px 0" }} />

        </>
    )
}