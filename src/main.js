/**
 * MouseMind 3D Neural Experiment Lobby Coordinator
 * Coordinates Three.js 3D Brain Engine, Robinhood Chain RPC Telemetry,
 * Biophysical Neurodynamic Coupling, and Subject Alpha Consciousness Stream
 */

import { BrainEngine } from './core/brain_engine.js';
import { RobinhoodTelemetryClient } from './telemetry/rpc_client.js';
import { NeurodynamicCouplingEngine } from './biophysics/neurodynamic_coupling.js';
import { ConsciousnessStreamEngine } from './chat/consciousness_stream.js';

window.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize 3D WebGL Brain Engine
  const brain = new BrainEngine('brain-canvas');

  // 2. Initialize Biophysical Neurodynamic Coupling
  const biophysics = new NeurodynamicCouplingEngine({
    somaCount: 12000
  });

  // 3. Initialize Subject Alpha Cognitive Dialogue Stream
  const chat = new ConsciousnessStreamEngine({
    containerId: 'chat-stream',
    inputId: 'chat-input',
    sendBtnId: 'chat-send-btn',
    onStimulate: (intensity) => {
      brain.triggerOrganoidPulse(intensity);
      biophysics.onchainExcitatoryConductance += intensity * 2.5;
    }
  });

  // 4. Initialize Robinhood Chain Mainnet RPC Telemetry
  const telemetry = new RobinhoodTelemetryClient({
    rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
    contractAddress: '0x6e7c924b9150dDf1Cdb73b58B4285D10cd65690B',
    pollIntervalMs: 3000
  });

  // Wire Onchain Swaps
  telemetry.onSwap((swapData) => {
    biophysics.ingestOnchainTransfer(swapData);
    brain.triggerOnchainSwap(swapData);
    chat.onOnchainSwap(swapData);
  });

  // Wire Block Notifications
  telemetry.onBlock((blockNumber) => {
    brain.triggerOrganoidPulse(1.15);
    const state = biophysics.getTelemetryState();
    chat.updateBiometrics(state.spikeRate, state.calciumDf, blockNumber, state.voltage);
  });

  // Run Real Time Biophysical Simulation Ticks
  setInterval(() => {
    const simResult = biophysics.step(33.0);
    const spikeEl = document.getElementById('val-spike-frequency');
    if (spikeEl) {
      spikeEl.innerText = simResult.spikeRate.toFixed(1) + ' HZ';
    }
    const state = biophysics.getTelemetryState();
    chat.updateBiometrics(state.spikeRate, state.calciumDf, telemetry.latestBlock, state.voltage);
  }, 33);

  // Wire UI Controls
  setupPerspectiveButtons(brain);
  setupLayerToggles(brain);
  setupMicrostimButton(brain, biophysics);

  // Initialize RPC Pipeline
  await telemetry.init();
});

function setupPerspectiveButtons(brain) {
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewName = btn.getAttribute('data-view');
      if (brain.setPerspective) {
        brain.setPerspective(viewName);
      }
    });
  });
}

function setupLayerToggles(brain) {
  const layerBtns = document.querySelectorAll('.atlas-layer-btn');
  layerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const layerName = btn.getAttribute('data-layer');
      const isCurrentlyActive = btn.classList.contains('active');
      const nextActive = !isCurrentlyActive;

      if (nextActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      if (brain.toggleLayer) {
        brain.toggleLayer(layerName, nextActive);
      }
    });
  });
}

function setupMicrostimButton(brain, biophysics) {
  const btn = document.getElementById('btn-microstim');
  if (btn) {
    btn.addEventListener('click', () => {
      brain.triggerOrganoidPulse(1.6);
      biophysics.onchainExcitatoryConductance += 4.0;
    });
  }
}
