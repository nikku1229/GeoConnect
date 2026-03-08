import { Activity, useState } from "react";
import { useRoomAuth } from "../context/RoomAuth";
import Header from "../components/Header";
import RoomList from "../components/RoomList";

function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreateRoomVisible, setIsCreateRoomVisible] = useState(false);
  const [isJoinRoomVisible, setIsJoinRoomVisible] = useState(false);
  const { createRoom } = useRoomAuth();

  return (
    <>
      <Header></Header>
      <div className="container">
        <section className="room-section">
          <h2>Your Rooms</h2>
          <div className="room-btns">
            <button
              onClick={() => {
                setIsCreateRoomVisible(!isCreateRoomVisible);
                if (isJoinRoomVisible) setIsJoinRoomVisible(false);
              }}
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setIsJoinRoomVisible(!isJoinRoomVisible);
                if (isCreateRoomVisible) setIsCreateRoomVisible(false);
              }}
            >
              Join Room
            </button>
          </div>
        </section>
      </div>

      <Activity mode={isCreateRoomVisible ? "visible" : "hidden"}>
        <section className="create-room-section">
          <div className="create-room-form">
            <div className="room-form-head">
              <h3>Create Room</h3>
              <button onClick={() => setIsCreateRoomVisible(false)}>X</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRoom(roomName, password);
              }}
            >
              <label htmlFor="room-name">Room Name</label>
              <input
                id="room-name"
                placeholder="eg. Trip & Family"
                onChange={(e) => setRoomName(e.target.value)}
              />
              <label htmlFor="password">Room Password</label>
              <input
                id="password"
                type="password"
                placeholder="Set password for the room"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Create Room</button>
            </form>
          </div>
        </section>
      </Activity>

      <Activity mode={isJoinRoomVisible ? "visible" : "hidden"}>
        <section className="join-room-section">
          <div className="join-room-form">
            <div className="room-form-">
              <h3>Join Room</h3>
              <button onClick={() => setIsJoinRoomVisible(false)}>X</button>
            </div>

            <form>
              <label htmlFor="room-id">Room ID</label>
              <input
                id="room-id"
                placeholder="eg. 1234aa"
                onChange={(e) => setRoomId(e.target.value)}
              />
              <label htmlFor="password">Room Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter Room Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Join Room</button>
            </form>
          </div>
        </section>
      </Activity>

      <RoomList></RoomList>
    </>
  );
}

export default Dashboard;
