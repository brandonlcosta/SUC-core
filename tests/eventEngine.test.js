import { validateEvent } from "../backend/engines/eventEngine.js";

function runTests() {
  const samples = [
    {
      event_type: "lap_completed",
      runner_id: "r123",
      timestamp: "2025-09-14T10:25:00Z",
      location: { checkpoint_id: "start_finish" },
      source: { system: "timing_mat", device_id: "mat_01", method: "RFID_read" },
      quality: { confidence: 1.0, priority: 1.0, trust_level: "truth" }
    },
    {
      event_type: "sector_ping",
      runner_id: "r123",
      timestamp: "2025-09-14T10:35:00Z",
      location: { checkpoint_id: "cp01", sector_name: "Far Loop" },
      source: { system: "lora_beacon", device_id: "node_07", method: "BLE_scan" },
      quality: { confidence: 0.7, priority: 0.5, trust_level: "soft" }
    },
    {
      event_type: "projected_position",
      runner_id: "r123",
      timestamp: "2025-09-14T10:40:00Z",
      location: { lat: 39.12345, lon: -120.56789, sector_name: "Ridge Trail" },
      source: { system: "projection_engine", device_id: "proj_01", method: "pace_interpolation" },
      quality: { confidence: 0.6, priority: 0.25, trust_level: "projection" }
    }
  ];

  samples.forEach((sample, idx) => {
    try {
      const result = validateEvent(sample);
      console.log(`✅ Sample ${idx + 1} valid:`, result.event_type);
    } catch (err) {
      console.error(`❌ Sample ${idx + 1} failed:`, err.message);
    }
  });

  // Invalid case: missing event_type
  try {
    validateEvent({
      runner_id: "r999",
      timestamp: "2025-09-14T10:25:00Z",
      source: { system: "manual", device_id: "volunteer_1" },
      quality: { confidence: 0.5, priority: 0.5, trust_level: "soft" }
    });
  } catch (err) {
    console.log("✅ Caught invalid event as expected");
  }
}

runTests();
