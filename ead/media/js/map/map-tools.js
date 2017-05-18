function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// credit: https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript
function ConvertDDToDMS(D, lng){
    // this could properly round the seconds, but does not "cascade" the rounding up into minutes...
    //round((0|D*60%1*600)/10,1));
    return {
        dir : D<0?lng?'W':'S':lng?'E':'N',
        deg : 0|(D<0?D=-D:D),
        min : 0|D%1*60,
        sec : (0|D*60%1*600)/10
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

