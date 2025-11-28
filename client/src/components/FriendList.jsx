import { useState, useEffect } from "react";

export default function FriendList({ friends, onSelectFriend, getUsername }) {
  const [usernames, setUsernames] = useState({});
  useEffect(() => {
    const fetchUsernames = async () => {
      // Fetch all usernames in parallel
      const entries = await Promise.all(
        friends.map(async (uid) => [uid, await getUsername(uid)])
      );
      setUsernames(Object.fromEntries(entries));
    };
    fetchUsernames();
  }, [friends, getUsername]);

  return (
    <>
      {/* Friends List */}
      <h2>Friends</h2>
      {friends.length === 0 ? (
        <p>No friends yet</p>
      ) : (
        <ul>
          {friends.map((f) => (
            <li key={f} style={{ marginBottom: "8px" }}>
              <span>{usernames[f] || "Loading..."}</span>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "15px 0" }} />
    </>
  );
}
