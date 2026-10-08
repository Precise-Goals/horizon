# Horizon Simulated Infrastructure & Chaos Monkey

This directory contains resources to simulate a microservices environment and inject faults to test Horizon's autonomous recovery capabilities.

## Getting Started

1. **Start the simulated infrastructure:**
   ```bash
   docker-compose -f docker-compose.sim.yml up -d
   ```

2. **Run Chaos Monkey:**
   ```bash
   python chaos_monkey.py
   ```

3. **Observe Recovery:**
   - Use the Chaos Monkey script to stop essential services like `postgres-primary` or `redis-cache`.
   - In a real end-to-end setup, Horizon agents will detect these failures.
   - Use the Chaos Monkey menu to simulate a trigger to the Horizon API, instructing it to recover the downed services in dependency order.

## Services Included
- **postgres-primary**: The main relational database.
- **redis-cache**: Distributed caching layer.
- **auth-service**: Mock authentication component.
- **api-gateway**: Mock entry point for API traffic.
- **web-client**: Mock frontend serving static content.
