<script>
  import { onMount, afterUpdate } from "svelte";
  import { fly } from "svelte/transition";
  import transferImg from "../../../public/money-transfer.png";

  export let Tezos,
    initTezBridgeWallet,
    initBeaconWallet,
    initThanosWallet,
    userAddress,
    miniTezAddress;

  let tokensToTransfer = "";
  let transferTokensto = "";
  let successTransfer = false;
  let loading = false;
  let txHash, miniTez, userTokenBalance;

  const transferTokens = async () => {
    // tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6
    // checks if user has enough balance
    if (!!userTokenBalance && userTokenBalance.toNumber() >= tokensToTransfer) {
      loading = true;
      try {
        const op = await miniTez.methods
          .main(transferTokensto, tokensToTransfer)
          .send();
        txHash = op.opHash;
        await op.confirmation();
        successTransfer = true;
        window.confetti.start();
        // updates user's balance
        const storage = await miniTez.storage();
        userTokenBalance = await storage.get(userAddress);
        setTimeout(async () => {
          // resets UI
          successTransfer = false;
          tokensToTransfer = "";
          transferTokensto = "";
          txHash = undefined;
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
    // the parent component needs a little delay to set Tezos properly
    setTimeout(async () => {
      try {
        miniTez = await Tezos.wallet.at(miniTezAddress);
        if (userAddress) {
          const storage = await miniTez.storage();
          userTokenBalance = await storage.get(userAddress);
        }
      } catch (error) {
        console.log(error);
      }
    }, 500);
  });

  afterUpdate(async () => {
    if (userAddress && !userTokenBalance && miniTez) {
      // checks user's token balance
      try {
        const storage = await miniTez.storage();
        userTokenBalance = await storage.get(userAddress);
      } catch (error) {
        console.log(error);
      }
    }
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
</style>

<div class="main" in:fly={{ x: 1000, duration: 1000 }}>
  <h1>
    <strong>MiniTez Transfer</strong>
  </h1>
  <img src={transferImg} alt="token transfer" />
  <h3>Transfer your tokens to another address!</h3>
  <div class="token-input-container">
    <h4>How many tokens do you want to transfer?</h4>
    <input
      type="number"
      id="token-transfer"
      bind:value={tokensToTransfer}
      placeholder="Tokens to transfer" />
    <br />
    <label for="token-input" style="font-size:0.8rem">
      {#if !userAddress}
        Connect your wallet to know your balance
      {:else if userAddress && !userTokenBalance}
        No balance
      {:else}
        Your balance: {userTokenBalance.toNumber().toLocaleString('en-US')}
        miniTez
      {/if}
    </label>
    <br />
    <h4>Enter the address of the recipient</h4>
    <input
      type="text"
      id="recipient-input"
      bind:value={transferTokensto}
      placeholder="Recipient's address" />
  </div>
  {#if !userAddress}
    <h4>Connect your wallet</h4>
    <div class="buttons">
      <button on:click={initBeaconWallet}>Beacon</button>
      <button on:click={initTezBridgeWallet}>TezBridge</button>
      <button on:click={initThanosWallet}>Thanos</button>
    </div>
  {:else if userAddress && !loading}
    {#if !successTransfer}
      <h4>
        Connected as {userAddress.slice(0, 10) + '...' + userAddress.slice(-10)}
      </h4>
      <button
        class="transfer-button"
        on:click={transferTokens}
        disabled={!tokensToTransfer}>
        Transfer
      </button>
    {:else}
      <h3>
        <strong>Congratulations!</strong>
      </h3>
    {/if}
  {:else if userAddress && loading}
    <h4>
      Processing your transfer,
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
</div>
