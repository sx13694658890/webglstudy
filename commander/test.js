#!/usr/env/bin node
const { program } = require("commander");

program
  .version('0.1.0')
  .command("add")
  .argument('<username>', 'user to login')
  .argument('[password]', 'password for user, if required', 'no password given')
  .action((username, password,options,command) => {
    console.log('username:', username);
    console.log('password:', password);
    //console.log(options,command);
  })
  .parse()