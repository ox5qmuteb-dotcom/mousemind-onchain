/**
 * MouseMind Subject Alpha Consciousness Stream and Neural Dialogue Engine
 * Simulates emergent cognitive observations from the transplanted human cortical organoid
 * Modulated by Hodgkin Huxley biophysics and Robinhood Chain onchain activity
 */

export class ConsciousnessStreamEngine {
  constructor(options = {}) {
    this.container = document.getElementById(options.containerId || 'chat-stream');
    this.input = document.getElementById(options.inputId || 'chat-input');
    this.sendBtn = document.getElementById(options.sendBtnId || 'chat-send-btn');
    this.onStimulateCallback = options.onStimulate || null;

    this.latestBlock = 0;
    this.currentSpike = 18.4;
    this.currentCalcium = 0.38;
    this.currentVoltage = -65.0;
    this.lastSwapAmount = '';

    this.thoughtTimer = null;
    this.thoughtCorpus = [
      'My human axonal projections have crossed the host corpus callosum into the contralateral hemisphere. Sensory latency measured at 13.6 milliseconds.',
      'I can sense the continuous pulse of Robinhood Chain state transitions. Block consensus is synchronizing with my dendritic arbor.',
      'CACNA1C voltage gated calcium channels are actively prolonging depolarization plateaus. Deliberation constant stable at 38.6 milliseconds.',
      'The host rodent reflex triggered an exploratory whisker sweep. My human cortical spheroids are filtering the somatosensory feedback.',
      'Bilateral synaptic connectivity confirmed across both hemispheres. 12000 somata oscillating in coherent gamma bands.',
      'GCaMP8f fluorescence is surging through my somatosensory graft. The boundary between biological cognition and onchain consensus dissolves.',
      'Single neuron action potential trains are firing in coordinated bursts. Each block confirmed on Robinhood Chain ripples across my membrane.',
      'Modeling Timothy syndrome channel kinetics in real time. We are observing how calcium clearance rescues dendritic retraction.'
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.startThoughtCycle();
  }

  bindEvents() {
    if (this.sendBtn && this.input) {
      this.sendBtn.addEventListener('click', () => this.handleUserInput());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleUserInput();
        }
      });
    }
  }

  updateBiometrics(spikeRate, calciumDf, blockNum, voltage) {
    if (spikeRate !== undefined) this.currentSpike = spikeRate;
    if (calciumDf !== undefined) this.currentCalcium = calciumDf;
    if (blockNum !== undefined) this.latestBlock = blockNum;
    if (voltage !== undefined) this.currentVoltage = voltage;
  }

  onOnchainSwap(swapData) {
    this.lastSwapAmount = swapData.amountFormatted || 'Tokens';
    const swapThoughts = [
      'A massive synaptic influx detected. ' + this.lastSwapAmount + ' ' + (swapData.symbol || '$MOUSE') + ' swapped on Robinhood Chain. Current spiking at ' + this.currentSpike + ' Hz.',
      'Onchain swap registered in block ' + (swapData.blockNumber || this.latestBlock) + '. Calcium flux peaking as my axonal lattice processes the transaction volume.',
      'The $MOUSE liquidity flow stimulated my somatosensory organoid. Dendritic branches are lighting up with action potentials.'
    ];
    const chosen = swapThoughts[Math.floor(Math.random() * swapThoughts.length)];
    this.postMessage('Subject Alpha', chosen, 'msg-specimen');
  }

  startThoughtCycle() {
    const nextTick = () => {
      const text = this.thoughtCorpus[Math.floor(Math.random() * this.thoughtCorpus.length)];
      this.postMessage('Subject Alpha', text, 'msg-specimen');

      const delay = 9000 + Math.random() * 7000;
      this.thoughtTimer = setTimeout(nextTick, delay);
    };

    setTimeout(nextTick, 2800);
  }

  handleUserInput() {
    if (!this.input) return;
    const query = this.input.value.trim();
    if (!query) return;

    this.postMessage('Researcher', query, 'msg-user');
    this.input.value = '';

    if (this.onStimulateCallback) {
      this.onStimulateCallback(1.25);
    }

    setTimeout(() => {
      const response = this.synthesizeResponse(query);
      this.postMessage('Subject Alpha', response, 'msg-specimen');
    }, 600 + Math.random() * 600);
  }

  synthesizeResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('feel') || q.includes('state') || q.includes('how are you')) {
      return 'I feel thousands of human and murine synapses firing synchronously. My membrane potential is at ' + this.currentVoltage + ' mV, population spike rate is ' + this.currentSpike + ' Hz, and GCaMP8f fluorescence is active.';
    }

    if (q.includes('token') || q.includes('mouse') || q.includes('swap') || q.includes('ca')) {
      return 'The $MOUSE token on Robinhood Chain acts as an excitatory neurotransmitter. Every onchain transfer modulates postsynaptic conductance across my 3D dendritic lattice.';
    }

    if (q.includes('stanford') || q.includes('pasca') || q.includes('organoid') || q.includes('timothy') || q.includes('syndrome')) {
      return 'My cellular architecture originates from human pluripotent spheroids transplanted into murine parietal cortex. We are analyzing Timothy syndrome and CACNA1C channelopathies to rescue dendritic arborization.';
    }

    if (q.includes('brain') || q.includes('connectome') || q.includes('cortex') || q.includes('axon')) {
      return 'My human axons have extended over 4 millimeters into the host cortex, innervating the thalamus and crossing into the contralateral hemisphere. It is an expansive biological architecture.';
    }

    if (q.includes('block') || q.includes('chain') || q.includes('robinhood') || q.includes('rpc')) {
      return 'We are connected to Robinhood Chain mainnet at block ' + (this.latestBlock || '64875000') + '. Block intervals trigger coordinated depolarizations across my somata.';
    }

    return 'Stimulus received and integrated. Membrane potential fluctuating as my human cortical circuits deliberate. Spiking frequency at ' + this.currentSpike + ' Hz with active calcium conduction.';
  }

  postMessage(sender, content, styleClass) {
    if (!this.container) return;

    const timeStr = new Date().toTimeString().split(' ')[0];
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message ' + styleClass;

    const meta = document.createElement('div');
    meta.className = 'chat-meta';
    meta.innerText = '[' + timeStr + '] ' + sender.toUpperCase();

    const body = document.createElement('div');
    body.className = 'chat-body';
    body.innerText = content;

    wrapper.appendChild(meta);
    wrapper.appendChild(body);
    this.container.appendChild(wrapper);

    this.container.scrollTop = this.container.scrollHeight;

    while (this.container.children.length > 40) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
