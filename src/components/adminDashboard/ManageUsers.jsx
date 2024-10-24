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
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";

const ManageUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [memberNames, setMemberNames] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");

  // Fetch user name by userId
  const fetchUserName = async (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.name || "No Name";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return "Error fetching name";
  };

  // Fetch all teams on component mount
  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  // Fetch member names when teams are loaded
  useEffect(() => {
    const fetchMemberNames = async () => {
      const newMemberNames = {};
      for (let team of teams) {
        if (team.members && team.members.length > 0) {
          const names = await Promise.all(
            team.members.map(async (memberId) => {
              const name = await fetchUserName(memberId);
              return { id: memberId, name };
            })
          );
          newMemberNames[team.id] = names;
        }
      }
      setMemberNames(newMemberNames); // Store member names
    };

    if (teams.length > 0) {
      fetchMemberNames();
    }
  }, [teams]);

  // Handle opening the details modal for a team
  const handleOpen = (team) => {
    setSelectedTeam(team);
    dispatch(fetchTeamMembers(team.id)); // Fetch team members
    setOpen(true);
  };

  // Handle closing the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
  };

  // Handle delete user or team
  const handleDeleteUser = async (teamId, memberId) => {
    const db = getDatabase();
    const memberRef = ref(db, `teams/${teamId}/members/${memberId}`); // Directly point to the member's reference

    try {
      // Remove the member from Firebase
      await remove(memberRef);
      console.log("Member deleted successfully");

      // Update UI by filtering out the deleted member
      setSelectedTeam((prevTeam) => {
        const updatedMembers = { ...prevTeam.members }; // Create a shallow copy
        delete updatedMembers[memberId]; // Remove the member by ID
        return {
          ...prevTeam,
          members: updatedMembers, // Update members in the state
        };
      });
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  // Handle deleting a team
  const handleDeleteTeam = (teamId) => {
    setItemToDelete(`Team ${teamId}`);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete.startsWith("Team")) {
      const teamId = itemToDelete.split(" ")[1];
      dispatch(deleteTeam(teamId));
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
        className="absolute left-10 top-10 lg:flex hidden items-center text-blue-400 hover:text-blue-600 transition duration-200"
        onClick={handleBackClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back
      </button>
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
        Manage Teams & Users
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {loading ? (
          // Skeleton loader for loading state
          <>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={30}
                  className="mt-2"
                />
                <Skeleton variant="rectangular" height={40} className="mt-4" />
              </div>
            ))}
          </>
        ) : teams.length === 0 ? (
          // Fallback UI for no teams
          <div className="w-[85vw] mt-14 h-full flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-400">
                No Teams Available
              </h2>
              <p className="text-gray-500 mt-2">
                Please create a new team to get started.
              </p>
            </div>
          </div>
        ) : (
          teams.map((team) => {
            const memberCount = team.members
              ? Object.keys(team.members).length
              : 0;
            return (
              <div
                key={team.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition cursor-pointer"
                onClick={() => handleOpen(team)}
              >
                <h2 className="text-2xl font-bold">{team.name}</h2>
                <p className="text-gray-400 mt-2">Members: {memberCount}</p>
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
            );
          })
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-1/3">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete?</p>
            <div className="flex justify-between mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
