function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// Currently, this creates an instance of a coordinateAsDMS object
function coordinateAsDMS(dir, d, m, s) {
    this.dir = dir,
    this.deg = 0|(d<0?d=-d:d),
    this.min = 0|m,
    this.sec = 0|s
   
    // If you would rather it return as a generic object, like before
    // just remove lines 8-11 and uncomment the return statement below
    // Also, remove the 'new' keyword from the return statement in
    // ConvertDDToDMS()
//     return {
//         dir : dir,
//         deg : 0|(d<0?d=-d:d),
//         min : 0|m,
//         sec : 0|s
//     };
}

// credit: https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript
function ConvertDDToDMS(D, lng){
    // this could properly round the seconds, but does not "cascade" the rounding up into minutes...
    //round((0|D*60%1*600)/10,1));
    
    
    var dir = D<0?lng?'W':'S':lng?'E':'N';
    var d = Math.floor(Math.abs(D));
    var minFloat = (Math.abs(D) - d) * 60;
    var m = Math.floor(minFloat)
    var s = Math.round((minFloat - m) * 60);
        
    // Handles cascading the value at 60
    if ( s == 60 ) { m++; s = 0 }
    if ( m == 60 ) { d++; m = 0 }

    // Returns as an instance of coordinateAsDMS()
    return new coordinateAsDMS(dir, d, m, s);
    
//     return {
//         dir : D<0?lng?'W':'S':lng?'E':'N',
//         deg : 0|(D<0?D=-D:D),
//         min : 0|D%1*60,
//         sec : (0|D*60%1*600)/10
//     };
}

function DMSString(dmsobj){
    return dmsobj['deg']+'\xB0 '+dmsobj['min']+"' "+dmsobj['sec']+'" '+dmsobj['dir']
}

// works but is not used, much simpler construction is in resource-report.js
function MakeGoogleMapsLink(latdmsobj,longdmsobj){
    var gmaps = 'https://google.com/maps/place/';
    var latstr = latdmsobj['deg']+'\xB0'+latdmsobj['min']+"'"+latdmsobj['sec']+'"'+latdmsobj['dir']
    var lonstr = longdmsobj['deg']+'\xB0'+longdmsobj['min']+"'"+longdmsobj['sec']+'"'+longdmsobj['dir']
    return gmaps+latstr+"+"+lonstr
}

