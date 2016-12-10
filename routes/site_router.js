'use strict';
/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *******************************************************************************/
var express = require('express');
var router = express.Router();
var setup = require('../setup.js');

//anything in here gets passed to JADE template engine
function build_bag(){
	return {
				setup: setup,								//static vars for configuration settings
				e: process.error,							//send any setup errors
				jshash: process.env.cachebust_js,			//js cache busting hash (not important)
				csshash: process.env.cachebust_css,			//css cache busting hash (not important)
			};
}

// ============================================================================================================================
// Home
// ============================================================================================================================
router.route('/').get(function(req, res){
	res.redirect('/diacc');
});

// ============================================================================================================================
// Part 1
// ============================================================================================================================
router.route('/p1').get(function(req, res){
	res.render('part1', {title: 'Marbles Part 1', bag: build_bag()});
});
router.route('/p1/:page?').get(function(req, res){
	res.render('part1', {title: 'Marbles Part 1', bag: build_bag()});
});

// ============================================================================================================================
// Part 2
// ============================================================================================================================
router.route('/p2').get(function(req, res){
	res.render('part2', {title: 'Marbles Part 2', bag: build_bag()});
});
router.route('/p2/:page?').get(function(req, res){
	res.render('part2', {title: 'Marbles Part 2', bag: build_bag()});
});

//============================================================================================================================
//Corporate Registry Main Entry Point
//============================================================================================================================
router.route('/diacc').get(function(req, res){
	res.render('diacc', {title: 'DIACC Blockchain POC', bag: build_bag()});
});
router.route('/diacc/:page?').get(function(req, res){
	res.render('diacc', {title: 'DIACC Blockchain POC', bag: build_bag()});
});


//============================================================================================================================
//Corporate Registry Simulator
//============================================================================================================================
router.route('/registry_simulator').get(function(req, res){
	res.render('registry_simulator', {title: 'DIACC Blockchain POC Registry Simulator', bag: build_bag()});
});
router.route('/registry_simulator/:page?').get(function(req, res){
	res.render('registry_simulator', {title: 'DIACC Blockchain POC Registry Simulator', bag: build_bag()});
});

//============================================================================================================================
//Corporate Registry Viewer
//============================================================================================================================
router.route('/registry_viewer').get(function(req, res){
	res.render('registry_viewer', {title: 'DIACC Blockchain POC Registry Viewer', bag: build_bag()});
});
router.route('/registry_viewer/:page?').get(function(req, res){
	res.render('registry_viewer', {title: 'DIACC Blockchain POC Registry Viewer', bag: build_bag()});
});

module.exports = router;