import { useEffect, useState } from "react";
import FriendFinder from './FriendFinder'
import { CaretUpIcon, CaretDownIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export default function PendingReqs  ({ pendingRequests, handleRequestAction,getUsernameList }) {
    const [usernames, setUsernames] = useState({});
    const [open, setOpen] = useState(false);

    useEffect(() => {
      
      const fetchUsernames = async () => {
    const pendingUsernames = await getUsernameList(pendingRequests);
    setUsernames(pendingUsernames);
  };
  fetchUsernames();

  
  }, [pendingRequests, getUsernameList]);


    return(
        <div className="flex flex-col py-2 max-h-1/2">

          {/* header */}
          <div className="shrink-0">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center justify-center gap-1">
              {!open && <button onClick={() => {setOpen(true)}}><CaretUpIcon size={16} weight={'bold'}/></button>}
              {open && <button onClick={() => {setOpen(false)}}><CaretDownIcon size={16} weight={'bold'}/></button>}
              <span>friend requests ({pendingRequests.length})</span>
              </div>
              <FriendFinder/>
            </div>

            <hr className="border-t-3 border-gray-300 border-dotted"/>
          </div>

          {/* requests */}
          {open &&
          <div className="flex-1 min-h-0 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="mt-2 text-center border-2 border-gray-300 flex items-center justify-center p-5 rounded-md">no pending requests</div> 
            ) : (
              <div className="py-2 flex flex-col gap-2">
                {pendingRequests.map(r => (
                  <div 
                  className="flex items-center justify-between px-3 py-5 border-2 border-gray-300 rounded-md"
                  key={r}>
                    <span>{usernames[r] || "Loading..."}</span>
                    <div className="flex items-center justify-center">

                      <button 
                        className="hover:cursor-pointer text-lime-500"
                        onClick={() => handleRequestAction(r, "accept")}
                        style={{ marginRight: "5px", cursor: "pointer" }}
                      ><CheckCircleIcon size={20} weight={'fill'}/></button>

                      <button
                        className="hover:cursor-pointer text-red-400" 
                        onClick={() => handleRequestAction(r, "reject")}
                        style={{ cursor: "pointer" }}
                      ><XCircleIcon size={20} weight={'fill'}/></button>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}

        </div>
    )
}