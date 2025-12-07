import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                            f1_score, roc_auc_score, confusion_matrix)
import pickle
import time
from datetime import datetime

print("=" * 80)
print("🏆 MODEL COMPARISON: XGBoost vs Random Forest")
print("=" * 80)

# Load data
print("\n📂 Loading training data...")
df = pd.read_csv('data/training_data_ipl.csv')
print(f"✅ Loaded {len(df)} samples")

# Prepare features
feature_columns = [
    'current_score', 'wickets_lost', 'overs_played', 'run_rate',
    'innings', 'target', 'runs_needed', 'wickets_remaining', 'required_run_rate'
]

X = df[feature_columns]
y = df['team_won']

# Train-test split (same as training scripts)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✅ Test set: {len(X_test)} samples")

# Load models
print("\n📦 Loading trained models...")
with open('ml_models/models/model_xgb.pkl', 'rb') as f:
    model_xgb = pickle.load(f)
print("✅ XGBoost model loaded")

with open('ml_models/models/model_rf.pkl', 'rb') as f:
    model_rf = pickle.load(f)
print("✅ Random Forest model loaded")

# Evaluate both models
print("\n" + "=" * 80)
print("📊 EVALUATING MODELS ON TEST SET")
print("=" * 80)

results = {}

for model_name, model in [('XGBoost', model_xgb), ('Random Forest', model_rf)]:
    print(f"\n🔍 Evaluating {model_name}...")
    
    # Prediction time
    start_time = time.time()
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    pred_time = time.time() - start_time
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    cm = confusion_matrix(y_test, y_pred)
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        feature_imp = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
    else:
        feature_imp = None
    
    results[model_name] = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'roc_auc': roc_auc,
        'pred_time': pred_time,
        'confusion_matrix': cm,
        'feature_importance': feature_imp
    }
    
    print(f"✅ {model_name} evaluated")

# Display comparison
print("\n" + "=" * 80)
print("🏆 COMPARISON REPORT")
print("=" * 80)

# Performance metrics table
print("\n📊 PERFORMANCE METRICS")
print("─" * 80)
print(f"{'Metric':<20} {'XGBoost':<15} {'Random Forest':<15} {'Winner':<15}")
print("─" * 80)

metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']
for metric in metrics:
    xgb_val = results['XGBoost'][metric]
    rf_val = results['Random Forest'][metric]
    winner = 'XGBoost ✓' if xgb_val > rf_val else ('Random Forest ✓' if rf_val > xgb_val else 'Tie')
    
    print(f"{metric.replace('_', ' ').title():<20} {xgb_val:.4f}{'':>9} {rf_val:.4f}{'':>9} {winner:<15}")

print("─" * 80)

# Speed metrics
print("\n⏱️ SPEED METRICS")
print("─" * 80)
print(f"{'Metric':<20} {'XGBoost':<15} {'Random Forest':<15} {'Winner':<15}")
print("─" * 80)

xgb_time = results['XGBoost']['pred_time']
rf_time = results['Random Forest']['pred_time']
time_winner = 'XGBoost ✓' if xgb_time < rf_time else 'Random Forest ✓'

print(f"{'Prediction Time':<20} {xgb_time:.4f}s{'':>7} {rf_time:.4f}s{'':>7} {time_winner:<15}")
print("─" * 80)

# Confusion matrices
print("\n🔢 CONFUSION MATRICES")
print("\n📦 XGBoost:")
cm_xgb = results['XGBoost']['confusion_matrix']
print(f"   True Negatives:  {cm_xgb[0][0]}")
print(f"   False Positives: {cm_xgb[0][1]}")
print(f"   False Negatives: {cm_xgb[1][0]}")
print(f"   True Positives:  {cm_xgb[1][1]}")

print("\n🌲 Random Forest:")
cm_rf = results['Random Forest']['confusion_matrix']
print(f"   True Negatives:  {cm_rf[0][0]}")
print(f"   False Positives: {cm_rf[0][1]}")
print(f"   False Negatives: {cm_rf[1][0]}")
print(f"   True Positives:  {cm_rf[1][1]}")

# Feature importance comparison
print("\n⭐ FEATURE IMPORTANCE COMPARISON (Top 5)")
print("─" * 80)
print(f"{'Feature':<25} {'XGBoost':<15} {'Random Forest':<15}")
print("─" * 80)

xgb_imp = results['XGBoost']['feature_importance'].head(5)
rf_imp = results['Random Forest']['feature_importance'].head(5)

all_features = set(xgb_imp['feature'].tolist() + rf_imp['feature'].tolist())
for feature in sorted(all_features, key=lambda x: -max(
    xgb_imp[xgb_imp['feature']==x]['importance'].values[0] if x in xgb_imp['feature'].values else 0,
    rf_imp[rf_imp['feature']==x]['importance'].values[0] if x in rf_imp['feature'].values else 0
)):
    xgb_val = xgb_imp[xgb_imp['feature']==feature]['importance'].values[0] if feature in xgb_imp['feature'].values else 0
    rf_val = rf_imp[rf_imp['feature']==feature]['importance'].values[0] if feature in rf_imp['feature'].values else 0
    print(f"{feature:<25} {xgb_val:.4f}{'':>9} {rf_val:.4f}")

print("─" * 80)

# Final verdict
print("\n🏆 FINAL VERDICT")
print("─" * 80)

xgb_score = results['XGBoost']['accuracy']
rf_score = results['Random Forest']['accuracy']

if xgb_score > rf_score:
    winner = "XGBoost"
    diff = (xgb_score - rf_score) * 100
    reason = f"Better accuracy (+{diff:.2f}%)"
elif rf_score > xgb_score:
    winner = "Random Forest"
    diff = (rf_score - xgb_score) * 100
    reason = f"Better accuracy (+{diff:.2f}%)"
else:
    winner = "Tie"
    reason = "Same accuracy"
    
    # Check speed as tiebreaker
    if xgb_time < rf_time:
        winner = "XGBoost"
        reason = "Same accuracy, faster predictions"
    elif rf_time < xgb_time:
        winner = "Random Forest"
        reason = "Same accuracy, faster predictions"

print(f"Winner: {winner}")
print(f"Reason: {reason}")

if winner == "XGBoost":
    print("Recommendation: Use XGBoost for production")
elif winner == "Random Forest":
    print("Recommendation: Use Random Forest for production")
else:
    print("Recommendation: Both models perform equally well")

print("─" * 80)

# Save report to file
print("\n💾 Saving comparison report...")
report_file = 'ml_models/comparison_report.txt'

with open(report_file, 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("CRICKET WIN PREDICTION - MODEL COMPARISON REPORT\n")
    f.write("=" * 80 + "\n")
    f.write(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"Dataset: training_data_ipl.csv ({len(df)} samples)\n")
    f.write(f"Test Size: {len(X_test)} samples (20%)\n")
    
    f.write("\n" + "=" * 80 + "\n")
    f.write("PERFORMANCE METRICS\n")
    f.write("=" * 80 + "\n")
    f.write(f"{'Metric':<20} {'XGBoost':<15} {'Random Forest':<15} {'Winner':<15}\n")
    f.write("-" * 80 + "\n")
    
    for metric in metrics:
        xgb_val = results['XGBoost'][metric]
        rf_val = results['Random Forest'][metric]
        winner_str = 'XGBoost ✓' if xgb_val > rf_val else ('Random Forest ✓' if rf_val > xgb_val else 'Tie')
        f.write(f"{metric.replace('_', ' ').title():<20} {xgb_val:.4f}{'':>9} {rf_val:.4f}{'':>9} {winner_str:<15}\n")
    
    f.write("\n" + "=" * 80 + "\n")
    f.write("SPEED METRICS\n")
    f.write("=" * 80 + "\n")
    f.write(f"Prediction Time: XGBoost={xgb_time:.4f}s, Random Forest={rf_time:.4f}s\n")
    
    f.write("\n" + "=" * 80 + "\n")
    f.write("FINAL VERDICT\n")
    f.write("=" * 80 + "\n")
    f.write(f"Winner: {winner}\n")
    f.write(f"Reason: {reason}\n")

print(f"✅ Report saved: {report_file}")

print("\n" + "=" * 80)
print("✅ COMPARISON COMPLETE!")
print("=" * 80)