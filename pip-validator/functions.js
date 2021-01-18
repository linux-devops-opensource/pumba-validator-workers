const errDebug = require('debug')('debug:err')
const superDebug = require('debug')('debug:stdout')
const { execSync } = require('child_process')
const fs = require('fs')
const { stderr } = require('process')
const genfunc = require('./genericfunctions')
var loopbacktoken = false
let workingPYS = []

// functions block and export and use of funxtions. in this file is so that we can use nested stubs in our tests.
// if we don't call the functions from this block they will be imported to the test module and use the nested local functions and not as a global function
// that we can stub
const functions = {
    filterPKG,
    validatePYs,
    testinstallPY,
    validation
}
module.exports = functions;


async function filterPKG(StorageManagerURL) {
    const pys = await genfunc.getPackages(StorageManagerURL)
    return pys.filter(s=>~s.indexOf(".whl"));
}


async function validation(pydir) {
    do {
        loopbacktoken = false
        superDebug(`start while loop, loopbacktoken: ${loopbacktoken}`)
        try {
            await validatePYs(pydir)
        } catch (err) {
            errDebug(err)
        }
        superDebug(`end of while loop, loopbacktoken: ${loopbacktoken}`)
    } while (loopbacktoken)
    superDebug(workingPYS)
    console.log('PY package validator has finished')
    return workingPYS
}

function validatePYs(pydir) {
    return new Promise((res, rej) => {
        if (fs.readdirSync(pydir).length != 0) {
            fs.readdirSync(pydir).forEach(async (file) => {
                let stdout = execSync(`file ${pydir}/${file}`).toString()
                if (stdout.includes("whl")) {
                    try {
                        await testinstallPY(pydir, file)
                    } catch (err) {
                        rej(err)
                    }
                    res(true)
                } else {
                    const err = `File "${file}" is not an PY package`
                    fs.unlinkSync(`${pydir}/${file}`)
                    errDebug(err)
                    rej(err)
                }
            })
        } else {
            res(`There are no files in the validate directory: ${pydir}`)
        }
    })
}

function testinstallPY(dir, py) {
    return new Promise((res, rej) => {
        console.log(`Validating Package ${py}`)
        superDebug(`Stage testinstallPY:start loopbacktoken: ${loopbacktoken}`)
        try {
            const stdout = execSync(`pip install ${dir}/${py}`, {stdio: [stderr]}).toString()
            superDebug(stdout)
            console.log(`Package ${py} installed successfully`)
            loopbacktoken = true
            genfunc.deletePackagefile(`${dir}/${py}`)
            workingPYS.push({ name: py, statusCode: 0, msg: "success" })
            res(true)
        } catch (err) {
            const stderr = err.stderr
            if (stderr.includes("Requires") || stderr.includes("nothing provides")) {
                console.log(`Package ${py} has missing dependencies...`)
                workingPYS.push({ name: py, statusCode: 1, msg: "missing_deps" })
                errDebug(err)
            } else {
                console.log(`Unable to install package ${py}, run debug mode to view error`)
                workingPYS.push({ name: py, statusCode: 666, msg: 'unknown_err' } )
                errDebug(err)
            }
            rej(err)
        }
    })
}