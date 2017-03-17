"use strict";
const removeLastCharIfSlash = s => s.charAt(s.length - 1)  === "/" ? s.slice(0, s.length - 1) : s;

module.exports = (url, publicPath, file) => {
    return `${removeLastCharIfSlash(url)}${removeLastCharIfSlash(publicPath)}/${file}`;
};
