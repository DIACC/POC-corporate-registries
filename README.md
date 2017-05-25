# Corporate Registries
## Blockchain Proof of Concept

### Foreword
Much of this app is based off IBM's open source offerings found [here](https://www.github.com/ibm-blockchain). Each of these demos contains documentation on getting up and running. Below we offer a combination of the necessary documents needed to quickly and easily deploy the application and its required blockchain component. 

The underlying network for this application is the [Hyperledger Fabric](https://github.com/hyperledger/fabric/tree/master/docs), a Linux Foundation project.  You may want to review these instructions to understand a bit about the Hyperledger Fabric.

### About
The Corporate Registry Blockchain Proof of Concept is a ‘shadow ledger’ that captures an audit trail of Corporate Registry transactions within and across jurisdictions. 

##Setup
There are two primary methods to run this application:

  1. **Bluemix:** Deploy both the web app and blockchain on the cloud (Bluemix)
  1. **Local:** Run the web app and its associated blockchain component on your local machine.  This method requires basic knowledge of how to use and navigate directory structures in a terminal window.

## Method #1: Bluemix

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/cbaghdassarian/blockchain-diacc-corporate-registries.git)

Select the button above to deploy the web app and blockchain component on Bluemix.

**Note:** a Bluemix ID is required and can be obtained once the button is selected. 

## Method #2: Local Setup
To set up the app locally, both the blockchain and the local web app will need to be configured.  Follow the instructions below to configure the app locally.

###1) Install Software Prerequisites
In order to run the app locally, there are a number of software prerequisites that must be installed on your system.  Please follow the links for each of the software prerequisites below and instll them on your system.

1. [Node.js](https://nodejs.org/en/download/) and npm v2+ (npm is included with Node.js)
2. [Git](https://git-scm.com/downloads) for source code management
3. [Docker](https://docs.docker.com/engine/installation/) for runninng the HyperLedger Fabric

**BEFORE PROCEEDING TO THE NEXT STEP, PLEASE MAKE SURE ALL PREREQUISITES ARE INSTALLED**

1. To test that Node.js is installed, open a terminal window and enter the following:

	~~~
	node -v
	~~~

	You should see the following output or something similar depending on your operating system:
	
	~~~
	v4.4.7
	~~~
	
2. To test Git is installed, open a terminal window and enter the following:

	~~~
	git --version
	~~~
	
	You should see the following output or something similar depending on your operating system:
	
	~~~
	git version 2.11.0 (Apple Git-81)
	~~~
	
3. To test that Docker is installed, open a terminal window and enter the following:

	~~~
	docker -v
	~~~
	
	You should see the following output or something similar depending on your operating system:
	
	~~~
	Docker version 17.03.1-ce, build c6d412e
	~~~
	
###2) Configure a local Blockchain Network
A local blockchain network will need to be setup to run in Docker.  

To set up a local blockchain network, perform the following steps:

1. Open a terminal window
2. Navigate to the directory where you wish to install the blockchain network
3. Get the IBM-Blockchain fabric docker image

	~~~
	git clone https://github.com/IBM-Blockchain/fabric-images.git
	~~~
4. Go into the docker-compose directory:
	
	~~~
	cd fabric-images/docker-compose
	~~~
5. Set the environment by executing the setenv.sh script:
	
	~~~
	. setenv.sh
	~~~
6. Run one of the two docker compose files, single-peer-ca.yaml or four-peer-ca.yaml.  For example:

	~~~
	docker-compose -f four-peer-ca.yaml up
	~~~

	**This may take a few moments to download and run.  Leave the terminal window open, this is the blockchain network running.**

	When the blockchain network is running, you should see output similar to the following:

	~~~
...
vp1_1         | 16:47:34.291 [peer] HandleMessage -> DEBU 10d Handling Message of type: DISC_PEERS 
vp1_1         | 16:47:34.291 [peer] beforePeers -> DEBU 10e Received DISC_PEERS, grabbing peers message
vp1_1         | 16:47:34.291 [peer] beforePeers -> DEBU 10f Received PeersMessage with Peers: peers:<ID:<name:"vp3" > address:"172.18.0.4:7051" type:VALIDATOR pkiID:"\226\022dA\020\245\036\222\327\002f\316_\301\2471B\311m\327\267\230\215\227\177z\3008\360\254\263?" > peers:<ID:<name:"vp2" > address:"172.18.0.5:7051" type:VALIDATOR pkiID:"\025F\300\363I%\347\274\316\261G{\233\360gU\344\251\327\226X\222\236\017\003\360s\017OA\233\033" > peers:<ID:<name:"vp1" > address:"172.18.0.6:7051" type:VALIDATOR pkiID:"\325\3741\324\226z\335\255\271\327vP\241\007\200\356\357m\230\np\222cY\210-\341\271\252\3301\234" > 
vp2_1         | 16:47:34.975 [peer] ensureConnected -> DEBU 111 Touch service indicates no dropped connections
vp2_1         | 16:47:34.975 [peer] ensureConnected -> DEBU 112 Connected to: [172.18.0.4:7051 172.18.0.6:7051 172.18.0.2:7051]
vp2_1         | 16:47:34.975 [peer] ensureConnected -> DEBU 113 Discovery knows about: [172.18.0.6:7051 172.18.0.2:7051 172.18.0.4:7051]
vp1_1         | 16:47:35.210 [peer] ensureConnected -> DEBU 110 Touch service indicates no dropped connections
vp1_1         | 16:47:35.210 [peer] ensureConnected -> DEBU 111 Connected to: [172.18.0.2:7051 172.18.0.4:7051 172.18.0.5:7051]
vp1_1         | 16:47:35.210 [peer] ensureConnected -> DEBU 112 Discovery knows about: [172.18.0.2:7051 172.18.0.4:7051 172.18.0.5:7051]
~~~

Additional help and instructions for setting up and configuring the blockchain network are available from IBM [here](https://hub.docker.com/r/ibmblockchain/fabric-peer/).

###2) Download the App
The app code needs to be downloaded to your local system.

1. Open a command prompt/terminal and browse to your desired working directory
2. Run the following command.

	~~~
	git clone https://github.com/cbaghdassarian/blockchain-diacc-corporate-registries.git
	~~~
	 
This will install the app code to your local system.

###3) Install Dependencies and Run the App


1. Open a command prompt/terminal and browse to the root of the project you just downloaded from github.  (i.e. /Users/User/Documents/BlockChain/blockchain-diacc-corporate-registries)
1. In the command prompt run the following commands:

	~~~
	npm install gulp -g
	npm install

	~~~

1. Start the app
	
	~~~
	gulp
	~~~	

 **IMPORTANT** You will need to wait up to 2 minutes for the blockchain code to fully deploy and the app to start running.
 
1. Once you see this message you are good to go: 
		
		[ibc-js] Chain Stats - success

1. The app is running and connected to the blockchain! Open up your browser and browse to [http://localhost:3000](http://localhost:3000). You should see the corporate registries landing page.
