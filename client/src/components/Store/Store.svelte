<script>
  import { onMount, afterUpdate } from "svelte";
  import { fly } from "svelte/transition";
  import storeImg from "../../../public/shop.png";
  import Admin from "../Admin/Admin.svelte";

  export let Tezos,
    initTezBridgeWallet,
    initBeaconWallet,
    initThanosWallet,
    userAddress,
    storeAddress,
    isMobile;

  $: if (userAddress) {
    // check if user is owner
    storeInstance
      .storage()
      .then(storage => {
        if (storage.owner === userAddress) {
          isOwner = true;
        }
      })
      .catch(error => console.log(error));
  }

  let tokenAmount = "";
  let storeInstance = undefined;
  let tokenPrice = undefined;
  let loading = false;
  let txHash = undefined;
  let successBuy = false;
  let isOwner = false;

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

  const buyTokens = async () => {
    if (tokenAmount && tokenPrice) {
      loading = true;
      try {
        const op = await storeInstance.methods
          .buy(tokenAmount)
          .send({ amount: tokenAmount * (tokenPrice * 1000000), mutez: true });
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

  onMount(() => {
    // the parent component needs a little delay to set Tezos properly
    setTimeout(async () => {
      if (Tezos && storeAddress && !tokenPrice) {
        try {
          storeInstance = await Tezos.wallet.at(storeAddress);
          const storage = await storeInstance.storage();
          tokenPrice = storage.price.toNumber() / 1000000;
        } catch (error) {
          console.log(error);
        }
      }
    }, 500);
  });
</script>

<style>
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
</style>

<div class="main" in:fly={{ x: -1000, duration: 1000 }}>
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
    <input
      type="number"
      id="token-input"
      bind:value={tokenAmount}
      placeholder="Amount of tokens" />
    <br />
    <label for="token-input">
      XTZ {tokenPrice ? calculatePrice(tokenAmount, tokenPrice) : '...'}
    </label>
  </div>
  {#if !userAddress}
    <h4>Connect your wallet</h4>
    <div class="buttons">
      {#if isMobile}
        <button on:click={initTezBridgeWallet}>TezBridge</button>
      {:else}
        <button on:click={initBeaconWallet}>Beacon</button>
        <button on:click={initTezBridgeWallet}>TezBridge</button>
        <button on:click={initThanosWallet}>Thanos</button>
      {/if}
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
  {#if isOwner}
    <Admin {storeInstance} />
  {/if}
</div>
