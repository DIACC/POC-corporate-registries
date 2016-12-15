/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

package main

import (
	"errors"
	"fmt"
	"strconv"
	"encoding/json"
	"time"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

var marbleIndexStr = "_marbleindex"			//name for the key/value that will store a list of all known marbles
var corporationIndexStr = "_corporationIndex"			//name for the key/value that will store a list of all known marbles

type Corporation struct {
    Jurisdiction string `json:"jurisdiction"`         // used only in register. set & forget
    Name string `json:"name"`                          // register, changeName
    Number string `json:"number"`                  // register
    DirectorName string `json:"directorName"`         // register
    Address string `json:"address"`                   // register, reporting
    Email string `json:"email"`                            // register, reporting
    Date string `json:"date"`                               // register, reporting (latest filing date)
    Status string `json:"status"`                         // register, dissolution
}



// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// ============================================================================================================================
// Init - reset all the things
// ============================================================================================================================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	var Aval int
	var err error

	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting 1")
	}

	// Initialize the chaincode
	Aval, err = strconv.Atoi(args[0])
	if err != nil {
		return nil, errors.New("Expecting integer value for asset holding")
	}

	// Write the state to the ledger
	err = stub.PutState("abc", []byte(strconv.Itoa(Aval)))				//making a test var "abc", I find it handy to read/write to it right away to test the network
	if err != nil {
		return nil, err
	}
	
	var empty []string
	jsonAsBytes, _ := json.Marshal(empty)								//marshal an emtpy array of strings to clear the index
	err = stub.PutState(marbleIndexStr, jsonAsBytes)
	if err != nil {
		return nil, err
	}

	// corporate registries code here
	// create empty array of corporations and store at corporationIndexStr
	var emptyArrayCorporations []Corporation
	corporationJsonAsBytes, _ := json.Marshal(emptyArrayCorporations)						
	err = stub.PutState(corporationIndexStr, corporationJsonAsBytes)
	if err != nil {
		return nil, err
	}
	
	return nil, nil
}


// ============================================================================================================================
// Invoke - Our entry point for Invocations
// ============================================================================================================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "init" {													//initialize the chaincode state, used as reset
		return t.Init(stub, "init", args)
	} else if function == "register" {									//cancel an open trade order
		return t.register(stub, args)
	} else if function == "nameChange" {									//cancel an open trade order
		return t.nameChange(stub, args)
	} else if function == "report" {									//cancel an open trade order
		return t.report(stub, args)
	} else if function == "dissolve" {									//cancel an open trade order
		return t.dissolve(stub, args)
	} else if function == "amalgamation" {									//cancel an open trade order
		return t.amalgamation(stub, args)
	}
	fmt.Println("invoke did not find func: " + function)					//error

	return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Query - Our entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("query is running " + function)

	// Handle different functions
	if function == "read" {													//read a variable
		return t.read(stub, args)
	} else if function == "readAll" {
		return t.readAll(stub, args)
	}
	fmt.Println("query did not find func: " + function)						//error

	return nil, errors.New("Received unknown function query")
}

// ============================================================================================================================
// Read - read a variable from chaincode state
// ============================================================================================================================
func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting name of the var to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetState(name)									//get the var from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + name + "\"}"
		return nil, errors.New(jsonResp)
	}

	return valAsbytes, nil													//send it onward
}

// ============================================================================================================================
// readAll
// ============================================================================================================================
func (t *SimpleChaincode) readAll(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var jsonResp string
	var err error

	valAsbytes, err := stub.GetState(corporationIndexStr)									//get the var from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for corporationIndexStr.\"}"
		return nil, errors.New(jsonResp)
	}

	return valAsbytes, nil													//send it onward
}


// ============================================================================================================================
// register
// ============================================================================================================================
// args
// [0]Jurisdiction
// [1]Name
// [2]Number
// [3]DirectorName
// [4]Address
// [5]Email
// [6]Date
// [7]Status
func (t *SimpleChaincode) register(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	var err error
	
	if len(args) != 8 {
		return nil, errors.New("Incorrect number of arguments. Expecting 8")
	}

	//input sanitation
	fmt.Println("- start register (corporation)")
	// not necessary as of now
	// if len(args[0]) <= 0 {
	// 	return nil, errors.New("1st argument must be a non-empty string")
	// }

	jurisdiction := args[0]
	name := args[1]
	number := args[2]
	directorName := args[3]
	address := args[4]
	email := args[5]
	date := args[6]
	status := args[7]

	// create object to store
	var corporation = Corporation{
		Jurisdiction: jurisdiction, 
		Name: name, 
		Number: number, 
		DirectorName: directorName, 
		Address: address, 
		Email: email, 
		Date: date, 
		Status: status,
	}
	
	// pull array of all corporations
	var corporations []Corporation
	corporationsAsBytes, err := stub.GetState(corporationIndexStr)

	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get array of all corporations (to which to add our new register entry).\"}"
		return nil, errors.New(jsonResp)
	}

	json.Unmarshal(corporationsAsBytes, &corporations)

	// append new registry entry to array of all corporations
	corporations = append(corporations, corporation)

	// marshal array into bytes
	jsonCorporationAsBytes, _ := json.Marshal(corporations)

	// store marshalled byte array into KVS
	err = stub.PutState(corporationIndexStr, jsonCorporationAsBytes)
	if err != nil {
		return nil, err
	}
	
	return nil, nil

}

// ============================================================================================================================
// nameChange
// ============================================================================================================================
// args
// [0]Jurisdiction
// [1]Name
// [2]newName
func (t *SimpleChaincode) nameChange(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	var err error
	
	if len(args) != 3 {
		return nil, errors.New("Incorrect number of arguments. Expecting 3")
	}

	//input sanitation
	fmt.Println("- start nameChange (corporation)")
	// not necessary as of now
	// if len(args[0]) <= 0 {
	// 	return nil, errors.New("1st argument must be a non-empty string")
	// }

	jurisdiction := args[0]
	name := args[1]
	newName := args[2]

	// // create object to store
	// var corporation = Corporation{
	// 	Jurisdiction: jurisdiction, 
	// 	Name: name, 
	// 	Number: number, 
	// 	DirectorName: directorName, 
	// 	Address: address, 
	// 	Email: email, 
	// 	Date: date, 
	// 	Status: status,
	// }
	
	// pull array of all corporations
	var corporations []Corporation
	corporationsAsBytes, err := stub.GetState(corporationIndexStr)

	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get array of all corporations (to which to add our new register entry).\"}"
		return nil, errors.New(jsonResp)
	}

	json.Unmarshal(corporationsAsBytes, &corporations)

	// get corporation by timestamp
	index := -1
	for i := 0; i < len(corporations); i++ {
		if ((strings.ToLower(corporations[i].Name) == strings.ToLower(name)) && (strings.ToLower(corporations[i].Jurisdiction) == strings.ToLower(jurisdiction))) {
			index = i
			fmt.Println("nameChange found corporation with given name and jurisdiction at index " + strconv.Itoa(i))
		}
	}

	if index == -1 {
		jsonResp := "{\"Error\":\"Failed to find corporation with given name and jurisdiction.\"}"
		return nil, errors.New(jsonResp)
	}

	// change name to new value
	var corporation = corporations[index]
	corporation.Name = newName

	// store corporation back into array
	corporations[index] = corporation

	// store corporation array back into KVS
	// marshal array into bytes
	jsonCorporationAsBytes, _ := json.Marshal(corporations)

	// store marshalled byte array into KVS
	err = stub.PutState(corporationIndexStr, jsonCorporationAsBytes)
	if err != nil {
		return nil, err
	}
	
	return nil, nil

}

// ============================================================================================================================
// report
// ============================================================================================================================
// args
// [0]Jurisdiction
// [1]Name
// [2]Address
// [3]Date
func (t *SimpleChaincode) report(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	var err error
	
	if len(args) != 4 {
		return nil, errors.New("Incorrect number of arguments. Expecting 4")
	}

	//input sanitation
	fmt.Println("- start report (corporation)")
	// not necessary as of now
	// if len(args[0]) <= 0 {
	// 	return nil, errors.New("1st argument must be a non-empty string")
	// }

	jurisdiction := args[0]
	name := args[1]
	address := args[2]
	date := args[3]

	// // create object to store
	// var corporation = Corporation{
	// 	Jurisdiction: jurisdiction, 
	// 	Name: name, 
	// 	Number: number, 
	// 	DirectorName: directorName, 
	// 	Address: address, 
	// 	Email: email, 
	// 	Date: date, 
	// 	Status: status,
	// }
	
	// pull array of all corporations
	var corporations []Corporation
	corporationsAsBytes, err := stub.GetState(corporationIndexStr)

	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get array of all corporations.\"}"
		return nil, errors.New(jsonResp)
	}

	json.Unmarshal(corporationsAsBytes, &corporations)

	// get corporation by timestamp
	index := -1
	for i := 0; i < len(corporations); i++ {
		if ((strings.ToLower(corporations[i].Name) == strings.ToLower(name)) && (strings.ToLower(corporations[i].Jurisdiction) == strings.ToLower(jurisdiction))) {
			index = i
			fmt.Println("nameChange found corporation with given name and jurisdiction at index " + strconv.Itoa(i))
		}
	}

	if index == -1 {
		jsonResp := "{\"Error\":\"Failed to find corporation with given name and jurisdiction.\"}"
		return nil, errors.New(jsonResp)
	}

	// change all values for report
	var corporation = corporations[index]
	corporation.Jurisdiction = jurisdiction
	corporation.Name = name
	corporation.Address = address
	corporation.Date = date

	// store corporation back into array
	corporations[index] = corporation

	// store corporation array back into KVS
	// marshal array into bytes
	jsonCorporationAsBytes, _ := json.Marshal(corporations)

	// store marshalled byte array into KVS
	err = stub.PutState(corporationIndexStr, jsonCorporationAsBytes)
	if err != nil {
		return nil, err
	}
	
	return nil, nil

}

// ============================================================================================================================
// dissolve
// ============================================================================================================================
// args
// [0]Jurisdiction
// [1]Name
// [2]Status
func (t *SimpleChaincode) dissolve(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	var err error
	
	if len(args) != 3 {
		return nil, errors.New("Incorrect number of arguments. Expecting 2")
	}

	//input sanitation
	fmt.Println("- start dissolve (corporation)")
	// not necessary as of now
	// if len(args[0]) <= 0 {
	// 	return nil, errors.New("1st argument must be a non-empty string")
	// }

	jurisdiction := args[0]
	name := args[1]
	status := args[2]

	// // create object to store
	// var corporation = Corporation{ 
	// 	Jurisdiction: jurisdiction, 
	// 	Name: name, 
	// 	Number: number, 
	// 	DirectorName: directorName, 
	// 	Address: address, 
	// 	Email: email, 
	// 	Date: date, 
	// 	Status: status,
	// }
	
	// pull array of all corporations
	var corporations []Corporation
	corporationsAsBytes, err := stub.GetState(corporationIndexStr)

	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get array of all corporations (to which to add our new register entry).\"}"
		return nil, errors.New(jsonResp)
	}

	json.Unmarshal(corporationsAsBytes, &corporations)

	// get corporation by timestamp
	index := -1
	for i := 0; i < len(corporations); i++ {
		if ((strings.ToLower(corporations[i].Name) == strings.ToLower(name)) && (strings.ToLower(corporations[i].Jurisdiction) == strings.ToLower(jurisdiction))) {
			index = i
			fmt.Println("nameChange found corporation with given name and jurisdiction at index " + strconv.Itoa(i))
		}
	}

	if index == -1 {
		jsonResp := "{\"Error\":\"Failed to find corporation with given name and jurisdiction.\"}"
		return nil, errors.New(jsonResp)
	}

	// change status to "dissolved"
	var corporation = corporations[index]
	corporation.Status = status

	// store corporation back into array
	corporations[index] = corporation

	// store corporation array back into KVS
	// marshal array into bytes
	jsonCorporationAsBytes, _ := json.Marshal(corporations)

	// store marshalled byte array into KVS
	err = stub.PutState(corporationIndexStr, jsonCorporationAsBytes)
	if err != nil {
		return nil, err
	}
	
	return nil, nil

}


// ============================================================================================================================
// amalgamation
// ============================================================================================================================
// args
// [0] Jurisdiction1
// [1] Name1
// [2] Status1
// [3] Jurisdiction2
// [4] Name2
// [5] Status2
// [6]alagamationJurisdiction
// [7]amalgamationName
// [8]Number
// [9]DirectorName
// [10]Address
// [11]Email
// [12]Date
// [13]Status
func (t *SimpleChaincode) amalgamation(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {

	var dissolve0, dissolve1, register []byte
	var err0, err1, errregister error

	// [0]Jurisdiction
	// [1]Name
	// [2]Status
	var dissolve0args = []string{args[0], args[1], args[2]} 
	var dissolve1args = []string{args[3], args[4], args[5]} 
	var registerargs = []string{args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]}

	// method calls
	dissolve0, err0 = t.dissolve(stub, dissolve0args)
	dissolve1, err1 = t.dissolve(stub, dissolve0args)
	register, errregister = t.register(stub, registerargs)

	// maybe add using returned values from dissolves and register - should be nil on success
	// check for errors, otherwise return nil (success)
	if err0 != nil {
		return nil, err0
	} else if err1 != nil {
		return nil, err1
	} else if errregister != nil {
		return nil, errregister
	}

	return nil, nil

}

// ============================================================================================================================
// Make Timestamp - create a timestamp in ms
// ============================================================================================================================
func makeTimestamp() int64 {
    return time.Now().UnixNano() / (int64(time.Millisecond)/int64(time.Nanosecond))
}
