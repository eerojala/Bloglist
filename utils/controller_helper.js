const printToConsole = (printContents) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(printContents)
    }
}
module.exports = printToConsole