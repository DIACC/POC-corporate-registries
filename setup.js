/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   David Huffman - Initial implementation
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
/*if(process.env.VCAP_APP_HOST && process.env.PRODUCTION){
	exports.SERVER = 	{	
							HOST: process.env.VCAP_APP_HOST,
							PORT: process.env.VCAP_APP_PORT,
							DESCRIPTION: 'Bluemix - Production',
							EXTURI: ext_uri,		//no longer used 4/29/2016
						};
}*/
if(process.env.PORT && process.env.PRODUCTION){
 	exports.SERVER = 	{
                            HOST: '0.0.0.0',
                            PORT: process.env.PORT,
 							DESCRIPTION: 'Bluemix - Production',
 							EXTURI: ext_uri,		//no longer used 4/29/2016
 						};

////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    2. Bluemix Development    ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
/*else if(process.env.VCAP_APP_HOST){
		exports.SERVER = 	{	
								HOST: process.env.VCAP_APP_HOST,
								PORT: process.env.VCAP_APP_PORT,
								DESCRIPTION: 'Bluemix - Development',
								EXTURI: ext_uri,		//no longer used 4/29/2016
							 };
}*/
    else if(process.env.PORT){
 		exports.SERVER = 	{	
            HOST: '0.0.0.0',
            PORT: process.env.PORT,
            DESCRIPTION: 'Bluemix - Development',
            EXTURI: ext_uri,		//no longer used 4/29/2016
        };
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