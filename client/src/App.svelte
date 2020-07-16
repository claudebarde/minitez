<script>
  import { onMount } from "svelte";
  import { Tezos } from "@taquito/taquito";
  import { TezBridgeWallet } from "@taquito/tezbridge-wallet";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { ThanosWallet } from "@thanos-wallet/dapp";
  import storeImg from "../public/shop.png";

  let tokenAmount = "";
  const storeAddress = "KT1SVmTS2UH9ffbPYbmgLG2hArSH6HT123Ra";
  const miniTezAddress = "KT1URhAn8GHBy9Jjtd12CZve81uCERWwWPsb";
  let storeInstance = undefined;
  let tokenPrice = undefined;
  let userAddress = undefined;
  let loading = false;
  let txHash = undefined;
  let successBuy = false;

  const calculatePrice = (tokenAmount, tokenPrice) => {
    if (tokenAmount && tokenAmount > 0) {
      //return (tokenAmount * tokenPrice).toFixed(3);
      return (
        Math.round((tokenAmount * tokenPrice + Number.EPSILON) * 100) / 100
      );
    } else {
      return 0;
    }
  };

  const initTezBridgeWallet = async () => {
    // connect with tezbridge
    try {
      const wallet = new TezBridgeWallet();
      await Tezos.setProvider({ wallet });
      userAddress = await wallet.getPKH();
    } catch (error) {
      console.log(error);
    }
  };

  const initBeaconWallet = async () => {
    // connect with beacon
    try {
      const options = {
        name: "Contract Originator",
        eventHandlers: {
          PERMISSION_REQUEST_SUCCESS: {
            handler: async data => {}
          },
          OPERATION_REQUEST_SENT: {
            handler: async data => {}
          },
          OPERATION_REQUEST_SUCCESSFUL: {
            handler: async data => {}
          }
        }
      };
      const wallet = new BeaconWallet(options);
      await wallet.requestPermissions({
        network: {
          type: "custom"
        }
      });
      await Tezos.setWalletProvider(wallet);
      userAddress = wallet.permissions.address;
    } catch (error) {
      console.log(error);
    }
  };

  const initThanosWallet = async () => {
    // connect with thanos
    try {
      const available = await ThanosWallet.isAvailable();
      if (!available) {
        throw new Error("Thanos Wallet not installed");
      }

      const wallet = new ThanosWallet("Contract Originator");
      await wallet.connect("sandbox");
      await Tezos.setWalletProvider(wallet);

      userAddress = wallet.pkh;
    } catch (err) {
      console.log(err);
    }
  };

  const buyTokens = async () => {
    if (tokenAmount && tokenPrice) {
      loading = true;
      try {
        const op = await storeInstance.methods
          .buy(tokenAmount)
          .send({ amount: tokenAmount * tokenPrice });
        console.log(op.opHash);
        txHash = op.opHash;
        await op.confirmation();
        successBuy = true;
        window.confetti.start();
        setTimeout(() => {
          // resets UI
          successBuy = false;
          tokenAmount = "";
          window.confetti.remove();
        }, 5000);
      } catch (error) {
        console.log(error);
      } finally {
        loading = false;
      }
    }
  };

  onMount(async () => {
    Tezos.setProvider({ rpc: "http://localhost:8732" });

    try {
      storeInstance = await Tezos.wallet.at(storeAddress);
      const storage = await storeInstance.storage();
      tokenPrice = storage.price.toNumber() / 1000000;
    } catch (error) {
      console.log(error);
    }
  });
</script>

<style>
  main {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  input[type="number"] {
    padding: 10px;
    font-size: 1rem;
    border: solid 1px lightgrey;
    border-radius: 5px;
    width: 150px;
    display: inline-block;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  a {
    color: white;
    text-decoration: none;
    font-style: italic;
  }
  a:hover {
    text-decoration: underline;
  }

  .token-input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .buttons button {
    margin: 0px 10px;
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    border: none;
    background: #00b4db; /* fallback for old browsers */
    background: -webkit-linear-gradient(
      to top,
      #0083b0,
      #00b4db
    ); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(
      to top,
      #0083b0,
      #00b4db
    ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    color: white;
  }

  .buttons button:hover {
    -webkit-animation: wobble-hor-bottom 0.2s both;
    animation: wobble-hor-bottom 0.2s both;
  }

  .buy-button {
    margin: 0px 10px;
    padding: 20px 40px;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    border: none;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    background: #fdc830; /* fallback for old browsers */
    background: -webkit-linear-gradient(
      to top,
      #f37335,
      #fdc830
    ); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(
      to top,
      #f37335,
      #fdc830
    ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }

  .buy-button:hover {
    -webkit-animation: jello-horizontal 0.9s both;
    animation: jello-horizontal 0.9s both;
  }
</style>

<main>
  <h1>
    <strong>MiniTez Store</strong>
  </h1>
  <img src={storeImg} alt="token shop" />
  <h3>
    Own the most minimalistic token on Tezos
    <br />
    and help the creation of more educational content!
  </h3>
  <h4>How many tokens would you like?</h4>
  <div class="token-input-container">
    <input type="number" id="token-input" bind:value={tokenAmount} />
    <br />
    <label for="token-input">
      XTZ {tokenPrice ? calculatePrice(tokenAmount, tokenPrice) : '...'}
    </label>
  </div>
  {#if !userAddress}
    <h4>Connect your wallet</h4>
    <div class="buttons">
      <button on:click={initBeaconWallet}>Beacon</button>
      <button on:click={initTezBridgeWallet}>TezBridge</button>
      <button on:click={initThanosWallet}>Thanos</button>
    </div>
  {:else if userAddress && !loading}
    {#if !successBuy}
      <h4>
        Connected as {userAddress.slice(0, 10) + '...' + userAddress.slice(-10)}
      </h4>
      <button class="buy-button" on:click={buyTokens} disabled={!tokenAmount}>
        Buy!
      </button>
    {:else}
      <h3>
        <strong>Congratulations!</strong>
      </h3>
    {/if}
  {:else if userAddress && loading}
    <h4>
      Processing your payment,
      <br />
      please wait.
    </h4>
    <div id="square4-container">
      <div id="square4">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
    {#if txHash}
      <a
        href={`https://tzkt.io/${txHash}`}
        target="_blank"
        rel="noopener noreferrer">
        <h4>Check the transaction hash</h4>
      </a>
    {/if}
  {/if}
  <!--<a target="_blank" href="https://icons8.com/icons/set/shop--v2">Shop icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>-->
</main>
