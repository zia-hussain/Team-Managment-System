import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTeam } from "../../redux/actions/action"; // Adjust the path accordingly
import { getDatabase, ref, remove } from "firebase/database";
import DeleteModal from "../Modals/DeleteModal"; // Import your delete modal component

const TeamCards = ({ teams, loading, memberNames }) => {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Handle opening the delete modal
  const handleOpenDeleteModal = (team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  // Handle deletion of team
  const handleDeleteTeam = async () => {
    if (selectedTeam) {
      // Delete from Firebase
      const db = getDatabase();
      const teamRef = ref(db, `teams/${selectedTeam.id}`);
      await remove(teamRef);

      // Dispatch action to remove team from Redux state
      dispatch(deleteTeam(selectedTeam.id));

      // Close the modal
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          teams?.map((team) => (
            <li
              key={team.id}
              className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition"
            >
              <h3 className="text-lg font-bold text-blue-500">
                {team.name || `Team ID: ${team.id}`}
              </h3>
              <h4 className="text-white">
                Members: {team.members ? team.members.length : 0}
              </h4>
              <button
                className="mt-2 text-red-500 hover:text-red-400"
                onClick={() => handleOpenDeleteModal(team)}
              >
                Delete Team
              </button>
            </li>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTeam}
          teamName={selectedTeam?.name || `Team ID: ${selectedTeam?.id}`}
        />
      )}
    </>
  );
};

export default TeamCards;
