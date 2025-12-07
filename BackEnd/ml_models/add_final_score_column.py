import pandas as pd
import numpy as np
import os

print("=" * 70)
print("📊 ADDING FINAL_SCORE COLUMN TO TRAINING DATA")
print("=" * 70)

# Get current directory
current_dir = os.getcwd()
print(f"\n📂 Current Directory: {current_dir}")

# Find the training data file
possible_paths = [
    'data/training_data_ipl.csv',
    '../data/training_data_ipl.csv',
    './training_data_ipl.csv',
    'ml_models/data/training_data_ipl.csv'
]

training_data_path = None
for path in possible_paths:
    if os.path.exists(path):
        training_data_path = path
        print(f"✅ Found training data at: {path}")
        break

if not training_data_path:
    print("\n❌ ERROR: training_data_ipl.csv not found!")
    print("\n📁 Please check these locations:")
    for path in possible_paths:
        full_path = os.path.abspath(path)
        exists = "✅ EXISTS" if os.path.exists(path) else "❌ NOT FOUND"
        print(f"   {exists}: {full_path}")
    
    print("\n💡 Solution:")
    print("   1. Make sure you're in BackEnd directory")
    print("   2. Run: cd C:\\Users\\ravis\\OneDrive\\Desktop\\PROJECT\\UniPlay\\BackEnd")
    print("   3. Check if data/training_data_ipl.csv exists")
    exit(1)

# Load training data
print(f"\n📂 Loading training data from: {training_data_path}")
df = pd.read_csv(training_data_path)
print(f"✅ Loaded {len(df)} samples")
print(f"   Columns: {list(df.columns)}")

# Check if final_score already exists
if 'final_score' in df.columns:
    print("\n⚠️  'final_score' column already exists!")
    print(f"   Sample values: {df['final_score'].head().tolist()}")
    print(f"   Mean: {df['final_score'].mean():.2f}")
    print("\n✅ No need to add - column already present!")
    exit(0)

# Check required columns
required_columns = ['current_score', 'wickets_lost', 'overs_played', 'innings', 'run_rate']
missing_columns = [col for col in required_columns if col not in df.columns]

if missing_columns:
    print(f"\n❌ ERROR: Missing required columns: {missing_columns}")
    print(f"   Available columns: {list(df.columns)}")
    exit(1)

print("\n🔧 Calculating final_score...")

def calculate_final_score(row):
    """
    Calculate final score based on innings
    - Innings 1: Estimate based on run rate and wickets
    - Innings 2: Use target (team 1's score)
    """
    if row['innings'] == 2:
        # Innings 2: Final score is the target they're chasing
        target = row.get('target', 0)
        if target > 0:
            return target
        # If no target, estimate from data
        return row.get('current_score', 0) + 50
    
    # Innings 1: Estimate final score
    current_score = row['current_score']
    overs_played = row['overs_played']
    wickets_lost = row['wickets_lost']
    total_overs = row.get('total_overs', 20)
    run_rate = row['run_rate']
    
    # Calculate remaining overs
    overs_remaining = total_overs - overs_played
    
    if overs_remaining <= 0:
        return current_score
    
    # Wicket factor (more wickets = lower projection)
    wickets_remaining = 10 - wickets_lost
    wicket_factor = max(0.5, wickets_remaining / 10)
    
    # Death overs acceleration (last 5 overs)
    if overs_remaining <= 5:
        acceleration = 1.2
    elif overs_remaining <= 10:
        acceleration = 1.1
    else:
        acceleration = 1.0
    
    # Project final score
    projected_runs = run_rate * overs_remaining * wicket_factor * acceleration
    final_score = int(current_score + projected_runs)
    
    # Realistic bounds for T20
    if total_overs == 20:
        final_score = max(100, min(final_score, 250))
    elif total_overs == 50:  # ODI
        final_score = max(150, min(final_score, 450))
    
    return final_score

# Add total_overs if not present
if 'total_overs' not in df.columns:
    print("   Adding total_overs column (defaulting to 20 for T20)")
    df['total_overs'] = 20

# Calculate final_score
print("   Calculating final_score for all rows...")
df['final_score'] = df.apply(calculate_final_score, axis=1)

print("✅ final_score column added!")

# Show statistics
print("\n📊 Final Score Statistics:")
print(f"   Total rows: {len(df)}")
print(f"   Mean: {df['final_score'].mean():.2f}")
print(f"   Median: {df['final_score'].median():.2f}")
print(f"   Min: {df['final_score'].min()}")
print(f"   Max: {df['final_score'].max()}")
print(f"   Std: {df['final_score'].std():.2f}")

# Statistics by innings
print("\n📊 Statistics by Innings:")
for innings in [1, 2]:
    innings_data = df[df['innings'] == innings]
    if len(innings_data) > 0:
        print(f"   Innings {innings}:")
        print(f"      Samples: {len(innings_data)}")
        print(f"      Mean score: {innings_data['final_score'].mean():.2f}")
        print(f"      Min: {innings_data['final_score'].min()}, Max: {innings_data['final_score'].max()}")

# Show sample data
print("\n📋 Sample Data (First 10 rows):")
sample_cols = ['current_score', 'wickets_lost', 'overs_played', 'innings', 'final_score']
print(df[sample_cols].head(10).to_string(index=False))

# Save updated data
output_path = training_data_path  # Save to same location
df.to_csv(output_path, index=False)
print(f"\n💾 Updated data saved: {output_path}")
print(f"   File size: {os.path.getsize(output_path) / 1024:.2f} KB")

print("\n" + "=" * 70)
print("✅ FINAL_SCORE COLUMN ADDED SUCCESSFULLY!")
print("=" * 70)
print("\n🎯 Next Steps:")
print("   1. Run: python ml_models/train_score_xgboost.py")
print("   2. Run: python ml_models/train_score_random_forest.py")
print("   3. Start API: python app_score.py")