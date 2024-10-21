import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTeams,
  fetchTeamMembers,
  deleteMember,
  deleteTeam,
} from "../../redux/actions/action";
import DetailModal from "../Modals/DetailModal";
import { get, getDatabase, ref, remove, set } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteUser } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teams, loading, members } = useSelector((state) => state.teams);
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
  const handleDeleteUser = async (
    teamId,
    userId,
    currentMembers,
    setCurrentMembers
  ) => {
    if (!teamId || !userId) {
      console.error("Invalid teamId or userId", { teamId, userId });
      return;
    }

    try {
      // Get the current team data to find the user to delete
      const teamRef = ref(db, `teams/${teamId}`);
      const teamSnapshot = await get(teamRef);
      handleClose();

      if (teamSnapshot.exists()) {
        const teamData = teamSnapshot.val();
        const members = teamData.members || [];

        // Find the index of the member with the matching userId
        const memberIndex = members.findIndex((member) => member.id === userId);

        if (memberIndex !== -1) {
          // Remove the member from the array
          members.splice(memberIndex, 1);

          // Update the team data with the new members list
          await set(teamRef, {
            ...teamData,
            members, // Save updated members list
          });

          // Update the local state to reflect the deletion
          setCurrentMembers((prevMembers) =>
            prevMembers.filter((member) => member.id !== userId)
          );

          dispatch(deleteMember(userId)); // Dispatch the action after successful deletion
        } else {
          console.error("User not found in team members", userId);
        }
      } else {
        console.error("Team does not exist", teamId);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

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
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-8 py-12">
      <button
        className="absolute left-10 top-10 flex items-center text-blue-400 hover:text-blue-600 transition duration-200"
        onClick={handleBackClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back
      </button>
      <h1
        className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-sky-300 to-blue-400

 bg-clip-text text-transparent"
      >
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
      {open && (
        <DetailModal
          selectedTeam={selectedTeam}
          onCancel={handleClose}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default ManageUsers;
