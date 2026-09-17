# MouseMind Onchain

### Autonomous 3D Biophysical Xenocortex Simulation and Robinhood Chain Consensus Coupling

```
  +========================================================================+
  |                          MOUSEMIND ONCHAIN                             |
  |             Autonomous Chimeric Brain Biophysics Engine                |
  +========================================================================+
                                      |
         [ Robinhood Chain Mainnet JSON RPC Client (Chain ID 4663) ]
                                      |
                        eth_getLogs (ERC20 Transfer)
                                      v
          +=======================================================+
          |         Onchain Neurodynamic Transduction Layer       |
          |       Volume Modulation ==> Synaptic Conductance      |
          +=======================================================+
                                      |
                                      v
          +=======================================================+
          |         Biophysical Hodgkin Huxley Integrator         |
          |      CACNA1C G406R L Type Calcium Channel Kinetics    |
          |         GCaMP8f Delta F / F0 Optical Fluoresence      |
          +=======================================================+
                    /                                   \
                   v                                     v
  +================================+   +==================================+
  |    Three.js 3D WebGL Engine    |   |     Subject Alpha Consciousness  |
  |  12000 Somata Crystalline Hull |   |    Continuous Emergent Monologue |
  |  Catmull Rom Axon Connectome   |   |   Interactive Cognitive Terminal |
  +================================+   +==================================+
```

## Smart Contract Attestation

The MouseMind Onchain simulation is deterministically coupled to the verified $MOUSE token contract deployed on Robinhood Chain Mainnet:

```
Token Name:                  MouseMind
Token Symbol:                $MOUSE
Decimals:                    18
Total Supply:                1,000,000,000 MOUSE
Network Name:                Robinhood Chain Mainnet
Chain ID:                    4663
Settlement Type:             Arbitrum Orbit Layer 2 Rollup
Native Gas Asset:            ETH
Mainnet RPC Endpoint:        https://rpc.mainnet.chain.robinhood.com
Verified Contract Address:   0x6e7c924b9150ddf1cdb73b58b4285d10cd65690b
Checksum Contract Address:   0x6e7c924b9150dDf1Cdb73b58B4285D10cd65690B
ERC20 Transfer Topic:        0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Overview

MouseMind Onchain is an open source scientific visualization platform and neurodynamic simulation engine. It establishes a direct computational pipeline between state transitions on Robinhood Chain and an in silico biophysical model of a chimeric human cortical organoid xenograft (designated Subject Alpha).

Incoming token transfers and liquidity swaps executed against smart contract `0x6e7c924b9150ddf1cdb73b58b4285d10cd65690b` are ingested directly from Robinhood Chain consensus nodes. The engine transduces transaction volumes into excitatory synaptic conductances, driving membrane depolarizations across 12000 simulated human somata, triggering Catmull Rom axonal action potential bursts, and computing continuous GCaMP8f optical calcium transients.

## Biophysical Mathematical Formulation

### 1. Membrane Dynamics and Voltage Gated Conductance

Membrane potential trajectories are resolved via numerical integration of extended Hodgkin Huxley equations incorporating onchain synaptic current injections:

$$C_m \frac{dV}{dt} = I_{ext} + I_{onchain} - \bar{g}_{Na} m^3 h (V - E_{Na}) - \bar{g}_K n^4 (V - E_K) - \bar{g}_L (V - E_L)$$

Electrophysiological constants:
* $C_m = 1.0 \, \mu\text{F}/\text{cm}^2$ (Specific membrane capacitance)
* $\bar{g}_{Na} = 120.0 \, \text{mS}/\text{cm}^2$, $E_{Na} = +50.0 \, \text{mV}$ (Transient sodium conduction)
* $\bar{g}_K = 36.0 \, \text{mS}/\text{cm}^2$, $E_K = -77.0 \, \text{mV}$ (Delayed rectifier potassium conduction)
* $\bar{g}_L = 0.3 \, \text{mS}/\text{cm}^2$, $E_L = -54.4 \, \text{mV}$ (Leak channel conduction)

### 2. CACNA1C G406R Gain of Function Channelopathy

Subject Alpha incorporates molecular kinetics corresponding to Timothy syndrome (CACNA1C G406R mutation), which impairs voltage dependent inactivation of L type CaV1.2 calcium channels:

$$\frac{dh}{dt} = \alpha_h(V)(1 - h) - \beta_h(V) \cdot \kappa \cdot h$$

Where $\kappa = 0.42$ denotes the channel inactivation inhibition coefficient. This preserves prolonged calcium entry plateaus and sustains single neuron deliberation intervals across 38.6 millisecond epochs.

### 3. GCaMP8f Optical Calcium Transduction

Intracellular calcium accumulation $[Ca^{2+}]$ and delta fluorescence are modeled through single compartment extrusion kinetics coupled with cooperative Hill binding:

$$\frac{d[Ca^{2+}]}{dt} = -\frac{[Ca^{2+}] - [Ca^{2+}]_{rest}}{\tau_{Ca}} + \gamma \cdot I_{Ca}$$

$$\frac{\Delta F}{F_0} = \frac{(\Delta F/F_0)_{max} \cdot [Ca^{2+}]^n}{K_d^n + [Ca^{2+}]^n}$$

System parameters:
* $\tau_{Ca} = 240.0 \, \text{ms}$ (GCaMP8f clearance constant)
* $[Ca^{2+}]_{rest} = 0.08 \, \mu\text{M}$ (Baseline cytosolic concentration)
* $K_d = 0.35 \, \mu\text{M}$ (Affinity dissociation constant)
* $n = 2.4$ (Cooperative binding Hill coefficient)
* $(\Delta F/F_0)_{max} = 2.8$ (Maximum optical dynamic range)

## Onchain Telemetry and Consensus Transduction

### Transduction Pipeline

1. Block Level Ingestion: The client queries `eth_blockNumber` and `eth_getLogs` for contract `0x6e7c924b9150ddf1cdb73b58b4285d10cd65690b` using JSON RPC over HTTP.
2. Value Extraction: Incoming ERC20 transfer logs are decoded from uint256 hex payloads to nominal $MOUSE token units ($10^{18}$ base divisor).
3. Conductance Modulation: Injected excitatory conductance $g_{onchain}$ is scaled logarithmically:
   $$g_{onchain}(t) = \alpha \cdot \log_{10}(1 + \text{Volume}) \cdot \beta \cdot \exp(-t / \tau_{syn})$$
   Where $\beta = 3.5$ for whale transactions ($> 500{,}000 \, \text{MOUSE}$) and $\beta = 1.5$ for standard retail swaps.
4. Optical Propagation: Three.js particle systems trigger axonal action potential sparks traveling from the somatosensory organoid graft across the corpus callosum into contralateral cortical domains.

### JSON RPC Method Signatures

The telemetry engine communicates with Robinhood Chain consensus via standard RPC methods:

* `eth_blockNumber`: Retrieves current consensus block height.
* `eth_gasPrice`: Monitors network gas price in Gwei.
* `eth_call`: Queries contract metadata (`name`, `symbol`, `decimals`, `totalSupply`).
* `eth_getLogs`: Streams historical and real time $MOUSE transfer event logs.

## Repository Structure

```
mousemind-onchain/
├── assets/
│   └── icon.png                       # Laboratory specimen icon
├── public/
│   ├── favicon.png                    # Browser application favicon
│   ├── chimeric_hybrid_brain.jpg      # High resolution histological slice
│   └── neurodynamic_coupling.jpg      # In vivo fluorescent micrograph plate
├── src/
│   ├── biophysics/
│   │   └── neurodynamic_coupling.js   # Hodgkin Huxley and calcium kinetics engine
│   ├── chat/
│   │   └── consciousness_stream.js    # Subject Alpha autonomous cognition engine
│   ├── core/
│   │   └── brain_engine.js            # Three.js 3D WebGL brain and particle renderer
│   ├── styles/
│   │   └── lobby.css                  # Self contained monochrome luxury stylesheet
│   ├── telemetry/
│   │   └── rpc_client.js              # Robinhood Chain JSON RPC client (Chain ID 4663)
│   └── main.js                        # Master coordinator and event bus
├── index.html                         # Interactive laboratory web application
├── package.json                       # Project manifest and build scripts
├── vite.config.js                     # Standalone Vite configuration
├── LICENSE                            # MIT Open Source License
└── README.md                          # Repository documentation
```

## Getting Started

### Prerequisites

* Node.js version 18.0.0 or higher
* npm version 9.0.0 or higher

### Installation

Clone the repository locally and install dependencies:

```bash
git clone https://github.com/amousemind/mousemind-onchain.git
cd mousemind-onchain
npm install
```

### Local Development

Launch the development server:

```bash
npm run dev
```

Open `http://localhost:5174` in your browser to access the live 3D laboratory.

### Production Build

Generate optimized production bundles:

```bash
npm run build
npm run preview
```

## Key Modules

### 1. Three.js 3D Neural Engine (`brain_engine.js`)
* Procedural dual hemisphere crystalline cortex with anatomical gyri and sulci convolutions.
* Dense H9 human cortical organoid sphere positioned within the parietal somatosensory locus.
* Catmull Rom spline axonal connectome pathways bridging both cerebral hemispheres.
* Action potential spark particle systems featuring speed, lifespan, and opacity modulation.
* Dynamic GCaMP8f optical calcium kinetics canvas rendering real time fluorescence waveforms.
* Interactive orbit controls supporting 360 degree specimen rotation and perspective presets (Isometric, Sagittal, Organoid Zoom, Top Cortical).

### 2. Robinhood Chain Telemetry Engine (`rpc_client.js`)
* Direct JSON RPC connector for `https://rpc.mainnet.chain.robinhood.com` (Chain ID 4663).
* Real time block height, latency, and gas price tracking.
* Continuous `eth_getLogs` event filtering for verified $MOUSE contract `0x6e7c924b9150ddf1cdb73b58b4285d10cd65690b`.
* Automatic address truncation, token value normalization, and transaction categorization.

### 3. Subject Alpha Consciousness Stream (`consciousness_stream.js`)
* Autonomous cognitive monologue reflecting continuous onchain swap influxes.
* Electrophysiological state awareness (spike frequency in Hz, membrane potential in mV, calcium flux).
* Interactive bidirectional terminal allowing researchers to interrogate Subject Alpha.

## Scientific References

* Pașca SP et al. Maturation and circuit integration of transplanted human cortical organoids. Nature 610, 815 to 823 (2022).
* Allen Institute for Brain Science. Whole mouse brain connectome reconstructed via serial section electron microscopy.
* IARPA MICrONS Consortium. Cortical microcircuit reconstruction and functional calcium imaging under Open Data licenses.
* Robinhood Chain Core Engineering Team. Arbitrum Orbit Layer 2 roll up settlement infrastructure.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
