<script>
  export let storeInstance;

  let contractAddress = "";
  let loading = false;
  let hide = false;

  const updateContract = async () => {
    loading = true;
    try {
      const op = await storeInstance.methods
        .updateContract(contractAddress)
        .send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    } finally {
      loading = false;
    }
  };

  const withdraw = async () => {
    loading = true;
    try {
      const op = await storeInstance.methods.withdraw([["unit"]]).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    } finally {
      loading = false;
    }
  };
</script>

<style>
  .main {
    margin-top: 30px;
  }

  .field {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
  }
</style>

{#if !hide}
  <div class="main">
    <div class="field">
      <button on:click={() => (hide = true)}>Hide</button>
    </div>
    <div class="field">
      <label for="change-contract-address">Update Contract</label>
      <input
        type="text"
        id="change-contract-address"
        bind:value={contractAddress} />
      <button disabled={loading} on:click={updateContract}>Confirm</button>
    </div>
    <div class="field">
      <button on:click={withdraw} disabled={loading}>Withdraw</button>
    </div>
  </div>
{/if}
