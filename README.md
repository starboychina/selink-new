# SELink

SELink is a social-network combined CMS.

## Requirement

SELink needs the support of these softwares below:

  * [Node](http://nodejs.org/) -- application server
  * [MongoDB](http://www.mongodb.org/) -- database
  * [Redis](http://redis.io/) -- session store
  * [GraphicMagik](http://www.graphicsmagick.org/) -- image process
  * [Solr 4.8](http://lucene.apache.org/solr/) -- data indexing
  * Java (build 1.7.0_55-b13) -- for Solr

## Installation

### Node 
  
  * [DownLoad Node.js and install with default options](http://nodejs.org/download/)
  * install grunt-cli

    ```javascript
    npm install grunt-cli -g
    ```
  * install node-gyp

    ```javascript
    npm install node-gyp -g
    ```
  * Note: on Windows system, you need install the [Microsoft Visual Studio 2012 (Express version)](http://go.microsoft.com/?linkid=9816758).

### MongoDB
  
  * [Download MongoDB and install with default options](http://www.mongodb.org/downloads)
  * Create three database as below:

    ```javascript
    mongorestore path/to/dump/selink_test  // database for test
    mongorestore path/to/dump/selink_dev   // database for development
    mongorestore path/to/dump/selink       // database for production (you may not need this)
    ```
  
### Redis

  * [Download Redis and install with default options](http://redis.io/download)

### GraphicMagik
  
  * [Download GraphicMagik and install with default options](http://www.graphicsmagick.org/download.html)
  
### Java
  
  * For running Solr, Java's version must higher than 1.7.0_55-b13. install with default options
  
### Solr
  
  * Download Solr and install by following the instruction
  * Solr should startup at port 8080
  * Create three cores:

    ```javascript
    selink_test  // index for test
    selink_dev   // index for development
    selink       // index for production (you may not need this)
    ```
  * Copy resource/solr/schema.xml, resource/solr/solrconfig.xml, and selink.jar to each core
  * Reload each core

### SELink
  
  * Swicth to the root directory of your SELink copy
  * Install by running command:

    ```javascript
    npm install
    ```

## Build web client

## Startup

  * Single app mode
  * Cluster mode

## Other resource
