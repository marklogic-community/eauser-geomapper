# eauser-geomapper
MarkLogic-based visualization of where early access users are from

## Configuration

The eauser-geomapper uses the Roxy Deployer. Create your databases, app servers,
etc. with this command (requires Ruby 1.9.3+):

    ml local bootstrap

Deploy your source code to the modules database with this command:

    ml local deploy modules

For more available commands, use `ml -h` or see [Roxy's Github](https://github.com/marklogic/roxy). 
