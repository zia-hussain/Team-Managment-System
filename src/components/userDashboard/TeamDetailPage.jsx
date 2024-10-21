import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const [teamDetails, setTeamDetails] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const teamRef = ref(db, `teams/${teamId}`);
    onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      setTeamDetails(data);
    });
  }, [teamId]);

  if (!teamDetails) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">{teamDetails.name}</h1>
      <p className="text-lg">Type: {teamDetails.category}</p>
      <h2 className="mt-4 text-2xl">Members</h2>
      <ul>
        {teamDetails.members.map((member) => (
          <li key={member.id} className="text-gray-400">
            {member.name}
          </li>
        ))}
      </ul>
      <h2 className="mt-4 text-2xl">Questions</h2>
      <ul>
        {teamDetails.questions.map((question, index) => (
          <li key={index} className="text-gray-400">
            {question.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamDetailPage;
