function UserSidebar({ users }) {

  return (
    <div style={{
      width: "250px",
      background: "#242424",
      padding: "15px",
      borderRight: "1px solid #ddd"
    }}>

      <h3>Users in Room</h3>

      {Object.entries(users).map(([id, user]) => (

        <div key={id} style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center"
        }}>

          <div style={{
            width: "10px",
            height: "10px",
            background: "green",
            borderRadius: "50%",
            marginRight: "8px"
          }} />

          <span>{user.name}</span>

        </div>

      ))}

    </div>
  );
}

export default UserSidebar;