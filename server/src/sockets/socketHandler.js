module.exports = (io) => {

  io.on("connection",(socket)=>{

    console.log("User connected:",socket.id);

    socket.on("join_room",(roomId)=>{
      socket.join(roomId);
    });

    socket.on("location_update",(data)=>{
      io.to(data.roomId).emit("location_update",data);
    });

    socket.on("disconnect",()=>{
      console.log("User disconnected");
    });

  });

};