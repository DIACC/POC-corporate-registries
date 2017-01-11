# Corporate Registries
## Blockchain Proof of Concept

### Foreword
Much of this app is based off IBM's open source offerings found [here](https://www.github.com/ibm-blockchain). Each of these demos contains documentation on getting up and running. Below we offer a combination of the necessary documents needed to quickly and easily deploy the application and its required blockchain component. 

The underlying network for this application is the [Hyperledger Fabric](https://github.com/hyperledger/fabric/tree/master/docs), a Linux Foundation project.  You may want to review these instructions to understand a bit about the Hyperledger Fabric.

### About
The Corporate Registry Blockchain Proof of Concept is a ‘shadow ledger’ that captures an audit trail of Corporate Registry transactions within and across jurisdictions. 

##Setup
There are two primary methods of deployment:

  1. **Bluemix:** Deploying both the web app and blockchain on the cloud (Bluemix)
  1. **Local:** Deploying the web app and its associated blockchain component locally (using Docker) 

A third method is to run the web app locally and connect the web app to a Bluemix blockchain service. This can be handy for local development without the need to set up a docker image for the Blockchain service.

### Method #1: Bluemix

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/cbaghdassarian/blockchain-diacc-corporate-registries.git)

Select the button above to deploy the web app and blockchain component on Bluemix.

**Note:** a Bluemix ID is required and can be obtained once the button is selected. 

### Method #2: Local Setup
To set up the app locally, both the blockchain and the local web app will need to be configured.  Follow the instructions below to configure the app locally.

####Software Prerequisites
In order to run the app locally, the following must be installed on your system:

1. [Node.js](https://nodejs.org/en/download/) and npm v2+ (npm is included with Node.js)
2. [Git](https://git-scm.com/) for source code management

#### Download the App
We need to download the app code to your local system. 
Let’s do this with Git by cloning this repository. 

1. Open a command prompt/terminal and browse to your desired working directory
1. Run the following command.

	```
	git clone https://github.com/cbaghdassarian/blockchain-diacc-corporate-registries.git
	``` 
	This will clone the app code to your local system.

#### Local Blockchain Network Configuration
To set up a local blockchain network, please follow the instructions [here](https://hub.docker.com/r/ibmblockchain/fabric-peer/).

###Run the App

Finally lets install the app's npm dependencies. 

1. Open a command prompt/terminal and browse to the root of this project.
1. In the command prompt type:
	
		> npm install gulp -g
		> npm install
		> gulp
		
1. If all goes well you should see this message in the console:
	
		--------------------------------- Server Up - localhost:3000 ------------------------------------
		
1. The app is already coded to auto deploy the chaincode.  You should see further message about it deploying.
 **[IMPORTANT]** You will need to wait about 60 seconds for the cc to fully deploy. The SDK will do the waiting for us by stalling our callback.
 
1. Once you see this message you are good to go: 
		
		[ibc-js] Deploying Chaincode - Complete
		---------------------------------------- Websocket Up ------------------------------------------

1. The app is running! Open up your browser and browse to [http://localhost:3000](http://localhost:3000)


### Architecture
![Alt_Text](https://github.com/IBM-Blockchain/marbles/blob/master/doc_images/comm_flow.png)
