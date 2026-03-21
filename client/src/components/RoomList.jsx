import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomAuth } from "../context/RoomAuth";
import { useToast } from "../context/ToastContext";
import { getSocket } from "../socket/socket";
import RoomUserIcon from "../assets/RoomUserIcon.svg";
import DoubleArrowIcon from "../assets/DoubleArrowIcon.svg";
import AlertIcon from "../assets/AlertIcon.svg";

function RoomList() {
  const navigate = useNavigate();
  const { fetchRooms, rooms } = useRoomAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchRooms();
    const socket = getSocket();
    if (!socket) return;
    socket.on("user_status", () => {
      fetchRooms();
    });

    return () => {
      socket.off("user_status");
    };
  }, []);

  return (
    <div className="room-list-container">
      {rooms.length === 0 ? (
        <>
          <div className="empty-container">
            <img src={AlertIcon} alt="Empty" />
            <p>You haven't joined any rooms yet.</p>
          </div>
        </>
      ) : (
        <>
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="room-card"
              onClick={() => {
                navigate(`/room/${room.roomId}`);
                showToast("Room joined");
              }}
            >
              <div className="room-details">
                <div className="room-avatar">
                  {room.roomName?.charAt(0).toUpperCase()}
                </div>

                <div className="room-info">
                  <h3>{room.roomName}</h3>
                  <div className="room-stats">
                    <p>
                      <span>
                        <img src={RoomUserIcon} alt="member" />
                      </span>{" "}
                      <span>Members: {room.membersCount || 0}</span>
                    </p>
                    <p>
                      <span className="active-indicator"></span>{" "}
                      <span>Active: {room.activeCount || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="room-code-info">
                <p className="room-code">{room.roomId}</p>
                <img src={DoubleArrowIcon} alt="Enter" />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default RoomList;
