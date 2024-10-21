import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTeams,
  deleteTeam,
  deleteMember,
} from "../../redux/actions/action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const teams = useSelector((state) => state.teams.teams);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [open, setOpen] = useState(false);

  // Fetch teams when component mounts
  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  // Function to open modal
  const handleOpen = (team) => {
    setSelectedTeam(team);
    setOpen(true);
  };

  // Function to close modal
  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
  };

  // Function to delete a team
  const handleDeleteTeam = (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      dispatch(deleteTeam(teamId));
      handleClose();
    }
  };

  // Function to delete a user from a team
  const handleDeleteUser = (teamId, userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteMember(teamId, userId));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-8 py-12">
      <h1 className="text-5xl font-extrabold mb-10 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Manage Teams & Users
      </h1>

      {/* Teams Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition cursor-pointer"
            onClick={() => handleOpen(team)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{team.name}</h2>
            </div>
            <p className="text-gray-400 mt-2">
              Description: {team.description || "No description available"}
            </p>
            <p className="text-gray-400 mt-2">
              Created on: {new Date(team.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-400 mt-2">
              Mpaters: {team.members ? Object.keys(team.members).length : 0}
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
        ))}
      </div>

      {/* Team Members Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className="flex justify-center items-center min-h-screen">
            <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-3xl w-full relative">
              {selectedTeam && (
                <>
                  <h2 className="text-3xl font-bold mb-4">
                    {selectedTeam.name} Members
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {selectedTeam.description || "No description available"}
                  </p>
                  <ul className="space-y-4">
                    {selectedTeam.members &&
                      Object.keys(selectedTeam.members).map((memberId) => {
                        const member = selectedTeam.members[memberId];
                        return (
                          <li
                            key={memberId}
                            className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                          >
                            <span className="text-lg font-semibold">
                              {member.name}
                            </span>
                            <div className="flex space-x-4">
                              <button
                                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                                onClick={() =>
                                  alert(`Viewing answers for ${member.name}`)
                                }
                              >
                                <FontAwesomeIcon icon={faEye} /> View Answers
                              </button>
                              <button
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                onClick={() =>
                                  handleDeleteUser(selectedTeam.id, memberId)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} /> Delete User
                              </button>
                            </div>
                          </li>
                        );
                      })}
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
        </Fade>
      </Modal>
    </div>
  );
};

export default ManageUsers;
