

var VpfParser = function(){
    // The list of sessions parsed from the input file.
    this.parsedSessions = [];

    this.symb = ["+", ",", "//"];

    this.errorCount = 0;
}

// Parser procedure
// tokenize : tranform the data input into a list
// <eol> = CRLF
VpfParser.prototype.tokenize = function(data){
    var separator = /(\r\n|: )/;
    data = data.split(separator);
    data = data.filter((val, idx) => !val.match(separator));
    return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
VpfParser.prototype.parse = function(data){
    var tData = this.tokenize(data);
    this.listSessions(tData);
}

VpfParser.prototype.listSessions = function(data){
    this.session(data);
    this.expect("//", input);
}

this.session = function(input){

}

VpfParser.prototype.errMsg = function(msg, input){
    this.errorCount++;
    console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
VpfParser.prototype.next = function(input){
    return input.shift()
}

VpfParser.prototype.expect = function(s, input){
    if(s === this.next(input)){
        //console.log("Reckognized! "+s)
        return true;
    }else{
        this.errMsg("symbol "+s+" doesn't match", input);
    }
    return false;
}