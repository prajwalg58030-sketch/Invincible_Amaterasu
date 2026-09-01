import torch
import torch.nn as nn
import numpy as np
import time
from engine import GRUWorldModel, TelemetryEngine

# ============================================
# 1. MODEL ARCHITECTURE & PARAMETER COUNT
# ============================================
model = GRUWorldModel(input_dim=11, hidden_dim=128, num_layers=2)

total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
model_size_mb = (total_params * 4) / (1024 * 1024)  # 4 bytes per float32

print("=" * 70)
print("MODEL ARCHITECTURE & PARAMETERS")
print("=" * 70)
print(f"Total Parameters:     {total_params:,}")
print(f"Trainable Parameters: {trainable_params:,}")
print(f"Model Size (float32): {model_size_mb:.2f} MB")
print(f"\nModel Breakdown:")
print(f"  GRU Layers:         2 layers, 128 hidden dim")
print(f"  Input Dimension:    11 features")
print(f"  Dynamics Head:      Linear(128 → 11)")
print(f"  Risk Head:          Linear(128 → 64) → ReLU → Linear(64 → 1) → Sigmoid")

# ============================================
# 2. INFERENCE SPEED BENCHMARKING
# ============================================
print("\n" + "=" * 70)
print("INFERENCE SPEED BENCHMARKING")
print("=" * 70)

model.eval()
batch_sizes = [1, 4, 8, 16]
sequence_length = 10

latencies = {}

for batch_size in batch_sizes:
    dummy_input = torch.randn(batch_size, sequence_length, 11)
    
    # Warmup
    with torch.no_grad():
        for _ in range(5):
            _ = model(dummy_input)
    
    # Benchmark
    num_runs = 100
    times = []
    
    with torch.no_grad():
        for _ in range(num_runs):
            t_start = time.perf_counter()
            _ = model(dummy_input)
            t_end = time.perf_counter()
            times.append((t_end - t_start) * 1000)  # Convert to ms
    
    avg_latency = np.mean(times)
    std_latency = np.std(times)
    min_latency = np.min(times)
    max_latency = np.max(times)
    throughput = 1000 / avg_latency
    
    latencies[batch_size] = avg_latency
    
    print(f"\nBatch Size: {batch_size}")
    print(f"  Avg Latency:    {avg_latency:.3f} ms")
    print(f"  Std Dev:        {std_latency:.3f} ms")
    print(f"  Min / Max:      {min_latency:.3f} / {max_latency:.3f} ms")
    print(f"  Throughput:     {throughput:.1f} inferences/sec")

# ============================================
# 3. MEMORY PROFILING
# ============================================
print("\n" + "=" * 70)
print("MEMORY PROFILING")
print("=" * 70)

engine = TelemetryEngine()

# Measure memory before inference
import psutil
process = psutil.Process()
mem_before = process.memory_info().rss / (1024 * 1024)

# Run several inference steps
for _ in range(10):
    engine.step_inference()

mem_after = process.memory_info().rss / (1024 * 1024)
mem_delta = mem_after - mem_before

print(f"Memory Before: {mem_before:.1f} MB")
print(f"Memory After:  {mem_after:.1f} MB")
print(f"Delta:         {mem_delta:.1f} MB (from inference)")
print(f"Model Size:    {model_size_mb:.2f} MB (parameters only)")

# ============================================
# 4. COMPUTATIONAL COMPLEXITY (FLOPs)
# ============================================
print("\n" + "=" * 70)
print("COMPUTATIONAL COMPLEXITY")
print("=" * 70)

# GRU cell computation: ~3x LSTM due to reset/update gates
# Forward pass: O(seq_len * batch * hidden * (input + hidden))
seq_len = 10
batch = 1
input_dim = 11
hidden_dim = 128
num_layers = 2

# Each GRU cell: ~4 * hidden_dim * (input_dim + hidden_dim) FLOPs per timestep
gru_flops_per_step = 4 * hidden_dim * (input_dim + hidden_dim) * seq_len * batch * num_layers
dynamics_head_flops = 2 * hidden_dim * input_dim * batch  # 2 = forward + bias
risk_head_flops = (2 * hidden_dim * 64 + 64 * 1) * batch  # Linear(128→64) + ReLU + Linear(64→1)

total_flops = gru_flops_per_step + dynamics_head_flops + risk_head_flops

print(f"Per Inference (Batch=1, Seq=10):")
print(f"  GRU FLOPs:        {gru_flops_per_step:,.0f}")
print(f"  Dynamics Head:    {dynamics_head_flops:,.0f}")
print(f"  Risk Head:        {risk_head_flops:,.0f}")
print(f"  Total FLOPs:      {total_flops:,.0f}")
print(f"  FLOPs/ms:         {total_flops / latencies[1]:.0f} (at {latencies[1]:.3f}ms)")

# ============================================
# 5. EFFICIENCY METRICS
# ============================================
print("\n" + "=" * 70)
print("EFFICIENCY METRICS")
print("=" * 70)

actual_latency = latencies[1]
throughput = 1000 / actual_latency
params_per_mb = total_params / model_size_mb
flops_per_param = total_flops / total_params

print(f"FLOPs per Parameter: {flops_per_param:.2f}")
print(f"Parameters per MB:   {params_per_mb:,.0f}")
print(f"Actual Latency:      {actual_latency:.2f} ms")
print(f"Actual Throughput:   {throughput:.1f} windows/sec")
print(f"Memory Usage:        {mem_after:.1f} MB")

# ============================================
# 6. K-STEP FORECAST OVERHEAD
# ============================================
print("\n" + "=" * 70)
print("K-STEP FORECAST OVERHEAD (5 steps)")
print("=" * 70)

t_start = time.perf_counter()
result = engine.step_inference()
t_end = time.perf_counter()

total_time_ms = (t_end - t_start) * 1000
inference_time_ms = result['benchmarks']['latency_ms']
forecast_overhead = total_time_ms - inference_time_ms

print(f"Total Execution:     {total_time_ms:.2f} ms")
print(f"Inference Time:      {inference_time_ms:.2f} ms")
print(f"Forecast Overhead:   {forecast_overhead:.2f} ms")
print(f"Forecast % of Total: {(forecast_overhead/total_time_ms)*100:.1f}%")

print("\n" + "=" * 70)
