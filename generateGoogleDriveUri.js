/*
< Usage >
//Casting ( Must be url of CSV, ATOM or RSS )
var sample = new genGDU('put a link of published data of Google spreadsheet here');

//CSV
var csv1 = sample('csv',{range:'A2:A6'}); // This styntax returns range A2 to A6;
var csv2 = sample('csv',{range:'A2:B6'}); // This styntax returns range A2 to B6;
var csv3 = sample('csv',{startCol:2,cols:2,rows:5,page:1}); // This styntax returns range A2 to B6;
var csv4 = sample('csv',{startCol:2,cols:2,rows:5,page:2}); // This styntax returns range A7 to B11;

//ATOM
var atom = sample('atom',{startCol:2,cols:2,rows:5,page:1}); // This styntax returns ATOM;
//RSS
var rss = sample('rss',{range:'A2:B6'}); // This styntax returns RSS;

*/
var genGDU = function(opt,params){
	var lowerOpt = opt.toLowerCase();
	switch (lowerOpt){
		case 'csv':
			break;
		case 'atom':
			break;
		case 'rss':
			break;
		default:
			this.defaultMode = '';
		    this.base = {'csv':'','atom':'','rss':'','uuid':'','default':opt};
		    this.full = {'csv':'','atom':'','rss':''};
			if(typeof console != 'undefined'){
				this.console = console;
			}else{
				this.console = function(){ /* dummy function for browsers not compatible with console */ };
			}
			var execute = true;
			if(!opt.match(/^https:\/\//i)){
				execute = false;
				this.console.log('Please set uri start with "https".');
			}
			if(execute){
				if(opt.match(/output=csv/i)){
					//CSV
					this.defaultMode = 'csv';
					if(opt.match(/&range=.*/i)){
						//Has range setting
						this.full.csv = opt.replace(/&range=.*&/i,'&');
						this.base.csv = opt.replace(/&range=.*&/i,'&range=<replacer>&');
					}else{
						//Doesn't have range setting
						this.full.csv = opt;
						this.base.csv = this.full.csv.replace(/&output=csv/i,'&range=<replacer>&output=csv');
					}
					convertCsvToAtom.apply(this);
					this.base.rss = this.base.atom + '&alt=rss';
					this.full.atom = this.base.atom.replace(/\?range=.*/i,'');
					this.full.rss = this.full.atom + '?alt=rss';
				}else if(opt.match(/alt=rss/i)){
					//RSS
					this.defaultMode = 'rss';
					if(opt.match(/\?range=.*/i)){
						//Has range setting
						this.full.rss = opt.replace(/\?range=.*&/i,'?');
						this.base.rss = opt.replace(/\?range=.*&/i,'?range=<replacer>&');
					}else{
						//Doesn't have range setting
						this.full.rss = opt;
						this.base.rss = this.full.rss.replace(/\?/i,'?range=<replacer>&');
					}
					this.base.atom = this.base.rss.replace(/&alt=rss.*&/i,'');
					convertAtomToCsv.apply(this);
					this.full.atom = this.full.rss.replace(/\?alt=rss.*/i,'');
					this.full.csv = this.base.csv.replace(/&range=.*?&/i,'&')
				}else{
					//ATOM
					this.defaultMode = 'atom';
					if(opt.match(/\?range=.*/i)){
						//Has range setting
						this.full.atom = opt.replace(/\?range=.*/i,'');
					}else{
						//Doesn't have range setting
						this.full.atom = opt
					}
					this.full.rss = this.full.atom + '?alt=rss';
					this.base.atom = this.full.atom + '?range=<replacer>';
					this.base.rss = this.base.atom + '&alt=rss';
					convertAtomToCsv.apply(this);
					this.full.csv = this.base.csv.replace(/&range=.*?&/i,'&')
				}
			}
			return this;
			break;
	}
	function convertAtomToCsv(url){
		var uuid =  this.base.atom.match(/\/feeds\/cells\/.*?\//i)[0];
		uuid = uuid.replace(/\/feeds\/cells\//i,'');
		this.base.uuid = uuid.substr(0,uuid.length - 1);
		this.base.csv = 'https://docs.google.com/spreadsheet/pub?key=' + this.base.uuid + '&single=true&gid=0&range=<replacer>&output=csv';
	}
	function convertCsvToAtom(){
		var uuid =  this.base.csv.match(/\?key=.*?&/i)[0];
		uuid = uuid.replace(/\?key=/i,'');
		this.base.uuid = uuid.substr(0,uuid.length - 1);
		this.base.atom = 'https://spreadsheets.google.com/feeds/cells/' + this.base.uuid + '/od6/public/basic?range=<replacer>';
	}
};

/*

ATOM
https://spreadsheets.google.com/feeds/cells/0AmhsIY7iHEnLdE9NTVZTNVRpeUJOMmI3dllFX2FGMkE/od6/public/basic?range=A2%3AA6

RSS
https://spreadsheets.google.com/feeds/cells/0AmhsIY7iHEnLdE9NTVZTNVRpeUJOMmI3dllFX2FGMkE/od6/public/basic?range=A2%3AA6&alt=rss

CSV
https://docs.google.com/spreadsheet/pub?key=0AmhsIY7iHEnLdE9NTVZTNVRpeUJOMmI3dllFX2FGMkE&single=true&gid=0&range=A2%3AA6&output=csv

*/
