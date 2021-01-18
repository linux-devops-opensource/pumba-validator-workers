const fs = require('fs')
const chai = require('chai')
const sinon = require('sinon')
const testPY = 'telepathy-filesystem-0.0.2-6.el7.noarch.py'
const functions = require('../functions')
const genfunc = require('../genericfunctions')

//create sandbox
fs.mkdirSync("./test/testsandbox", { recursive: true })

describe('Test install PY', function() {
    it('If the installation is successful we should get no errors', async function () {
        this.timeout(7000)
        fs.copyFileSync(`./test/testresources/${testPY}`, `./test/testsandbox/${testPY}`)
        sinon.stub(genfunc, "deletePackagefile").returns(true)
        const result = await functions.testinstallPY('./test/testsandbox/', testPY)
        chai.expect(result).to.be.true
    })
})
