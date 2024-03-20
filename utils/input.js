module.exports.parseInputStrToInt = (str, defaultValue = 0, base = 10) => {
    if (typeof str === 'number')
        return isNaN(str) ? defaultValue : str;
    if (typeof str !== 'string')
        return defaultValue;
    str = str.trim(' ');
    return (isNaN(str) ? defaultValue : parseInt(str, base));
}
