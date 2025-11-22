import pandas as pd
import numpy as np

# Load datasets
print("📊 Loading IPL datasets...\n")
matches = pd.read_csv('data/matches.csv')
deliveries = pd.read_csv('data/deliveries.csv')

# Matches dataset info
print("=" * 50)
print("MATCHES DATASET")
print("=" * 50)
print(f"Total Matches: {len(matches)}")
print(f"Seasons: {matches['season'].min()} to {matches['season'].max()}")
print(f"Columns: {list(matches.columns)}\n")
print(matches.head())

# Deliveries dataset info
print("\n" + "=" * 50)
print("DELIVERIES DATASET")
print("=" * 50)
print(f"Total Deliveries: {len(deliveries)}")
print(f"Columns: {list(deliveries.columns)}\n")
print(deliveries.head())

# Basic stats
print("\n" + "=" * 50)
print("QUICK STATS")
print("=" * 50)
print(f"Total Teams: {matches['team1'].nunique()}")
print(f"Total Batters: {deliveries['batter'].nunique()}")  # FIXED: 'batsman' → 'batter'
print(f"Total Bowlers: {deliveries['bowler'].nunique()}")
print(f"Total Venues: {matches['venue'].nunique()}")

# Match-wise total runs
match_runs = deliveries.groupby('match_id')['total_runs'].sum()
print(f"Highest Total in a Match: {match_runs.max()}")
print(f"Average Runs per Match: {match_runs.mean():.2f}")

# Wickets analysis
total_wickets = deliveries['is_wicket'].sum()
print(f"Total Wickets Taken: {total_wickets}")

# Top teams
print("\n" + "=" * 50)
print("TOP 5 TEAMS BY WINS")
print("=" * 50)
team_wins = matches['winner'].value_counts().head()
print(team_wins)