const buidler = require("@nomiclabs/buidler");
const fs = require('fs');

function filesJsonInterface() {
    const text = fs.readFileSync("artifacts/Files.json");
    return JSON.parse(text).abi;
}   

let categories = {};

async function createCategory(address, name) {
    const contractInstance = new web3.eth.Contract(await filesJsonInterface(), address);
    const namedAccounts = await getNamedAccounts();
    const {deployer} = namedAccounts;   
    categories[name] = new Promise(async (resolve) => {
        await contractInstance.methods.createCategory(name, 'en').send({from: deployer, gas: '1000000'})
            .on('transactionHash', async function(transactionHash) {
                const logs = (await web3.eth.getTransactionReceipt(transactionHash)).logs;
                const result = web3.eth.abi.decodeLog([
                    {
                        type: 'uint',
                        name: 'itemId',
                        indexed: true,
                    }, {
                        type: 'string',
                        name: 'title',
                    }, {
                        type: 'string',
                        name: 'locale',
                    }],
                    logs[0].data,
                    [logs[0].topics[1]]);
                const itemId = result.itemId;
                resolve(itemId);
            });
    });
}

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deployIfDifferent, log} = deployments;
    const namedAccounts = await getNamedAccounts();
    const {deploy} = deployments;
    const {deployer} = namedAccounts;
    const PST = await deployments.get('PST');
    const deployResult = await deploy('Files', {from: deployer, args: [process.env.PROGRAMMER_ADDRESS, PST.address]});
    if (deployResult.newlyDeployed) {
        const fs = require('fs');
        log(`contract Files deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`);
        await createCategory(deployResult.address, "Root");
        await createCategory(deployResult.address, "Spam");
        await createCategory(deployResult.address, "E-books");
        await createCategory(deployResult.address, "Videos");
        await createCategory(deployResult.address, "Software");
        var categoryNames = Object.keys(categories);
        var allCategories = categoryNames.map(v => categories[v]);
        Promise.all(allCategories);
        console.log(await Promise.all(categoryNames.map(async v => await categories[v])));
    }
    const mydeploy = require('../lib/mydeploy');
    mydeploy.updateAddress('Files', deployResult.address, buidler.network.name); // or ethers.getContractAt
}
module.exports.tags = ['Files'];
module.exports.dependencies = ['PST'];
