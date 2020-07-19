const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");

const MiniTez = artifacts.require("MiniTez");
const owner = alice.pkh;

const initialStorage = MichelsonMap.fromLiteral({ [owner]: 21000000 });

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(MiniTez, initialStorage);
};
