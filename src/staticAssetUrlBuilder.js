"use strict";
const removeLastCharIfSlash = s => s.replace(/\/$/, '');

module.exports = (url, publicPath, file) => {
    return `${removeLastCharIfSlash(url)}${removeLastCharIfSlash(publicPath)}/${file}`;
};
