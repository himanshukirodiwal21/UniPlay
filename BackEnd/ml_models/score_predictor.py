import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import json

print("📊 IPL Score Prediction Model Training\n")

# Load data
matches = pd.read_csv('data/matches.csv')
deliveries = pd.read_csv('data/deliveries.csv')

# Calculate innings scores
innings_scores = deliveries.groupby('match_id').agg({
    'total_runs': 'sum',
    'is_wicket': 'sum'
}).reset_index()

innings_scores.columns = ['match_id', 'total_score', 'total_wickets']

# Merge with matches data
score_data = matches.merge(innings_scores, left_on='id', right_on='match_id', how='inner')

# Keep only first innings (for predicting first innings score)
score_data = score_data[score_data['total_score'] > 0]
score_data = score_data[score_data['total_score'] <= 250]  # Remove anomalies

print(f"Total records: {len(score_data)}")

# Features
features_df = score_data[['team1', 'venue', 'toss_winner', 'toss_decision', 'total_score']].copy()
features_df = features_df.dropna()

# Label Encoding
le_team = LabelEncoder()
le_venue = LabelEncoder()
le_toss_winner = LabelEncoder()
le_toss_decision = LabelEncoder()

features_df['team_encoded'] = le_team.fit_transform(features_df['team1'])
features_df['venue_encoded'] = le_venue.fit_transform(features_df['venue'])
features_df['toss_winner_encoded'] = le_toss_winner.fit_transform(features_df['toss_winner'])
features_df['toss_decision_encoded'] = le_toss_decision.fit_transform(features_df['toss_decision'])

# Features and Target
X = features_df[['team_encoded', 'venue_encoded', 'toss_winner_encoded', 'toss_decision_encoded']]
y = features_df['total_score']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model Training
print("\n🔧 Training Score Prediction Model...")
model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
model.fit(X_train, y_train)

# Evaluate
from sklearn.metrics import mean_absolute_error, r2_score
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n✅ Model Performance:")
print(f"📊 Mean Absolute Error: {mae:.2f} runs")
print(f"📊 R² Score: {r2:.3f}")

# Save Model
print("\n💾 Saving score prediction model...")
joblib.dump(model, 'models/score_predictor.pkl')
joblib.dump(le_team, 'models/le_team_score.pkl')
joblib.dump(le_venue, 'models/le_venue_score.pkl')
joblib.dump(le_toss_winner, 'models/le_toss_winner_score.pkl')
joblib.dump(le_toss_decision, 'models/le_toss_decision_score.pkl')

print("✅ Score prediction model saved!")
print(f"🎯 Average predicted score: {y_pred.mean():.0f}")
print(f"📈 Actual average score: {y_test.mean():.0f}")