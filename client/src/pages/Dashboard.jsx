import { Activity, useState, useEffect } from "react";
import { useRoomAuth } from "../context/RoomAuth";
import Header from "../components/Header";
import RoomList from "../components/RoomList";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";
import AddIcon from "../assets/AddIcon.svg";
import EnterIcon from "../assets/EnterIcon.svg";

function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreateRoomVisible, setIsCreateRoomVisible] = useState(false);
  const [isJoinRoomVisible, setIsJoinRoomVisible] = useState(false);
  const { createRoom, joinRoom, fetchRooms } = useRoomAuth();
  const { showToast } = useToast();
  const { loader, setLoader } = useLoader();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoader(true);
        await fetchRooms();
      } catch (err) {
        showToast("Room load failed");
      } finally {
        setLoader(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <>
      <Toast></Toast>
      <Header></Header>
      <div className="dashboard-container">
        <section className="room-section">
          <h2>Your Rooms</h2>
          <div className="room-btns">
            <button
              className="secondary-btn create"
              onClick={() => {
                setIsCreateRoomVisible(!isCreateRoomVisible);
                if (isJoinRoomVisible) setIsJoinRoomVisible(false);
              }}
            >
              <img src={AddIcon} alt="Create" />
              Create Room
            </button>
            <button
              className="primary-btn join"
              onClick={() => {
                setIsJoinRoomVisible(!isJoinRoomVisible);
                if (isCreateRoomVisible) setIsCreateRoomVisible(false);
              }}
            >
              <img src={EnterIcon} alt="Join" />
              Join Room
            </button>
          </div>
        </section>

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
                  try {
                    createRoom(roomName, password);
                    showToast("Room created");
                  } catch {
                    showToast("Failed to create");
                  }
                }}
              >
                <div className="field">
                  <label htmlFor="room-name">Room Name</label>
                  <input
                    id="room-name"
                    placeholder="eg. Trip & Family"
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Room Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Set password for the room"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="secondary-btn">
                  <img src={AddIcon} alt="Create" />
                  Create Room
                </button>
              </form>
            </div>
          </section>
        </Activity>

        <Activity mode={isJoinRoomVisible ? "visible" : "hidden"}>
          <section className="join-room-section">
            <div className="join-room-form">
              <div className="room-form-head">
                <h3>Join Room</h3>
                <button onClick={() => setIsJoinRoomVisible(false)}>X</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    joinRoom(roomId, password);
                    showToast("Room joined");
                  } catch {
                    showToast("Failed to joined");
                  }
                }}
              >
                <div className="field">
                  <label htmlFor="room-id">Room ID</label>
                  <input
                    id="room-id"
                    placeholder="eg. 1234aa"
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Room Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter Room Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="secondary-btn">
                  <img src={EnterIcon} alt="Join" />
                  Join Room
                </button>
              </form>
            </div>
          </section>
        </Activity>

        {loader ? (
          <div className="db-loader">
            <Loader></Loader>
          </div>
        ) : (
          <RoomList></RoomList>
        )}
      </div>
    </>
  );
}

export default Dashboard;
