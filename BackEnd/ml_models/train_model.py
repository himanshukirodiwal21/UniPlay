import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import json

print("🏏 IPL Match Winner Prediction Model Training\n")

# Load data
matches = pd.read_csv('data/matches.csv')

# Data cleaning
matches = matches[matches['winner'].notna()]  # Remove no results
matches = matches[matches['result'] != 'tie']  # Remove ties

print(f"Total matches for training: {len(matches)}")

# Feature Engineering
features_df = matches[['team1', 'team2', 'venue', 'toss_winner', 'toss_decision', 'winner']].copy()

# Label Encoding
le_team1 = LabelEncoder()
le_team2 = LabelEncoder()
le_venue = LabelEncoder()
le_toss_winner = LabelEncoder()
le_toss_decision = LabelEncoder()
le_winner = LabelEncoder()

features_df['team1_encoded'] = le_team1.fit_transform(features_df['team1'])
features_df['team2_encoded'] = le_team2.fit_transform(features_df['team2'])
features_df['venue_encoded'] = le_venue.fit_transform(features_df['venue'])
features_df['toss_winner_encoded'] = le_toss_winner.fit_transform(features_df['toss_winner'])
features_df['toss_decision_encoded'] = le_toss_decision.fit_transform(features_df['toss_decision'])
features_df['winner_encoded'] = le_winner.fit_transform(features_df['winner'])

# Features and Target
X = features_df[['team1_encoded', 'team2_encoded', 'venue_encoded', 
                  'toss_winner_encoded', 'toss_decision_encoded']]
y = features_df['winner_encoded']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model Training
print("\n🔧 Training Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=200, random_state=42, max_depth=15, min_samples_split=5)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")

# FIXED: Only show classification report for classes present in test set
print("\n📊 Classification Report:")
unique_classes = np.unique(y_test)
target_names = [le_winner.classes_[i] for i in unique_classes]
print(classification_report(y_test, y_pred, labels=unique_classes, target_names=target_names, zero_division=0))

# Feature Importance
feature_names = ['Team 1', 'Team 2', 'Venue', 'Toss Winner', 'Toss Decision']
importances = model.feature_importances_
print("\n📈 Feature Importance:")
for name, importance in zip(feature_names, importances):
    print(f"  {name}: {importance * 100:.2f}%")

# Save Model and Encoders
print("\n💾 Saving model and encoders...")
import os
os.makedirs('models', exist_ok=True)

joblib.dump(model, 'models/match_winner_model.pkl')
joblib.dump(le_team1, 'models/le_team1.pkl')
joblib.dump(le_team2, 'models/le_team2.pkl')
joblib.dump(le_venue, 'models/le_venue.pkl')
joblib.dump(le_toss_winner, 'models/le_toss_winner.pkl')
joblib.dump(le_toss_decision, 'models/le_toss_decision.pkl')
joblib.dump(le_winner, 'models/le_winner.pkl')

# Save metadata for frontend
metadata = {
    'teams': sorted(matches['team1'].unique().tolist()),
    'venues': sorted(matches['venue'].unique().tolist()),
    'toss_decisions': ['bat', 'field'],
    'accuracy': float(accuracy),
    'total_matches': len(matches),
    'total_teams': len(matches['team1'].unique())
}

with open('models/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Model training complete!")
print(f"📁 Files saved in 'models/' folder")
print(f"🎯 Model accuracy: {accuracy * 100:.2f}%")
print(f"📊 Total teams: {metadata['total_teams']}")
print(f"🏟️ Total venues: {len(metadata['venues'])}")