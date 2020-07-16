const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");

const Purchase = artifacts.require("Purchase");

const initialStorage = {
  contractAddress: alice.pkh,
  owner: alice.pkh,
  price: 1500
};

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(Purchase, initialStorage);
};
