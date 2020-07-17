<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";

  const dispatch = createEventDispatcher();

  let open = false;
</script>

<style>
  .navigation {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .nav-icon {
    cursor: pointer;
  }

  .nav-menu {
    background-color: white;
    padding: 10px 20px;
    border-radius: 5px;
    color: #50c9c3;
    margin-top: 20px;
    font-weight: bold;
    text-align: left;
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: #50c9c3;
  }
</style>

<div class="navigation">
  {#if open}
    <div on:click={() => (open = false)} style="text-align:right">
      <span class="fas fa-times fa-2x nav-icon" />
    </div>
    <div
      class="nav-menu"
      transition:fly={{ duration: 500, x: 200 }}
      on:mouseleave={() => (open = false)}>
      <p on:click={() => dispatch('navToStore')}>
        <span class="fas fa-store" />
        Store
      </p>
      <p on:click={() => dispatch('navToTransfer')}>
        <i class="fas fa-exchange-alt" />
        Transfer
      </p>
      <p>
        <i class="fas fa-chalkboard-teacher" />
        Tutorial
      </p>
      <p>
        <a
          href="https://github.com/claudebarde/minitez"
          target="_blank"
          rel="noopener noreferrer">
          <i class="fab fa-github" />
          Github
        </a>
      </p>
    </div>
  {:else}
    <div on:click={() => (open = true)} in:fade={{ delay: 500 }}>
      <span class="fas fa-bars fa-2x nav-icon" />
    </div>
  {/if}
</div>
