#!/bin/bash
echo "Dataclaw OS - Rust Engine Preparation for VPS"
echo "--------------------------------------------"

echo "1. Creating Env file..."
cp .env.example .env

echo "2. Building Rust Docker Container..."
docker-compose build

echo "3. Starting Dataclaw Rust Engine..."
docker-compose up -d

echo ""
echo "🚀 Rust Engine is running on port 8000."
echo "Check logs via: docker logs dataclaw_rust_executor -f"
