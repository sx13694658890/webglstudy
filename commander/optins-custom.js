const { program } = require("commander");

console.log('progarma');


program
    .command('clone <source> [destination]')
    .description('clone a repository into a newly created directory')
    .action((source, destionation)=>{
        console.log("...",source);
    })

program.command('start <service>','start name service')
    .command('stop [service]','stop named service,or all if no name supplied')

