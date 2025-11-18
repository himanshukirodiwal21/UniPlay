import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import pickle
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🏏 CRICKET MATCH PREDICTION - MODEL TRAINING")
print("=" * 60)

# Load data
print("\n📂 Loading training data...")
df = pd.read_csv('data/training_data.csv')
print(f"✅ Data loaded: {len(df)} matches")
print(f"   Features: {list(df.columns)}")

# Prepare features
print("\n🔧 Preparing features...")
X = df.drop('team_won', axis=1)
y = df['team_won']
print(f"✅ Features prepared: {X.shape}")
print(f"   Target distribution: Win={sum(y==1)}, Loss={sum(y==0)}")

# Split data
print("\n✂️  Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"✅ Train set: {len(X_train)} matches")
print(f"✅ Test set: {len(X_test)} matches")

# Train model
print("\n🤖 Training XGBoost model...")
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)
print("✅ Model training complete!")

# Evaluate
print("\n📊 Evaluating model performance...")
train_pred = model.predict(X_train)
test_pred = model.predict(X_test)
train_acc = accuracy_score(y_train, train_pred)
test_acc = accuracy_score(y_test, test_pred)

print(f"   Training Accuracy: {train_acc*100:.2f}%")
print(f"   Test Accuracy: {test_acc*100:.2f}%")

print("\n📈 Detailed Classification Report:")
print(classification_report(y_test, test_pred, 
                          target_names=['Loss', 'Win']))

# Feature importance
print("🎯 Top 5 Most Important Features:")
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.head(5).iterrows():
    print(f"   {row['feature']:30s} {row['importance']:.4f}")

# Save model
print("\n💾 Saving trained model...")
with open('ml_models/model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("✅ Model saved: ml_models/model.pkl")

# Test prediction
print("\n🧪 Testing sample prediction...")
sample = X_test.iloc[0:1]
prediction = model.predict(sample)[0]
probability = model.predict_proba(sample)[0]

print("   Sample Input:")
for col in sample.columns:
    print(f"   {col:30s} {sample[col].values[0]}")

print(f"\n   Prediction: {'WIN' if prediction == 1 else 'LOSS'}")
print(f"   Win Probability: {probability[1]*100:.2f}%")
print(f"   Loss Probability: {probability[0]*100:.2f}%")

print("\n" + "=" * 60)
print("✅ MODEL TRAINING SUCCESSFUL!")
print("=" * 60)