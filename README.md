[![npm](https://img.shields.io/npm/v/npm.svg)](https://nodejs.org/)
[![GitHub version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/GameDistribution/TUNNL-SDK/)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/GameDistribution/TUNNL-SDK/blob/master/LICENSE)


# Gamedistribution.com Flash SDK bridge
This is the documentation of the "Flash SDK bridge" project. This SDK is used to inject the HTML5 SDK when using the Flash SDK.

## Repository
The SDK is maintained on a public github repository.
<a href="https://github.com/gamedistribution/FlashApi" target="_blank">https://github.com/gamedistribution/FlashApi</a>

## Installation
Install the following programs:
* [NodeJS LTS](https://nodejs.org/).
* [Grunt](http://gruntjs.com/).

Pull in the rest of the requirements using npm:
```
npm install
```

Setup a local node server, watch changes and update your browser view automatically:
```
grunt
```

Make a production build for the CDN solution.
```
grunt build
```

## Development
Checkout the <a href="https://github.com/gamedistribution/GD-HTML5" target="_blank">HTML5 SDK</a> repository. Build and run it using Grunt. BrowserSync should start running the HTML5 SDK through http://localhost:3000. Use this URL within this project, instead of loading the CDN hosted SDK.

### Virtual hosts
Setup the following virtual hosts, as we want to serve these files from our local environment.
```
<VirtualHost *:80>
    ServerName vcheck.submityourgame.com
    ServerAlias vcheck.submityourgame.com
    DocumentRoot "[PATH_TO_REPOSITORY]/Vchecker"

        <Directory "[PATH_TO_REPOSITORY]/Vchecker">
            Options Indexes FollowSymLinks
            AllowOverride All
            Order allow,deny
            Allow from all
        </Directory>
</VirtualHost>
```
```
<VirtualHost *:80>
    ServerName local.gamedistribution.com
    ServerAlias local.gamedistribution.com
    DocumentRoot "[PATH_TO_REPOSITORY]/GDApi/bin-debug"

        <Directory "[PATH_TO_REPOSITORY]/GDApi/bin-debug">
            Options Indexes FollowSymLinks
            AllowOverride All
            Order allow,deny
            Allow from all
        </Directory>
</VirtualHost>
```
Make sure you add these domains to your environments `hosts` file.

### Debugging
Enable debugging by running this command from within your browsers' developer tool.
```
tunnl.openConsole();
```

## Deployment
Deployment of the SDK to production environments is done through TeamCity. The `grunt build` task will build the javascript you need and will place it within the js folder. The files are hosted within the `gd-flash-sdk` Google Cloud bucket.
