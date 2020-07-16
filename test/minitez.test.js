const MiniTez = artifacts.require("MiniTez");
const Purchase = artifacts.require("Purchase");
const truffleConfig = require("../truffle-config");
const { alice, bob } = require("../scripts/sandbox/accounts");
const { Tezos } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const signerFactory = async pk => {
  await Tezos.setProvider({ signer: new InMemorySigner(pk) });
  return Tezos;
};

contract("MiniTez", async () => {
  let minitezInstance, purchaseInstance, minitezStorage, store, minitezAddress;

  before(async () => {
    Tezos.setProvider({
      rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`
    });
    await signerFactory(alice.sk);

    const _minitezInstance = await MiniTez.deployed();
    const _purchaseInstance = await Purchase.deployed();
    /**
     * Display the current contract address for debugging purposes
     */
    console.log("MiniTez deployed at:", _minitezInstance.address);
    console.log("Store deployed at:", _purchaseInstance.address);

    minitezAddress = _minitezInstance.address;

    minitezInstance = await Tezos.wallet.at(_minitezInstance.address);
    purchaseInstance = await Tezos.wallet.at(_purchaseInstance.address);

    // updates contract address in purchase contract
    const op = await purchaseInstance.methods
      .updateContract(_minitezInstance.address)
      .send();
    await op.confirmation();
  });

  it("should show display correct storages for both contracts", async () => {
    minitezStorage = await minitezInstance.storage();
    const aliceAccount = await minitezStorage.get(alice.pkh);

    assert.equal(21000000, aliceAccount);

    store = await purchaseInstance.storage();
    assert.equal(store.owner, alice.pkh);
    assert.equal(store.contractAddress, minitezAddress);
  });

  it("should fail if amount is present", async () => {
    let err;

    try {
      await minitezInstance.methods.main(bob.pkh, 100).send({ amount: 10 });
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "NOAMOUNTALLOWED");
  });

  it("should prevent self-transfers", async () => {
    let err;

    try {
      await minitezInstance.methods.main(alice.pkh, 100).send();
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "FORBIDDENSELFTRANFER");
  });

  it("should prevent unregistered accounts to use MiniTez", async () => {
    await signerFactory(bob.sk);

    let err;

    try {
      await minitezInstance.methods.main(alice.pkh, 50).send();
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "UNKNOWNSPENDER");
  });

  it("should transfer 10000000 tokens from Alice to store address", async () => {
    await signerFactory(alice.sk);

    let tokens = 11000000;

    try {
      const op = await minitezInstance.methods
        .main(purchaseInstance.address, tokens)
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    minitezStorage = await minitezInstance.storage();
    const storeBalance = await minitezStorage.get(purchaseInstance.address);

    assert.equal(storeBalance, tokens);
  });

  it("should prevent buying tokens from store if amount is wrong", async () => {
    await signerFactory(bob.sk);

    const tokens = 500000;
    let err;

    try {
      await purchaseInstance.methods
        .buy(tokens)
        .send({ amount: tokens, mutez: true });
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "WRONGAMOUNT");
  });

  it("should let store sell 500000 tokens to Bob", async () => {
    await signerFactory(bob.sk);

    const tokens = 500000;
    store = await purchaseInstance.storage();

    try {
      const op = await purchaseInstance.methods
        .buy(tokens)
        .send({ amount: tokens * store.price, mutez: true });
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    minitezStorage = await minitezInstance.storage();
    const bobBalance = await minitezStorage.get(bob.pkh);

    assert.equal(bobBalance, tokens);
  });

  it("should let Alice update the price and block Bob", async () => {
    let err;
    const newPrice = 1600;

    try {
      await purchaseInstance.methods.updatePrice(newPrice).send();
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "FORBIDDENACTION");

    await signerFactory(alice.sk);

    try {
      const op = await purchaseInstance.methods.updatePrice(newPrice).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    store = await purchaseInstance.storage();

    assert.equal(store.price, newPrice);
  });

  it("should let Alice withdraw the balance and block Bob", async () => {
    let err;
    const aliceBalance = await Tezos.tz.getBalance(alice.pkh);

    await signerFactory(bob.sk);

    try {
      await purchaseInstance.methods.withdraw([["unit"]]).send();
    } catch (error) {
      err = error.message;
    }

    assert.equal(err, "FORBIDDENACTION");

    await signerFactory(alice.sk);

    try {
      const op = await purchaseInstance.methods.withdraw([["unit"]]).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    }

    const aliceNewBalance = await Tezos.tz.getBalance(alice.pkh);

    assert.isAbove(aliceNewBalance.toNumber(), aliceBalance.toNumber());
  });
});
