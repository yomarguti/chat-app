const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const existingUser = users.find(
    (usr) => usr.username === username && usr.room === room
  );

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((usr) => usr.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((usr) => usr.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((usr) => usr.room === room);
};

/* const user1 = {
  id: 1,
  username: "yomarguti",
  room: "general",
};

const user2 = {
  id: 2,
  username: "adel",
  room: "general",
};

const user3 = {
  id: 3,
  username: "Andrel",
  room: "Comun",
};

const usr = addUser(user1);

console.log(users);
console.log(usr); */
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
