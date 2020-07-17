<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { Tezos } from "@taquito/taquito";
  import { TezBridgeWallet } from "@taquito/tezbridge-wallet";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { ThanosWallet } from "@thanos-wallet/dapp";
  import Navigation from "./components/Navigation/Navigation.svelte";
  import Store from "./components/Store/Store.svelte";
  import Transfer from "./components/Transfer/Transfer.svelte";

  const storeAddress = "KT1SVmTS2UH9ffbPYbmgLG2hArSH6HT123Ra";
  const miniTezAddress = "KT1URhAn8GHBy9Jjtd12CZve81uCERWwWPsb";
  let userAddress = undefined;
  let currentPage = "store";

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

  onMount(async () => {
    Tezos.setProvider({ rpc: "http://localhost:8732" });
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

  footer {
    position: absolute;
    bottom: 5px;
    left: 5px;
    width: 99vw;
    font-size: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  footer a {
    text-decoration: none;
    color: inherit;
  }
</style>

<main>
  <Navigation
    on:navToStore={() => (currentPage = 'store')}
    on:navToTransfer={() => (currentPage = 'transfer')} />
  {#if currentPage === 'store'}
    <Store
      {Tezos}
      {initTezBridgeWallet}
      {initBeaconWallet}
      {initThanosWallet}
      {userAddress}
      {storeAddress} />
  {:else if currentPage === 'transfer'}
    <Transfer
      {Tezos}
      {initTezBridgeWallet}
      {initBeaconWallet}
      {initThanosWallet}
      {userAddress}
      {miniTezAddress} />
  {/if}
</main>
<footer>
  <div>Claude Barde :: 2020</div>
  <div>
    <a target="_blank" href="https://icons8.com">Icons by Icons8</a>
  </div>
</footer>
