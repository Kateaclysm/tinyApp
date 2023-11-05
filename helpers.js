function fetchUser(database, userEmail) {
  for (user in database) {
    if (database[user].email === userEmail) {
      return database[user];
    }
  }
};

module.exports = fetchUser;