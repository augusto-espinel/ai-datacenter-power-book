# Chapter 10 — Telemetry & PMBus

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of facility metering, power-quality monitoring, and electrical operations, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 4.12 — Metering, Power Quality, Monitoring & Electrical Operations](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-12-metering-power-quality-monitoring-and-electrical-operations)** *(Revenue-grade metering, sub-cycle waveform capture, EPMS/SCADA hierarchies, and power quality analytics)*
> - **[Part 13.8 — GPU Node Burn-In, Diagnostics & Stress Validation](https://aidatacenterguide.com/part-13-commissioning-and-go-live/13-8-gpu-node-burn-in-diagnostics-and-stress-validation)** *(In-band and out-of-band telemetry during cluster commissioning)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the facility-level EPMS and metering architecture covered in the links above is referenced directly. Additional board-level PMBus/AVSBus protocol mechanics, current-sensor signal conditioning, and high-speed DAQ design details not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

Where Part 4.12 of the Guide focuses on facility EPMS and power-quality analyzers, this chapter bridges the gap down to board-, PSU-, and rack-level digital power telemetry:

- **PMBus, SVID & AVSBus Protocol Mechanics:** Register-level command structures (`VOUT_MODE`, `VOUT_COMMAND`, `VOUT_DROOP` / `LOADLINE`, `IOUT_CAL_GAIN`, `STATUS_WORD`), LINEAR11/LINEAR16/VID data encoding, and black-box fault logging on digital VRM controllers and shelf rectifiers.
- **Current & Voltage Sensing Signal Chains:** Bandwidth, linearity, thermal drift, and galvanic isolation trade-offs across resistive shunts + isolated $\Delta\Sigma$ modulators, closed-loop Hall-effect sensors, fluxgate transducers, and Rogowski coils.
- **Anti-Aliasing & Sampling Synchronization:** Nyquist criteria, analog anti-aliasing filter design, and time-synchronization (IEEE 1588 PTP) required to correlate microsecond-scale GPU power transients with millisecond-scale rack/PDU power quality waveforms.
- **BMC / Redfish to SCADA/EPMS Bridging:** Aggregating board-level telemetry via BMC/Redfish APIs and OPC-UA/Modbus-TCP gateways to drive dynamic rack power capping and cluster-level frequency/ramp-rate control.
