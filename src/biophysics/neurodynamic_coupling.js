/**
 * MouseMind Biophysical Neurodynamic Coupling Engine
 * Coupled Hodgkin Huxley Cortical Membrane Dynamics and Optical Calcium Kinetics
 * Driven by Robinhood Chain State Transitions and $MOUSE Token Telemetry
 */

export class NeurodynamicCouplingEngine {
  constructor(options = {}) {
    this.somaCount = options.somaCount || 12000;
    this.membraneCapacitance = 1.0; // uF / cm^2
    this.gNaMax = 120.0; // mS / cm^2
    this.gKMax = 36.0; // mS / cm^2
    this.gLeak = 0.3; // mS / cm^2
    this.gCaMax = 4.2; // L type CaV1.2 conductance

    this.eNa = 50.0; // mV
    this.eK = -77.0; // mV
    this.eLeak = -54.4; // mV
    this.eCa = 120.0; // mV

    // Resting state parameters
    this.vRest = -65.0; // mV
    this.voltage = this.vRest;
    this.m = 0.05;
    this.h = 0.6;
    this.n = 0.32;
    this.caConcentration = 0.08; // uM
    this.caRest = 0.08;
    this.tauCa = 240.0; // ms decay constant for GCaMP8f

    // Timothy syndrome channelopathy mode CACNA1C G406R
    this.timothySyndromeActive = true;
    this.gatingImpairmentFactor = 0.42;

    // Simulation timing
    this.dt = 0.05; // ms integration step
    this.timeMs = 0;
    this.instantaneousSpikeRate = 18.4; // Hz
    this.calciumDf = 0.38; // Delta F over F0

    // Onchain stimulus buffer
    this.onchainExcitatoryConductance = 0.0;
    this.lastTransactionVolume = 0.0;
    this.lastBlockHeight = 0;
    this.cumulativeSpikes = 0;

    // Connectome topological clusters
    this.clusters = {
      somatosensorySpheroid: { somata: 4800, meanDepthMm: 1.4 },
      parietalXenograft: { somata: 4200, meanDepthMm: 2.1 },
      callosalAxonalLattice: { somata: 3000, meanDepthMm: 4.2 }
    };
  }

  alphaM(v) {
    const num = 0.1 * (v + 40.0);
    const den = 1.0 - Math.exp(-0.1 * (v + 40.0));
    return Math.abs(den) < 1e-6 ? 1.0 : num / den;
  }

  betaM(v) {
    return 4.0 * Math.exp(-0.0556 * (v + 65.0));
  }

  alphaH(v) {
    return 0.07 * Math.exp(-0.05 * (v + 65.0));
  }

  betaH(v) {
    return 1.0 / (1.0 + Math.exp(-0.1 * (v + 35.0)));
  }

  alphaN(v) {
    const num = 0.01 * (v + 55.0);
    const den = 1.0 - Math.exp(-0.1 * (v + 55.0));
    return Math.abs(den) < 1e-6 ? 0.1 : num / den;
  }

  betaN(v) {
    return 0.125 * Math.exp(-0.0125 * (v + 65.0));
  }

  /**
   * Translates Robinhood Chain swap volume into excitatory synaptic conductance
   */
  ingestOnchainTransfer(transferData) {
    const rawVolume = transferData.amountRaw || 1000.0;
    this.lastTransactionVolume = rawVolume;
    this.lastBlockHeight = transferData.blockNumber || this.lastBlockHeight;

    // Logarithmic scaling for synaptic influx
    const volumeModulation = Math.log10(Math.max(10.0, rawVolume));
    const isWhale = transferData.type === 'WHALE SWAP';
    const stimulusMultiplier = isWhale ? 3.5 : 1.5;

    this.onchainExcitatoryConductance += volumeModulation * stimulusMultiplier * 0.45;
  }

  /**
   * Runge Kutta 4th Order / Forward Euler numerical step
   */
  step(deltaMs = 16.0) {
    const subSteps = Math.max(1, Math.floor(deltaMs / this.dt));
    let spikeDetected = false;

    for (let s = 0; s < subSteps; s++) {
      const v = this.voltage;

      // Inactivation kinetics adjustment under CACNA1C G406R mutation
      let effectiveBetaH = this.betaH(v);
      if (this.timothySyndromeActive) {
        effectiveBetaH *= this.gatingImpairmentFactor;
      }

      // Gate derivatives
      const dm = this.alphaM(v) * (1.0 - this.m) - this.betaM(v) * this.m;
      const dh = this.alphaH(v) * (1.0 - this.h) - effectiveBetaH * this.h;
      const dn = this.alphaN(v) * (1.0 - this.n) - this.betaN(v) * this.n;

      this.m += dm * this.dt;
      this.h += dh * this.dt;
      this.n += dn * this.dt;

      // Currents
      const iNa = this.gNaMax * Math.pow(this.m, 3) * this.h * (v - this.eNa);
      const iK = this.gKMax * Math.pow(this.n, 4) * (v - this.eK);
      const iLeak = this.gLeak * (v - this.eLeak);

      // Onchain current transduction
      const iOnchain = this.onchainExcitatoryConductance * (v - 0.0); // Excitatory reversal at 0 mV

      // Intrinsic baseline noise simulating in vivo murine thalamocortical inputs
      const iStochastic = (Math.random() - 0.48) * 8.5;

      const dv = (-iNa - iK - iLeak - iOnchain + iStochastic) / this.membraneCapacitance;
      this.voltage += dv * this.dt;

      // Check action potential threshold
      if (this.voltage > 20.0 && v <= 20.0) {
        spikeDetected = true;
        this.cumulativeSpikes++;
        this.caConcentration += 0.28; // Action potential calcium influx
      }

      // Calcium extrusion kinetics
      const dCa = (-(this.caConcentration - this.caRest) / this.tauCa) * this.dt;
      this.caConcentration = Math.max(this.caRest, this.caConcentration + dCa);

      // Synaptic decay
      this.onchainExcitatoryConductance *= 0.998;
      this.timeMs += this.dt;
    }

    // GCaMP8f optical fluorescence Hill function
    const hillKd = 0.35;
    const hillN = 2.4;
    const maxDf = 2.8;
    const caRatio = Math.pow(this.caConcentration, hillN);
    this.calciumDf = (maxDf * caRatio) / (Math.pow(hillKd, hillN) + caRatio);

    // Compute smoothed population firing rate
    const targetSpikeRate = spikeDetected 
      ? 22.0 + Math.random() * 14.0 
      : 15.0 + Math.random() * 5.0 + this.onchainExcitatoryConductance * 1.8;
    this.instantaneousSpikeRate = this.instantaneousSpikeRate * 0.92 + targetSpikeRate * 0.08;

    return {
      voltage: this.voltage,
      spikeRate: this.instantaneousSpikeRate,
      calciumDf: this.calciumDf,
      spikeFired: spikeDetected,
      conductance: this.onchainExcitatoryConductance
    };
  }

  getTelemetryState() {
    return {
      somaCount: this.somaCount,
      voltage: this.voltage.toFixed(1),
      spikeRate: this.instantaneousSpikeRate.toFixed(1),
      calciumDf: this.calciumDf.toFixed(2),
      channelState: this.timothySyndromeActive ? 'CACNA1C G406R Active' : 'Wild Type',
      cumulativeSpikes: this.cumulativeSpikes,
      lastTxVolume: this.lastTransactionVolume
    };
  }
}
