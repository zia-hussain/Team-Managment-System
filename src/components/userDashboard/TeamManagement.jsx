import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { Button, Card, Typography, IconButton, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // Importing the Add icon
import { auth } from "../../firebase/firebaseConfig"; // Import auth from your firebase config

const TeamManagement = () => {
  const [teams, setTeams] = useState([]); // State to hold teams
  const userId = auth.currentUser.uid; // Get the current user's ID

  // Fetch teams the user is a member of
  useEffect(() => {
    const db = getDatabase();
    const teamsRef = ref(db, "teams");

    onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      const userTeams = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          const team = data[key];
          if (team.members && team.members[userId]) {
            userTeams.push({ id: key, ...team });
          }
        });
      }
      setTeams(userTeams); // Set the teams state
    });
  }, [userId]);

  const handleCreateTeam = () => {
    // Logic for creating a new team
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">
          Welcome, {auth.currentUser.displayName}!
        </Typography>
        {/* Icon button for theme toggle */}
        <IconButton>
          {/* Icon for dark/light theme toggle */}
          {/* Replace with your theme toggle logic */}
        </IconButton>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        {/* Create Team Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#424242",
              color: "white",
            }}
          >
            <Typography variant="h5">Create Team</Typography>
            <IconButton onClick={handleCreateTeam}>
              <AddIcon style={{ fontSize: 60, color: "white" }} />
            </IconButton>
          </Card>
        </Grid>

        {/* Team Cards */}
        {teams.length > 0 ? (
          teams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card
                style={{
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "#424242",
                  color: "white",
                }}
              >
                <Typography variant="h5">{team.name}</Typography>
                <Typography variant="body2">
                  Members: {Object.keys(team.members).length}
                </Typography>
                {/* Add any additional team details here */}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              style={{ textAlign: "center", color: "#ffffff" }}
            >
              No Teams Found. Create a team to get started!
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default TeamManagement;
