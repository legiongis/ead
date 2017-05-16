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
        sec : 0|(D*60%1*600)/10
    };
}

function DMSString(dmsobj){
    return dmsobj['deg']+'\xB0 '+dmsobj['min']+"' "+dmsobj['sec']+'" '+dmsobj['dir']
}

