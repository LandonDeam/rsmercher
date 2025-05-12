  <script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    interface Item {
      item_ID: number;
      item_name: string;
      icon: string;
      examine: string;
      members: boolean;
      item_value: number;
      lowalch: number | null;
      highalch: number | null;
      ge_limit: number | null;
      buy_price: number;
      sell_price: number;
      profit: number;
      last_updated: number;
      stddev_buy: number;
      stddev_sell: number;
      sources: string | null;
    }

    let items: Item[] = [];
    let searchQuery = '';
    let refreshInterval = setInterval(fetchItems, 60000); // 60 seconds

    onMount(() => {
      fetchItems();
    });

    onDestroy(() => {
      clearInterval(refreshInterval);
    });
    
    type SortField = 'buy_price' | 'sell_price' | 'profit' | 'profitability' | 'last_update' | null;
    type SortDirection = 'asc' | 'desc';

    let sortField: string = 'profit';
    let sortDirection: string = 'desc';

    let loading = false;

    async function fetchItems() {
      loading = true;
      try {
        const res = await fetch(`/api/items`);
        items = await res.json();
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
      loading = false;
    }

    function toggleSort(field: SortField) {
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field ? field : sortField;
        sortDirection = 'asc';
      }
      fetchItems(); // Trigger new fetch
    }

    function getRelativeTime(unixMillis: number): string {
    const now = Date.now(); // Current time in ms
    const diffSeconds = Math.floor((unixMillis - now) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const thresholds: [number, Intl.RelativeTimeFormatUnit][] = [
      [60, 'second'],
      [3600, 'minute'],
      [86400, 'hour'],
      [604800, 'day'],
      [2628000, 'week'],
      [31536000, 'month'],
      [Infinity, 'year']
    ];

    for (let i = 0; i < thresholds.length; i++) {
      const [threshold, unit] = thresholds[i];
      if (Math.abs(diffSeconds) < threshold) {
        const divisor = i === 0 ? 1 : thresholds[i - 1][0];
        return rtf.format(Math.round(diffSeconds / divisor), unit);
      }
    }

    return '';
  }

  type MembershipFilter = 'all' | 'f2p' | 'members';
  let membershipFilter: MembershipFilter = 'all';

  function cycleMembershipFilter() {
    membershipFilter = membershipFilter === 'all'
      ? 'f2p'
      : membershipFilter === 'f2p'
      ? 'members'
      : 'all';
    fetchItems();
  }

  function getMembershipIcon(): string {
    if (membershipFilter === 'f2p') return "https://oldschool.runescape.wiki/images/Free-to-play_icon.png";
    if (membershipFilter === 'members') return "https://oldschool.runescape.wiki/images/Member_icon.png";
    return "";
  }

  $: filteredItems = items
    // Filter by name
    .filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    // Filter by membership
    .filter(item => {
      if (membershipFilter === 'all') return true;
      return membershipFilter === 'members' ? item.members : !item.members;
    })
    // Sort
    .sort((a, b) => {
      let aVal: number, bVal: number;

      if (sortField === 'profitability') {
        aVal = a.profit * (a.ge_limit ?? 1);
        bVal = b.profit * (b.ge_limit ?? 1);
      } else if (sortField === 'last_update') {
        aVal = a.last_updated;
        bVal = b.last_updated;
      } else {
        aVal = a[sortField as keyof Item] as number;
        bVal = b[sortField as keyof Item] as number;
      }

      if (sortDirection === 'asc') return aVal - bVal;
      return bVal - aVal;
    });
  </script>

  <style>
    .page-container {
      position: relative;
      margin: 0;
      padding: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 100vh;
      color: #f2f2f2;
      overflow: hidden;
    }

    h1 {
      padding-left: 15px;
      font-size: 70pt;
      font-family: sans-serif;
    }

    .table-container {
      flex: 1;
      overflow: auto;
      scrollbar-width: none;         /* Firefox */
      -ms-overflow-style: none;      /* IE/Edge */
      max-width: 100vw;
      height: 100%;
    }

    .table-container::-webkit-scrollbar {
      display: none;                 /* Chrome/Safari */
    }

    /* Optional: Remove table min-width if you want it to wrap */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto; /* or 'fixed' if you want equal-width columns */
    }

    thead th {
      position: sticky;
      top: 0;
      background-color: #2b2b3d;
      color: #f2f2f2;
      padding: 0.75rem;
      text-align: left;
      border-bottom: 2px solid #444;
      z-index: 2;
    }

    tbody td {
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #f2f2f2;
    }

    tbody tr {
      background-color: #1e1e2f; /* same as your card base color */
      transition: background-color 0.2s ease;
    }

    tbody tr:hover {
      background-color: #2c2c40;
    }

    .item-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem; /* Adjust spacing here */
    }

    .item-icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .membership-cell {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .item-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-bar {
      padding: 0.5rem 1rem;
      margin: 0.75rem;
      width: 250px;
      font-size: 1rem;
      border-radius: 6px;
      border: 1px solid #444;
      background-color: #1e1e2f;
      color: #f2f2f2;
    }
  </style>

  <svelte:head>
    <title>RS Mercher</title>
  </svelte:head>

  <div class="page-container">

    <h1>RS Mercher</h1>
    {#if loading}
      <p>Loading...</p>
    {/if}

    <div class="table-container">
      <input
        type="text"
        placeholder="Search items..."
        bind:value={searchQuery}
        class="search-bar"
      />
      <table>
        <thead>
          <tr>
            <th class="membership-header" on:click={cycleMembershipFilter}>
              {#if membershipFilter === 'all'}
                All
              {:else}
                <img src={getMembershipIcon()} alt={membershipFilter} class="membership-star" />
              {/if}
            </th>

            <th>Item</th>

            <th on:click={() => toggleSort('buy_price')}>
              Insta Buy {sortField === 'buy_price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>

            <th>Buy Std. Dev</th>

            <th on:click={() => toggleSort('sell_price')}>
              Insta Sell {sortField === 'sell_price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>

            <th>Sell Std. Dev</th>

            <th on:click={() => toggleSort('profit')}>
              Profit {sortField === 'profit' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>

            <th>Limit</th>

            <th on:click={() => toggleSort('profitability')}>
              Profitability {sortField === 'profitability' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>

            <th on:click={() => toggleSort('last_update')}>
              Last Update {sortField === 'last_update' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {#each filteredItems as item}
            <tr>
              <td class="membership-cell">
                <img
                  class="membership-star"
                  src={item.members
                    ? "https://oldschool.runescape.wiki/images/Member_icon.png"
                    : "https://oldschool.runescape.wiki/images/Free-to-play_icon.png"}
                  alt={item.members ? 'Members item' : 'F2P item'}
                />
              </td>
              <td>
                <div class="item-cell">
                  {#if item.icon}
                    <img
                      class="item-icon"
                      src={"https://oldschool.runescape.wiki/images/" + item.icon.replaceAll(" ", "_")}
                      alt={item.item_name}
                    />
                  {:else}
                    <span class="item-icon">🚫</span> <!-- fallback for missing icon -->
                  {/if}
                  <span class="item-name">{item.item_name}</span>
                </div>
              </td>

              <td>{item.buy_price != null ? item.buy_price.toLocaleString() + ' gp' : 'N/A'}</td>

              <td>{item.stddev_buy != null ? item.stddev_buy.toFixed(2) : 'N/A'}</td>

              <td>{item.sell_price != null ? item.sell_price.toLocaleString() + ' gp' : 'N/A'}</td>

              <td>{item.stddev_sell != null ? item.stddev_sell.toFixed(2) : 'N/A'}</td>

              <td>{item.profit != null ? item.profit.toLocaleString() + ' gp' : 'N/A'}</td>

              <td>{item.ge_limit != null ? item.ge_limit : 'Unlimited'}</td>

              <td>
                {item.profit != null && item.ge_limit != null
                  ? (item.profit * item.ge_limit).toLocaleString() + ' gp'
                  : 'N/A'}
              </td>

              <td>
                {item.last_updated
                  ? getRelativeTime(item.last_updated)
                  : 'N/A'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>