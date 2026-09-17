/**
 * MouseMind Robinhood Chain RPC Telemetry Engine
 * Direct JSON RPC connector for Robinhood Chain Mainnet (Chain ID: 4663)
 * Target Contract: $MOUSE (0x6e7c924b9150dDf1Cdb73b58B4285D10cd65690B)
 */

export class RobinhoodTelemetryClient {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || 'https://rpc.mainnet.chain.robinhood.com';
    this.contractAddress = (config.contractAddress || '0x6e7c924b9150dDf1Cdb73b58B4285D10cd65690B').toLowerCase();
    this.chainId = 4663;
    this.latestBlock = 0;
    this.lastProcessedBlock = 0;
    this.gasPriceGwei = '0.10';
    this.latencyMs = 0;
    this.pollIntervalMs = config.pollIntervalMs || 3000;
    this.isPolling = false;
    this.pollTimer = null;

    this.onBlockCallbacks = [];
    this.onSwapCallbacks = [];
    this.seenLogKeys = new Set();

    this.tokenMetadata = {
      name: 'MouseMind',
      symbol: '$MOUSE',
      decimals: 18,
      totalSupply: '1,000,000,000'
    };

    this.transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  }

  onBlock(cb) {
    if (typeof cb === 'function') this.onBlockCallbacks.push(cb);
  }

  onSwap(cb) {
    if (typeof cb === 'function') this.onSwapCallbacks.push(cb);
  }

  async init() {
    this.bindCopyUi();
    await this.fetchContractMetadata();
    await this.fetchRecentOnchainTransfers();
    this.startPolling();
  }

  bindCopyUi() {
    const copyBtn = document.getElementById('btn-copy-ca');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('0x6e7c924b9150dDf1Cdb73b58B4285D10cd65690B');
          const span = copyBtn.querySelector('span') || copyBtn;
          const orig = span.innerText;
          span.innerText = 'COPIED!';
          setTimeout(() => {
            span.innerText = orig;
          }, 2000);
        } catch (e) {
          console.warn('Copy failure', e);
        }
      });
    }
  }

  async sendRpc(method, params = []) {
    const startTime = performance.now();
    try {
      const res = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now()
        })
      });
      const endTime = performance.now();
      this.latencyMs = Math.round(endTime - startTime);
      const payload = await res.json();
      return payload.result;
    } catch (err) {
      this.latencyMs = Math.round(performance.now() - startTime);
      throw err;
    }
  }

  async fetchContractMetadata() {
    try {
      const [rawName, rawSymbol, rawDecimals, rawSupply] = await Promise.all([
        this.sendRpc('eth_call', [{ to: this.contractAddress, data: '0x06fdde03' }, 'latest']).catch(() => null),
        this.sendRpc('eth_call', [{ to: this.contractAddress, data: '0x95d89b41' }, 'latest']).catch(() => null),
        this.sendRpc('eth_call', [{ to: this.contractAddress, data: '0x313ce567' }, 'latest']).catch(() => null),
        this.sendRpc('eth_call', [{ to: this.contractAddress, data: '0x18160ddd' }, 'latest']).catch(() => null)
      ]);

      if (rawName) this.tokenMetadata.name = this.decodeAbiString(rawName) || 'MouseMind';
      if (rawSymbol) this.tokenMetadata.symbol = '$' + (this.decodeAbiString(rawSymbol) || 'MOUSE');
      if (rawDecimals) this.tokenMetadata.decimals = parseInt(rawDecimals, 16) || 18;
      if (rawSupply) {
        const supplyBn = BigInt(rawSupply);
        const divisor = BigInt(10) ** BigInt(this.tokenMetadata.decimals);
        const formatted = (supplyBn / divisor).toString();
        this.tokenMetadata.totalSupply = this.formatWithCommas(formatted);
      }

      this.updateTokenUi();
    } catch (err) {
      console.warn('Metadata resolution fallback', err);
      this.updateTokenUi();
    }
  }

  decodeAbiString(hex) {
    if (!hex || hex === '0x') return '';
    try {
      const raw = hex.replace(/^0x/, '');
      if (raw.length < 128) return '';
      const lenHex = raw.substring(64, 128);
      const strLen = parseInt(lenHex, 16);
      const bytesHex = raw.substring(128, 128 + strLen * 2);
      let output = '';
      for (let i = 0; i < bytesHex.length; i += 2) {
        const charCode = parseInt(bytesHex.substring(i, i + 2), 16);
        if (charCode > 0) output += String.fromCharCode(charCode);
      }
      return output.trim();
    } catch {
      return '';
    }
  }

  formatWithCommas(valStr) {
    return valStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async fetchRecentOnchainTransfers() {
    try {
      const rawBlock = await this.sendRpc('eth_blockNumber');
      if (!rawBlock) return;
      this.latestBlock = parseInt(rawBlock, 16);
      this.lastProcessedBlock = Math.max(0, this.latestBlock - 3500);

      const fromBlock = '0x' + this.lastProcessedBlock.toString(16);
      const logs = await this.sendRpc('eth_getLogs', [{
        address: this.contractAddress,
        topics: [this.transferTopic],
        fromBlock,
        toBlock: 'latest'
      }]);

      if (Array.isArray(logs) && logs.length > 0) {
        const recentLogs = logs.slice(-12);
        recentLogs.forEach(log => this.processTransfer(log, false));
        this.lastProcessedBlock = this.latestBlock;
      }

      this.updateHeaderUi();
    } catch (err) {
      console.warn('Historical transfer query issue', err);
    }
  }

  startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    const pollLoop = async () => {
      try {
        const [rawBlock, rawGas] = await Promise.all([
          this.sendRpc('eth_blockNumber'),
          this.sendRpc('eth_gasPrice').catch(() => '0x5f5e100')
        ]);

        if (rawBlock) {
          const currentHeight = parseInt(rawBlock, 16);
          if (currentHeight > this.latestBlock) {
            this.latestBlock = currentHeight;
            this.onBlockCallbacks.forEach(cb => cb(currentHeight));

            const fromBlockHex = '0x' + Math.max(0, this.lastProcessedBlock).toString(16);
            const logs = await this.sendRpc('eth_getLogs', [{
              address: this.contractAddress,
              topics: [this.transferTopic],
              fromBlock: fromBlockHex,
              toBlock: 'latest'
            }]).catch(() => []);

            if (Array.isArray(logs) && logs.length > 0) {
              logs.forEach(log => this.processTransfer(log, true));
            }
            this.lastProcessedBlock = currentHeight;
          }
        }

        if (rawGas) {
          const gasWei = BigInt(rawGas);
          const gasGwei = Number(gasWei) / 1e9;
          this.gasPriceGwei = gasGwei.toFixed(2);
        }

        this.updateHeaderUi();
      } catch (err) {
        console.warn('Polling iteration warning', err);
      }

      if (this.isPolling) {
        this.pollTimer = setTimeout(pollLoop, this.pollIntervalMs);
      }
    };

    pollLoop();
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  processTransfer(log, isLive = false) {
    const key = log.transactionHash + log.logIndex;
    if (this.seenLogKeys.has(key)) return;
    this.seenLogKeys.add(key);

    const fromAddress = '0x' + log.topics[1].substring(26);
    const toAddress = '0x' + log.topics[2].substring(26);
    const rawVal = BigInt(log.data);
    const tokenVal = Number(rawVal / BigInt(1e14)) / 10000;
    const formattedAmount = tokenVal > 1000 ? Math.round(tokenVal).toLocaleString() : tokenVal.toFixed(2);

    const isBurn = toAddress.toLowerCase() === '0x0000000000000000000000000000000000000000';
    const classification = isBurn ? 'BURN' : tokenVal > 500000 ? 'WHALE SWAP' : 'TRANSFER';

    const swapRecord = {
      blockNumber: parseInt(log.blockNumber, 16),
      type: classification,
      amountFormatted: '+' + formattedAmount,
      amountRaw: tokenVal,
      fromShort: fromAddress.substring(0, 6) + '...' + fromAddress.substring(fromAddress.length - 4),
      toShort: toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 4),
      txShort: log.transactionHash.substring(0, 8) + '...' + log.transactionHash.substring(log.transactionHash.length - 6),
      txHash: log.transactionHash,
      symbol: this.tokenMetadata.symbol,
      isLive
    };

    this.renderSwapRow(swapRecord);

    if (isLive) {
      this.onSwapCallbacks.forEach(cb => cb(swapRecord));
    }
  }

  renderSwapRow(swap) {
    const streamContainer = document.getElementById('swaps-stream');
    if (!streamContainer) return;

    const row = document.createElement('div');
    row.className = 'swap-row' + (swap.isLive ? ' new-pulse' : '');

    const badgeClass = swap.type === 'WHALE SWAP' ? 'badge-whale' : 'badge-swap';

    row.innerHTML = `
      <div class="swap-left">
        <span class="swap-type ${badgeClass}">${swap.type}</span>
        <span class="swap-amount">${swap.amountFormatted} ${swap.symbol}</span>
      </div>
      <div class="swap-addresses mono">
        <span>${swap.fromShort} → ${swap.toShort}</span>
      </div>
      <div class="swap-right mono">
        <span class="swap-block">BLOCK ${swap.blockNumber}</span>
        <span class="swap-tx" title="${swap.txHash}">${swap.txShort}</span>
      </div>
    `;

    if (streamContainer.firstChild) {
      streamContainer.insertBefore(row, streamContainer.firstChild);
    } else {
      streamContainer.appendChild(row);
    }

    while (streamContainer.children.length > 30) {
      streamContainer.removeChild(streamContainer.lastChild);
    }
  }

  updateHeaderUi() {
    const blockEl = document.getElementById('val-block-height');
    if (blockEl && this.latestBlock > 0) {
      blockEl.innerText = this.formatWithCommas(this.latestBlock.toString());
    }

    const latEl = document.getElementById('val-rpc-latency');
    if (latEl) latEl.innerText = this.latencyMs + ' MS';

    const gasEl = document.getElementById('val-gas-price');
    if (gasEl) gasEl.innerText = this.gasPriceGwei + ' GWEI';
  }

  updateTokenUi() {
    const nameEl = document.getElementById('val-token-name');
    if (nameEl) nameEl.innerText = this.tokenMetadata.name;

    const symEl = document.getElementById('val-token-symbol');
    if (symEl) symEl.innerText = this.tokenMetadata.symbol;

    const supEl = document.getElementById('val-total-supply');
    if (supEl) supEl.innerText = this.tokenMetadata.totalSupply;
  }
}
