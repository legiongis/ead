function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function ConvertDDToDMS(D, lng, precision=1){
    // this could properly round the seconds, but does not "cascade" the rounding up into minutes...
    //round((0|D*60%1*600)/10,1));    
    
    var dir = D<0?lng?'W':'S':lng?'E':'N';
    var d = Math.floor(Math.abs(D));
    var minFloat = (Math.abs(D) - d) * 60;
    var m = Math.floor(minFloat)
    var s = round((minFloat - m) * 60, precision);
    
    // Handles cascading the value at 60
    if ( s == 60 ) { m++; s = 0 }
    if ( m == 60 ) { d++; m = 0 }
    
    return {
        dir : dir,
        deg : (d<0?d=-d:d),
        min : m,
        sec : s
    };
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

