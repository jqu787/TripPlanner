var parseData = e => {
    for (var k in e) {
        e[k] = e[k].S || e[k].N;
    }
    return e;
}

module.exports = {
    parseData
}