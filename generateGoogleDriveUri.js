/*
< Usage >
//Casting ( Must be url of CSV, ATOM or RSS )
var sample = new genGDU('put a link of published data of Google spreadsheet here');

//CSV - Cell and Range
var csv1 = sample.genUri('csv',{range:'A2'}); // This styntax returns only  A2;
var csv2 = sample.genUri('csv',{range:'A2:A6'}); // This styntax returns range A2 to A6;
var csv3 = sample.genUri('csv',{range:'A2:B6'}); // This styntax returns range A2 to B6;

//CSV - These styntax returns range A1 to A5;
var csv4 = sample.genUri('csv',{cols:1,rows:5});
var csv5 = sample.genUri('csv',{cols:1,rows:5,page:1});
var csv6 = sample.genUri('csv',{startCol:1,cols:1,rows:5,page:1});
var csv6 = sample.genUri('csv',{startCol:1,startRow:1,cols:1,rows:5,page:1});
//Default "startCol" is 1
//Default "startRow" is 1
//Default "page" is 1
//"cols" and "rows" are required.

//CSV - For paging
var csv7 = sample.genUri('csv',{startRow:2,cols:2,rows:5,page:1}); // This styntax returns range A2 to B6;
var csv8 = sample.genUri('csv',{startRow:2,cols:2,rows:5,page:2}); // This styntax returns range A7 to B11;

//ATOM
var atom = sample.genUri('atom',{startRow:2,cols:2,rows:5,page:1}); // This styntax returns ATOM;

//RSS
var rss = sample.genUri('rss',{range:'A2:B6'}); // This styntax returns RSS;

*/
var genGDU = function(opt){

	this.defaultMode = '';
	this.base = {'csv':'','atom':'','rss':'','uuid':'','default':opt};
	this.full = {'csv':'','atom':'','rss':''};
	this.func = {};
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
	this.genUri = function(mode,params){
		var replaceFlg = true;
		var replacer = '';
		if( (typeof mode == 'undefined') || (typeof params == 'undefined') ){
			replaceFlg = false;
		}
		if(replaceFlg){
			if( (mode != 'csv') && (mode != 'atom') && (mode != 'rss') ){ replaceFlg = false; }
		}
		if(replaceFlg){
			if(typeof params.range == 'string'){
				replacer = params.range.replace(':','%3A');
			}else if(typeof params.range == 'undefined'){
				if( (typeof params.cols == 'number') && (typeof params.rows == 'number') ){
					if(typeof params.startCol == 'undefined'){ params.startCol = 1; }
					if(typeof params.startRow == 'undefined'){ params.startRow = 1; }
					if(typeof params.page == 'undefined'){ params.page = 1; }
					replacer = calcRangeStr(params);
				}else{
					replaceFlg = false;
				}
			}else{
				replaceFlg = false;
			}
		}
		if(replaceFlg){
			var result = '';
			if(mode == 'csv'){ result = this.base.csv.replace('<replacer>',replacer); }
			if(mode == 'atom'){ result = this.base.atom.replace('<replacer>',replacer); }
			if(mode == 'rss'){ result = this.base.rss.replace('<replacer>',replacer); }
			return result;
		}else{
			return '';
		}
	}
	return this;

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
	function calcRangeStr(pagingObj){
		var startColStr = colNumToStr(pagingObj.startCol);
		var endColStr = colNumToStr((pagingObj.startCol + pagingObj.cols - 1));
		var startRowNum = pagingObj.startRow + ( pagingObj.rows * ( pagingObj.page - 1 ) );
		var endRowNum = startRowNum + pagingObj.rows - 1;
		return (startColStr + startRowNum + '%3A' + endColStr + endRowNum)
	}
	function colNumToStr(number){
		//"A" is String.fromCharCode(65) and col number 1
		//"Z" is String.fromCharCode(90) and col number 26
		var colGroup = Math.floor(number / 26);
		var colNum = number % 26
		var colStr = '';
		if( (colGroup >= 1) && (colGroup <= 26) ){
			colGroup += 64;
			colStr = String.fromCharCode(colGroup);
		}
		if( (colNum >= 1) && (colNum <= 26) ){
			colNum += 64;
			colStr += String.fromCharCode(colNum);
		}
		return colStr;
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
