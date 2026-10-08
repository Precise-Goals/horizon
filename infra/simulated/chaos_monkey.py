#!/usr/bin/env python3
import subprocess
import time
import sys
import random

def stop_container(container_name):
    print(f"[*] Chaos Monkey: Stopping {container_name}...")
    subprocess.run(["docker", "stop", container_name], check=True)

def start_container(container_name):
    print(f"[*] Chaos Monkey: Starting {container_name}...")
    subprocess.run(["docker", "start", container_name], check=True)

def main():
    print("=== Horizon Simulated Chaos Monkey ===")
    services = ["postgres-primary", "redis-cache", "auth-service", "api-gateway"]
    
    try:
        while True:
            print("\nOptions:")
            print("1. Inject failure (Stop random service)")
            print("2. Start specific service")
            print("3. Start all services")
            print("4. Trigger Horizon API Recovery (Simulated)")
            print("5. Exit")
            
            choice = input("Enter choice: ")
            
            if choice == '1':
                service = random.choice(services)
                try:
                    stop_container(f"simulated_{service}_1")
                except Exception as e:
                    print(f"Error: {e}. Try stopping manually.")
            elif choice == '2':
                service = input(f"Enter service name {services}: ")
                try:
                    start_container(f"simulated_{service}_1")
                except Exception as e:
                    print(f"Error: {e}")
            elif choice == '3':
                subprocess.run(["docker-compose", "-f", "docker-compose.sim.yml", "start"])
            elif choice == '4':
                print("[*] Triggering Horizon autonomous recovery via API...")
                # Simulated call to apps/api
                print("[*] Simulated API call complete. Check logs for recovery.")
            elif choice == '5':
                break
            else:
                print("Invalid choice.")
    except KeyboardInterrupt:
        print("\nExiting.")

if __name__ == "__main__":
    main()
