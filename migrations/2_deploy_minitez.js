const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");

const MiniTez = artifacts.require("MiniTez");

const initialStorage = MichelsonMap.fromLiteral({ [alice.pkh]: 21000000 });

module.exports = async (deployer, _network, accounts) => {
  deployer.deploy(MiniTez, initialStorage);
};
