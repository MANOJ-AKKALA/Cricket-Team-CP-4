const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: "${error.message}"`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
  INSERT INTO 
    cricket_team (player_name,jersey_number,role)
  VALUES
    ( "${playerName}","${jerseyNumber}", "${role}");`;

  const dbResponse = await database.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added Successfully");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id  = "${playerId}";`;
  const player = await database.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
  UPDATE 
    cricket_team 
  SET
      player_name = "${playerName}",
      jersey_number = "${jerseyNumber}",
      role = "${role}"
  WHERE
    player_id = "${playerId}"`;

  await database.run(addPlayer);
  response.send("Player Updated Successfully");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = "${playerId}";`;
  await database.run(deletePlayer);
  response.send("Player Deleted Successfully");
});

module.exports = app;
