import os
import pickle
import sys

print("=" * 70)
print("🔍 MODEL LOADING DEBUG TEST")
print("=" * 70)

print(f"📂 Current Directory: {os.getcwd()}")
print(f"📂 Python Version: {sys.version}")
print()

# Check if models folder exists
if os.path.exists('models'):
    print("✅ 'models' folder exists")
    files = os.listdir('models')
    print(f"📁 Files in models/: {files}")
else:
    print("❌ 'models' folder NOT FOUND!")
    sys.exit(1)

print()

# Try loading XGBoost
print("🔄 Attempting to load XGBoost model...")
try:
    xgb_path = 'models/model_xgb.pkl'
    if os.path.exists(xgb_path):
        print(f"   ✅ File exists: {xgb_path}")
        file_size = os.path.getsize(xgb_path)
        print(f"   📦 File size: {file_size:,} bytes")
        
        with open(xgb_path, 'rb') as f:
            xgb_model = pickle.load(f)
        
        print(f"   ✅ XGBoost loaded successfully!")
        print(f"   🔧 Model type: {type(xgb_model).__name__}")
        print(f"   📊 Model class: {xgb_model.__class__}")
        
        # Try to get some model info
        if hasattr(xgb_model, 'get_params'):
            print(f"   ⚙️  Has get_params method")
        if hasattr(xgb_model, 'predict'):
            print(f"   ✅ Has predict method")
        if hasattr(xgb_model, 'predict_proba'):
            print(f"   ✅ Has predict_proba method")
            
    else:
        print(f"   ❌ File NOT found: {xgb_path}")
        
except Exception as e:
    print(f"   ❌ ERROR loading XGBoost: {e}")
    import traceback
    traceback.print_exc()

print()

# Try loading Random Forest
print("🔄 Attempting to load Random Forest model...")
try:
    rf_path = 'models/model_rf.pkl'
    if os.path.exists(rf_path):
        print(f"   ✅ File exists: {rf_path}")
        file_size = os.path.getsize(rf_path)
        print(f"   📦 File size: {file_size:,} bytes")
        
        with open(rf_path, 'rb') as f:
            rf_model = pickle.load(f)
        
        print(f"   ✅ Random Forest loaded successfully!")
        print(f"   🔧 Model type: {type(rf_model).__name__}")
        print(f"   📊 Model class: {rf_model.__class__}")
        
        # Try to get some model info
        if hasattr(rf_model, 'get_params'):
            print(f"   ⚙️  Has get_params method")
        if hasattr(rf_model, 'predict'):
            print(f"   ✅ Has predict method")
        if hasattr(rf_model, 'predict_proba'):
            print(f"   ✅ Has predict_proba method")
            
    else:
        print(f"   ❌ File NOT found: {rf_path}")
        
except Exception as e:
    print(f"   ❌ ERROR loading Random Forest: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 70)
print("✅ DEBUG TEST COMPLETE")
print("=" * 70)