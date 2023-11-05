const { assert } = require('chai');
const fetchUser = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },

  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', function() {
  it('should return a user with a valid email', function (){
    const user = fetchUser(testUsers, 'user@example.com')
    const expectedUser = "userRandomID";
    assert.strictEqual(user.id, expectedUser,'The returned ID should match the one that is expected.')
  });
  it('should return undefined when given an email that doesnt exist.', function() {
    const user = fetchUser(testUsers, 'hugeBabyArms@teeth.com');
    assert.isUndefined(user,'The function should return undefined when no matching Email is found.');
  });
  
});
