/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *   Christine Baghdassarian
 *******************************************************************************/
//Environments are either:
// 	1 - Bluemix Production
// 	2 - Bluemix Development
// 	3 - Localhost Development

var vcap_app = {application_uris: ['']};						//default blank
var ext_uri = '';
if(process.env.VCAP_APPLICATION){
	vcap_app = JSON.parse(process.env.VCAP_APPLICATION);
	for(var i in vcap_app.application_uris){
		if(vcap_app.application_uris[i].indexOf(vcap_app.name) >= 0){
			ext_uri = vcap_app.application_uris[i];
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    1. Bluemix Production    ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
if(process.env.PORT && process.env.PRODUCTION){
	exports.SERVER = 	{	
							HOST: '0.0.0.0',
							PORT: process.env.PORT,
							DESCRIPTION: 'Bluemix - Production',
							EXTURI: ext_uri,		//no longer used 4/29/2016
						};
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    2. Bluemix Development    ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
else if(process.env.PORT){
		exports.SERVER = 	{	
								HOST: '0.0.0.0',
								PORT: process.env.PORT,
								DESCRIPTION: 'Bluemix - Development',
								EXTURI: ext_uri,		//no longer used 4/29/2016
							 };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////     3. Localhost - Development    ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
else{
	exports.SERVER = 	{
							HOST:'localhost',
							PORT: 3000,
							DESCRIPTION: 'Localhost',
							EXTURI: 'localhost:3000',	//no longer used 4/29/2016
						 };
}

exports.SERVER.vcap_app = vcap_app;

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////     Common     ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
exports.DEBUG = vcap_app;
exports.USER1 = 'AB';									//left username
exports.USER1longname = 'Alberta';
exports.USER2 = 'BC';							//right username
exports.USER2longname = 'British Columbia';
exports.USER3 = 'MB';
exports.USER3longname = 'Manitoba';
exports.USER4 = 'NB';
exports.USER4longname = 'New Brunswick';
exports.USER5 = 'NL';
exports.USER5longname = 'Newfoundland and Labrador';
exports.USER6 = 'NT';
exports.USER6longname = 'Northwest Territories';
exports.USER7 = 'NS';
exports.USER7longname = 'Nova Scotia';
exports.USER8 = 'NU';
exports.USER8longname = 'Nunavut';
exports.USER9 = 'ON';
exports.USER9longname = 'Ontario';
exports.USER10 = 'PE';
exports.USER10longname = 'Prince Edward Island';
exports.USER11 = 'QC';
exports.USER11longname = 'Quebec';
exports.USER12 = 'SK';
exports.USER12longname = 'Saskatchewan';
exports.USER13 = 'YT';
exports.USER13longname = 'Yukon';
exports.USER14 = 'CAD';
exports.USER14longname = 'Canada';