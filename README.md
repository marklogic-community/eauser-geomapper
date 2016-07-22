# eauser-geomapper
MarkLogic-based visualization of where early access users are from

## Configuration

The eauser-geomapper uses the Roxy Deployer. Create your databases, app servers,
etc. with this command (requires Ruby 1.9.3+):

    ml local bootstrap

Deploy your source code to the modules database with this command:

    ml local deploy modules

Sample data .zip file is provided with the application in data/. Extract the zip contents to data/ 
and run the following command to load data into MarkLogic for the app to play with:
    
    ml local deploy content

For more available commands, use `ml -h` or see [Roxy's Github](https://github.com/marklogic/roxy). 
