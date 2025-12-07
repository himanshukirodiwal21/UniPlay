import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pickle
import os
import time

print("=" * 70)
print("🌲 RANDOM FOREST SCORE PREDICTION MODEL TRAINING - IPL DATA")
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
    print("\n💡 Solution: Run 'python ml_models/add_final_score_column.py' first")
    exit(1)

# Load training data
print(f"\n📂 Loading training data...")
df = pd.read_csv(training_data_path)
print(f"✅ Loaded {len(df)} samples")

# Check if final_score exists
if 'final_score' not in df.columns:
    print("\n❌ ERROR: 'final_score' column not found!")
    print(f"   Available columns: {list(df.columns)}")
    print("\n💡 Solution: Run 'python ml_models/add_final_score_column.py' first")
    exit(1)

# Filter only first innings for score prediction
df_innings1 = df[df['innings'] == 1].copy()
print(f"✅ First innings samples: {len(df_innings1)}")
print(f"   Average final score: {df_innings1['final_score'].mean():.2f}")
print(f"   Score range: {df_innings1['final_score'].min()} - {df_innings1['final_score'].max()}")

# Features for score prediction
print("\n🔍 Preparing features...")
feature_columns = [
    'current_score', 'wickets_lost', 'overs_played', 'run_rate',
    'wickets_remaining', 'total_overs'
]

# Check if all features exist
missing_features = [col for col in feature_columns if col not in df_innings1.columns]
if missing_features:
    print(f"❌ Missing features: {missing_features}")
    print(f"   Available columns: {list(df_innings1.columns)}")
    exit(1)

X = df_innings1[feature_columns]
y = df_innings1['final_score']

print(f"✅ Features: {len(feature_columns)}")
print(f"   {', '.join(feature_columns)}")

# Train-test split (same as XGBoost for fair comparison)
print("\n✂️  Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"✅ Training set: {len(X_train)} samples")
print(f"✅ Test set: {len(X_test)} samples")

# Train Random Forest Regressor
print("\n🏋️  Training Random Forest Regressor...")
start_time = time.time()

model = RandomForestRegressor(
    n_estimators=150,
    max_depth=12,
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

mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n🎯 Model Performance:")
print(f"   RMSE (Root Mean Squared Error): {rmse:.2f} runs")
print(f"   MAE (Mean Absolute Error): {mae:.2f} runs")
print(f"   R² Score: {r2:.4f}")
print(f"   ⏱️  Prediction time: {prediction_time:.4f}s")

# Show sample predictions
print("\n📈 Sample Predictions (First 10):")
print(f"{'Actual':<10} {'Predicted':<10} {'Difference':<10}")
print("-" * 30)
for i in range(min(10, len(y_test))):
    actual = y_test.iloc[i]
    predicted = y_pred[i]
    diff = abs(actual - predicted)
    print(f"{actual:<10.0f} {predicted:<10.1f} {diff:<10.1f}")

# Accuracy within ranges
within_5 = sum(abs(y_test - y_pred) <= 5) / len(y_test) * 100
within_10 = sum(abs(y_test - y_pred) <= 10) / len(y_test) * 100
within_15 = sum(abs(y_test - y_pred) <= 15) / len(y_test) * 100

print(f"\n🎯 Prediction Accuracy:")
print(f"   Within ±5 runs:  {within_5:.2f}%")
print(f"   Within ±10 runs: {within_10:.2f}%")
print(f"   Within ±15 runs: {within_15:.2f}%")

# Feature importance
print("\n⭐ Feature Importance:")
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"   {row['feature']:<25} {row['importance']:.4f}")

# Save model - Create directory if needed
model_dir = 'ml_models/models' if os.path.exists('ml_models') else 'models'
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'model_score_rf.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"\n💾 Model saved: {model_path}")
print(f"   File size: {os.path.getsize(model_path) / 1024:.2f} KB")

print("\n" + "=" * 70)
print("✅ RANDOM FOREST SCORE PREDICTION TRAINING COMPLETE!")
print("=" * 70)
print(f"\n🎯 Next Step: Start API with 'python app_score.py'")