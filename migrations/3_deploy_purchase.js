const { alice } = require("../scripts/sandbox/accounts");

const Purchase = artifacts.require("Purchase");
const owner = alice.pkh;

const initialStorage = {
  contractAddress: owner,
  owner,
  price: 1700
};

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(Purchase, initialStorage);
};
