import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTeams,
  fetchTeamMembers,
  deleteMember,
  deleteTeam,
} from "../../redux/actions/action";
import DetailModal from "../Modals/DetailModal";
import { get, getDatabase, ref } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [memberNames, setMemberNames] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  console.log("selectedTeam", selectedTeam?.name);
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");

  // Fetch a single member's name by ID
  const fetchUserName = async (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.name || "No Name";
      } else {
        return "No Data";
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return "Error";
    }
  };
  useEffect(() => {
    dispatch(fetchTeams(dispatch));
  }, []);
  // Fetch all member names for each team and store in state
  useEffect(() => {
    const fetchMemberNames = async () => {
      const newMemberNames = {};
      for (let team of teams) {
        if (team.members) {
          const names = await Promise.all(
            team.members.map(async (memberId) => {
              const name = await fetchUserName(memberId);
              return { id: memberId, name };
            })
          );
          newMemberNames[team.id] = names; // Store team member names by team ID
        }
      }
      setMemberNames(newMemberNames); // Update state with all names
    };

    if (teams.length > 0) {
      fetchMemberNames();
    }
  }, [teams]);

  // Handle modal open
  const handleOpen = (team) => {
    setSelectedTeam(team);
    dispatch(fetchTeamMembers(team.id)); // Fetch members for the selected team
    setOpen(true);
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
  };

  // Handle delete user or team
  const handleDeleteTeam = (teamId) => {
    setItemToDelete(`Team ${teamId}`);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete.startsWith("Team")) {
      const teamId = itemToDelete.split(" ")[1];
      dispatch(deleteTeam(teamId));
    } else {
      const memberId = itemToDelete.split(" ")[1];
      dispatch(deleteMember(selectedTeam.id, memberId));
    }
    setShowDeleteModal(false);
    handleClose();
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-8 py-12">
      <h1 className="text-5xl font-extrabold mb-10 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Manage Teams & Users
      </h1>

      {/* Teams Card Grid */}
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            teams?.map((team) => (
              <div
                key={team.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition cursor-pointer"
                onClick={() => handleOpen(team)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{team.name}</h2>
                </div>
                <h4 className="text-white">
                  Members: {team.members ? team.members.length : 0}
                </h4>
                <p className="text-gray-400 mt-2">
                  Created on: {new Date(team.createdAt).toLocaleDateString()}
                </p>
                <button
                  className="mt-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete Team
                </button>
              </div>
            ))
          )}
        </div>

        {/* Delete confirmation modal */}
        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-700 rounded-lg p-6 w-1/3">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete?</p>{" "}
              {/* Update the text to reflect the item */}
              <div className="flex justify-between mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => {
                    confirmDelete(); // Call confirmDelete function on delete
                  }}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowDeleteModal(false)} // Pass function reference correctly
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>

      {/* Custom Modal */}
      {/* {open && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
            {selectedTeam && (
              <>
                <h2 className="text-3xl font-bold mb-4">
                  {selectedTeam.name} Members
                </h2>
                <ul className="space-y-4">
                  {members[selectedTeam.id] &&
                    members[selectedTeam.id].map((member) => (
                      <li
                        key={member.uid}
                        className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
                      >
                        <span className="text-lg font-semibold">
                          {member.name || "No Name"}
                        </span>
                        <button
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          onClick={() =>
                            handleDeleteUser(selectedTeam.id, member.uid)
                          }
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                </ul>
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                  onClick={handleClose}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )} */}
      {open && (
        <DetailModal selectedTeam={selectedTeam} onCancel={handleClose} />
      )}

      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          itemToDelete={itemToDelete}
        />
      )} */}
    </div>
  );
};

export default ManageUsers;
