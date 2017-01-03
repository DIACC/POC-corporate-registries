# Corporate Registries on a Blockchain

### Foreword
Much of this demonstration is based off IBM's open source offerings found [here](www.github.com/ibm-blockchain). Each of these demos contains documentation on getting up and running. Below we offer a combination of the necessary documents needed to quickly and easily deploy our application and its required blockchain component. 


We offer two primary methods of deployment:
  1. Deploying the web app and its associated blockchain component locally (using Docker)
  2. Deploying both the web app and blockchain on the cloud (Bluemix) 


### Architecture
![Alt_Text](https://github.com/IBM-Blockchain/marbles/blob/master/doc_images/comm_flow.png)


### Local
To set up the demo locally, the first step is to set up the blockchain network. Once that is running, we can connect a local web application to the blockchain network.

**Local Blockchain Network**
To set up a local blockchain network, please follow the instructions [here](/docs/use_local_hyperledger.md).

**Run Local Web Application**
Follow the documentation located [here](/docs/host_marbles_locally.md) to run your local web app.


### Bluemix

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/cbaghdassarian/blockchain-diacc-corporate-registries.git)

Select the button above to deploy the web app and blockchain component on Bluemix. Note - reauthentication will be required. 


If you would like to change which Github repository gets deployed to Bluemix, please modify *pipeline.yml* located inside the *.bluemix* folder.

