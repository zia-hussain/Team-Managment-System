// actions.js
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  get,
  update,
} from "firebase/database";
import {
  FETCH_TEAMS,
  ADD_TEAM,
  DELETE_TEAM,
  ADD_MEMBER,
  DELETE_MEMBER,
} from "./actionTypes";
import { app } from "../../firebase/firebaseConfig";

// Fetch teams from Firebase and dispatch to Redux
export const fetchTeams = () => (dispatch) => {
  const db = getDatabase(app);
  const teamsRef = ref(db, "teams");

  onValue(teamsRef, (snapshot) => {
    const data = snapshot.val();
    const teamsList = data
      ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
      : [];
    console.log(teamsList, "teamList");
    dispatch({
      type: FETCH_TEAMS,
      payload: teamsList,
    });
  });
};

// Add a new team to Firebase and Redux
export const addTeam = (team) => (dispatch) => {
  const db = getDatabase(app);
  const teamsRef = ref(db, "teams/");
  const newTeamRef = push(teamsRef);

  newTeamRef.set(team).then(() => {
    dispatch({
      type: ADD_TEAM,
      payload: { id: newTeamRef.key, ...team },
    });
  });
};

// Delete a team from Firebase and Redux
export const deleteTeam = (teamId) => (dispatch) => {
  const db = getDatabase(app);
  remove(ref(db, `teams/${teamId}`)).then(() => {
    dispatch({
      type: DELETE_TEAM,
      payload: teamId,
    });
  });
};

// Fetch team members from Firebase
export const fetchTeamMembers = (teamId) => async (dispatch) => {
  const db = getDatabase();
  const teamRef = ref(db, `teams/${teamId}/members`);

  try {
    const membersSnapshot = await get(teamRef);
    const members = membersSnapshot.val();

    if (members) {
      const userPromises = Object.keys(members).map(async (uid) => {
        const userRef = ref(db, `users/${uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();

        return {
          uid,
          name: userData ? userData.name : "Unknown", // Fallback if user data is missing
        };
      });

      const membersWithDetails = await Promise.all(userPromises);

      dispatch({
        type: "FETCH_TEAM_MEMBERS_SUCCESS",
        payload: { teamId, members: membersWithDetails },
      });
    }
  } catch (error) {
    console.error("Error fetching team members: ", error);
    dispatch({ type: "FETCH_TEAM_MEMBERS_FAILURE", error });
  }
};

// Add a new member to a team in Firebase and Redux
export const addMember = (teamId, member) => (dispatch) => {
  const db = getDatabase(app);
  const membersRef = ref(db, `teams/${teamId}/members/`);
  const newMemberRef = push(membersRef);

  newMemberRef.set(member).then(() => {
    dispatch({
      type: ADD_MEMBER,
      payload: { teamId, memberId: newMemberRef.key, member },
    });
  });
};

// Delete a member from Firebase and Redux
export const deleteMember = (teamId, memberId) => async (dispatch) => {
  const db = getDatabase(app);
  try {
    await remove(ref(db, `teams/${teamId}/members/${memberId}`));

    dispatch({
      type: DELETE_MEMBER,
      payload: { teamId, memberId },
    });
  } catch (error) {
    console.error("Error deleting member:", error);
  }
};

// Join a team by its ID
export const joinTeam = (teamId, userId) => (dispatch) => {
  const db = getDatabase(app);
  const membersRef = ref(db, `teams/${teamId}/members/`);

  const newMember = { [userId]: true }; // Assuming you want to add the user ID with a simple boolean flag

  update(membersRef, newMember)
    .then(() => {
      dispatch({
        type: ADD_MEMBER,
        payload: { teamId, memberId: userId, member: { id: userId } },
      });
    })
    .catch((error) => {
      console.error("Error joining team: ", error);
    });
};

// Fetch user name from Firebase
export const fetchUserName = async (userId) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.name; // Assuming `name` is the property in your user object
    } else {
      console.log("No data available for this user");
      return "No Name";
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return "Error";
  }
};
