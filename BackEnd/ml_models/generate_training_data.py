import pandas as pd
import numpy as np
import os

print("=" * 70)
print("📊 IPL TRAINING DATA GENERATOR")
print("=" * 70)

# Paths
matches_path = 'ml_models/data/matches.csv'
deliveries_path = 'ml_models/data/deliveries.csv'
output_path = 'data/training_data_ipl.csv'

# Check if files exist
if not os.path.exists(matches_path):
    print(f"❌ Error: {matches_path} not found!")
    exit(1)
if not os.path.exists(deliveries_path):
    print(f"❌ Error: {deliveries_path} not found!")
    exit(1)

# Load IPL data
print("\n📂 Loading IPL dataset...")
matches = pd.read_csv(matches_path)
deliveries = pd.read_csv(deliveries_path)

print(f"✅ Loaded {len(matches)} matches")
print(f"✅ Loaded {len(deliveries)} deliveries")

# Filter valid matches (T20 format only)
print("\n🔍 Filtering T20 matches...")
valid_matches = matches[matches['id'].isin(deliveries['match_id'].unique())]
print(f"✅ Found {len(valid_matches)} matches with delivery data")

training_data = []
processed_count = 0
skipped_count = 0

# Process each match
print("\n🔄 Processing matches...")
for idx, match in valid_matches.iterrows():
    if processed_count % 50 == 0:
        print(f"   Progress: {processed_count}/{len(valid_matches)} matches")
    
    match_id = match['id']
    match_deliveries = deliveries[deliveries['match_id'] == match_id]
    
    if len(match_deliveries) == 0:
        skipped_count += 1
        continue
    
    # Get winner
    winner = match['winner']
    if pd.isna(winner):
        skipped_count += 1
        continue
    
    # Process Innings 1
    innings1 = match_deliveries[match_deliveries['inning'] == 1]
    if len(innings1) > 0:
        batting_team_1 = innings1.iloc[0]['batting_team']
        team1_won = 1 if winner == batting_team_1 else 0
        
        # Sample at different overs (6, 10, 15, 20)
        for target_over in [6, 10, 15, 20]:
            inning_data = innings1[innings1['over'] < target_over]
            if len(inning_data) == 0:
                continue
            
            score = inning_data['total_runs'].sum()
            wickets = inning_data['is_wicket'].sum() if 'is_wicket' in inning_data.columns else \
                     inning_data['player_dismissed'].notna().sum()
            overs_played = target_over
            run_rate = score / overs_played if overs_played > 0 else 0
            
            training_data.append({
                'current_score': int(score),
                'wickets_lost': int(wickets),
                'overs_played': float(overs_played),
                'total_overs': 20,
                'innings': 1,
                'run_rate': round(run_rate, 2),
                'target': 0,
                'runs_needed': 0,
                'wickets_remaining': int(10 - wickets),
                'required_run_rate': 0.0,
                'team_won': team1_won
            })
    
    # Process Innings 2
    innings2 = match_deliveries[match_deliveries['inning'] == 2]
    if len(innings2) > 0 and len(innings1) > 0:
        batting_team_2 = innings2.iloc[0]['batting_team']
        team2_won = 1 if winner == batting_team_2 else 0
        target = int(innings1['total_runs'].sum()) + 1
        
        # Sample at different overs
        for target_over in [6, 10, 15, 20]:
            inning_data = innings2[innings2['over'] < target_over]
            if len(inning_data) == 0:
                continue
            
            score = inning_data['total_runs'].sum()
            wickets = inning_data['is_wicket'].sum() if 'is_wicket' in inning_data.columns else \
                     inning_data['player_dismissed'].notna().sum()
            overs_played = target_over
            overs_left = 20 - overs_played
            runs_needed = target - score
            run_rate = score / overs_played if overs_played > 0 else 0
            required_rr = runs_needed / overs_left if overs_left > 0 else 0
            
            training_data.append({
                'current_score': int(score),
                'wickets_lost': int(wickets),
                'overs_played': float(overs_played),
                'total_overs': 20,
                'innings': 2,
                'run_rate': round(run_rate, 2),
                'target': target,
                'runs_needed': max(0, runs_needed),
                'wickets_remaining': int(10 - wickets),
                'required_run_rate': round(required_rr, 2),
                'team_won': team2_won
            })
    
    processed_count += 1

# Create DataFrame
print(f"\n✅ Processed {processed_count} matches")
print(f"⚠️  Skipped {skipped_count} matches (no winner/data)")

df = pd.DataFrame(training_data)
print(f"\n📊 Generated {len(df)} training samples")

# Clean data
original_count = len(df)
df = df.dropna()
df = df[(df['wickets_lost'] >= 0) & (df['wickets_lost'] <= 10)]
df = df[(df['overs_played'] > 0) & (df['overs_played'] <= 20)]
df = df[df['current_score'] >= 0]

print(f"🧹 After cleaning: {len(df)} samples (removed {original_count - len(df)})")
print(f"   ✅ Win samples: {sum(df['team_won'] == 1)}")
print(f"   ❌ Loss samples: {sum(df['team_won'] == 0)}")

# Distribution
print("\n📈 Data Distribution:")
print(f"   Innings 1: {sum(df['innings'] == 1)} samples")
print(f"   Innings 2: {sum(df['innings'] == 2)} samples")

# Save
df.to_csv(output_path, index=False)
print(f"\n💾 Saved to: {output_path}")

print("\n" + "=" * 70)
print("✅ TRAINING DATA GENERATION COMPLETE!")
print("=" * 70)
print(f"\n🎯 Next Step: Run 'python ml_models/train_model.py'")