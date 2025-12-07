import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import time

print("=" * 70)
print("🌲 RANDOM FOREST MODEL TRAINING - IPL DATA")
print("=" * 70)

# Load IPL training data
print("\n📂 Loading training data...")
df = pd.read_csv('data/training_data_ipl.csv')
print(f"✅ Loaded {len(df)} samples")
print(f"   Win samples: {sum(df['team_won'] == 1)}")
print(f"   Loss samples: {sum(df['team_won'] == 0)}")

# Features and target
print("\n🔍 Preparing features...")
feature_columns = [
    'current_score', 'wickets_lost', 'overs_played', 'run_rate',
    'innings', 'target', 'runs_needed', 'wickets_remaining', 'required_run_rate'
]

X = df[feature_columns]
y = df['team_won']

print(f"✅ Features: {len(feature_columns)}")
print(f"   {', '.join(feature_columns)}")

# Train-test split (same split as XGBoost for fair comparison)
print("\n✂️  Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✅ Training set: {len(X_train)} samples")
print(f"✅ Test set: {len(X_test)} samples")

# Train Random Forest model
print("\n🏋️  Training Random Forest model...")
start_time = time.time()

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1  # Use all CPU cores
)

model.fit(X_train, y_train)
training_time = time.time() - start_time
print(f"✅ Training complete! (Time: {training_time:.2f}s)")

# Evaluate
print("\n📊 Evaluating model...")
start_time = time.time()
y_pred = model.predict(X_test)
prediction_time = time.time() - start_time

accuracy = accuracy_score(y_test, y_pred)

print(f"\n🎯 Accuracy: {accuracy * 100:.2f}%")
print(f"⏱️  Prediction time: {prediction_time:.4f}s")

print("\n📈 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Loss', 'Win']))

print("\n🔢 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"   True Negatives:  {cm[0][0]}")
print(f"   False Positives: {cm[0][1]}")
print(f"   False Negatives: {cm[1][0]}")
print(f"   True Positives:  {cm[1][1]}")

# Feature importance
print("\n⭐ Feature Importance:")
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"   {row['feature']:<25} {row['importance']:.4f}")

# Save model
model_path = 'ml_models/models/model_rf.pkl'
os.makedirs('ml_models/models', exist_ok=True)

with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"\n💾 Model saved: {model_path}")

print("\n" + "=" * 70)
print("✅ RANDOM FOREST TRAINING COMPLETE!")
print("=" * 70)
print(f"\n🎯 Next Step: Run 'python ml_models/compare_two_models.py'")