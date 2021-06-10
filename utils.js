const users = require('./data/users.json')
const fs = require('fs')
const path = require('path')

const writeData = (req)=>{
    const user = {
        id: req.body.name
      };
      console.log(req.body.name)
      try {
        users.push(user);
        console.log(JSON.stringify(users))
        fs.writeFileSync(
          path.join(__dirname, "./data/users.json"),
          JSON.stringify(users)
        );
      } catch (e) {
        console.log(e);
      }
}

module.exports = writeData