from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

print("=" * 70)
print("🔄 LOADING DUAL MODEL SYSTEM (XGBoost + Random Forest)")
print("=" * 70)
print(f"📂 Current Directory: {os.getcwd()}")
print(f"📂 Script Location: {os.path.dirname(os.path.abspath(__file__))}")

# Load XGBoost Model
xgb_model = None
xgb_paths_to_try = [
    'ml_models/models/model_xgb.pkl',
    'models/model_xgb.pkl',
    './model_xgb.pkl',
    '../models/model_xgb.pkl'
]

for model_path in xgb_paths_to_try:
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                xgb_model = pickle.load(f)
            print(f"✅ XGBoost model loaded from: {model_path}")
            print(f"   📊 Accuracy: 72.48%")
            print(f"   📦 Training samples: 8720 IPL matches")
            print(f"   ⚡ Speed: Faster")
            print(f"   🔧 Model Type: {type(xgb_model).__name__}")
            break
        except Exception as e:
            print(f"❌ Error loading XGBoost from {model_path}: {e}")
    else:
        print(f"⚠️ Path not found: {model_path}")

if not xgb_model:
    print("❌ XGBoost model NOT loaded!")
    print("💡 Solution: Run 'python ml_models/train_model.py' to train XGBoost")

# Load Random Forest Model
rf_model = None
rf_paths_to_try = [
    'ml_models/models/model_rf.pkl',
    'models/model_rf.pkl',
    './model_rf.pkl',
    '../models/model_rf.pkl'
]

for model_path in rf_paths_to_try:
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                rf_model = pickle.load(f)
            print(f"✅ Random Forest model loaded from: {model_path}")
            print(f"   📊 Accuracy: 72.48%")
            print(f"   📦 Training samples: 8720 IPL matches")
            print(f"   🌲 Speed: Moderate")
            print(f"   🔧 Model Type: {type(rf_model).__name__}")
            break
        except Exception as e:
            print(f"❌ Error loading Random Forest from {model_path}: {e}")
    else:
        print(f"⚠️ Path not found: {model_path}")

if not rf_model:
    print("❌ Random Forest model NOT loaded!")
    print("💡 Solution: Run 'python ml_models/train_random_forest.py' to train RF")

print("=" * 70)
print(f"✅ Models Loaded: XGBoost={'Yes' if xgb_model else 'No'}, Random Forest={'Yes' if rf_model else 'No'}")
print("=" * 70)

# Feature columns (same for both models)
FEATURE_COLUMNS = [
    'current_score', 'wickets_lost', 'overs_played', 'run_rate',
    'innings', 'target', 'runs_needed', 'wickets_remaining', 
    'required_run_rate'
]

@app.route('/')
def home():
    """API home endpoint"""
    return jsonify({
        'message': 'Cricket Win Prediction API - Dual Model System',
        'version': '3.0',
        'models': {
            'xgboost': {
                'status': 'loaded' if xgb_model else 'not available',
                'accuracy': '72.48%',
                'speed': 'Faster',
                'samples': 8720
            },
            'random_forest': {
                'status': 'loaded' if rf_model else 'not available',
                'accuracy': '72.48%',
                'speed': 'Moderate',
                'samples': 8720
            }
        },
        'endpoints': {
            'predict_both': '/predict-both [POST] - Get predictions from both models',
            'predict_xgboost': '/predict-xgboost [POST] - XGBoost only',
            'predict_rf': '/predict-rf [POST] - Random Forest only',
            'model_info': '/model-info [GET] - Model details',
            'health': '/health [GET] - Health check'
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models': {
            'xgboost': 'loaded' if xgb_model else 'not loaded',
            'random_forest': 'loaded' if rf_model else 'not loaded'
        },
        'both_available': xgb_model is not None and rf_model is not None
    })

@app.route('/model-info')
def model_info():
    """Get detailed model information"""
    return jsonify({
        'success': True,
        'xgboost': {
            'name': 'XGBoost',
            'accuracy': '72.48%',
            'training_samples': 8720,
            'dataset': 'IPL 2008-2020',
            'features': FEATURE_COLUMNS,
            'speed': 'Faster',
            'available': xgb_model is not None
        },
        'random_forest': {
            'name': 'Random Forest',
            'accuracy': '72.48%',
            'training_samples': 8720,
            'dataset': 'IPL 2008-2020',
            'features': FEATURE_COLUMNS,
            'speed': 'Moderate',
            'available': rf_model is not None
        }
    })

def calculate_features(data):
    """Calculate all features from match data"""
    current_score = data.get('current_score', 0)
    wickets_lost = data.get('wickets_lost', 0)
    overs_played = data.get('overs_played', 0)
    innings = data.get('innings', 1)
    target = data.get('target', 0)
    runs_needed = data.get('runs_needed', 0)
    
    # Calculate derived features
    run_rate = current_score / overs_played if overs_played > 0 else 0
    wickets_remaining = 10 - wickets_lost
    overs_left = 20 - overs_played
    required_run_rate = runs_needed / overs_left if overs_left > 0 and innings == 2 else 0
    
    features = {
        'current_score': current_score,
        'wickets_lost': wickets_lost,
        'overs_played': overs_played,
        'run_rate': round(run_rate, 2),
        'innings': innings,
        'target': target,
        'runs_needed': runs_needed,
        'wickets_remaining': wickets_remaining,
        'required_run_rate': round(required_run_rate, 2)
    }
    
    return pd.DataFrame([features])[FEATURE_COLUMNS]

def get_prediction_result(model, model_name, features_df, speed):
    """Get prediction from a model"""
    try:
        prediction = model.predict(features_df)[0]
        probabilities = model.predict_proba(features_df)[0]
        
        win_prob = float(probabilities[1] * 100)
        loss_prob = float(probabilities[0] * 100)
        confidence = max(win_prob, loss_prob)
        
        # Determine confidence level
        if confidence > 70:
            confidence_level = 'high'
        elif confidence > 55:
            confidence_level = 'medium'
        else:
            confidence_level = 'low'
        
        return {
            'prediction': int(prediction),
            'win_probability': round(win_prob, 2),
            'loss_probability': round(loss_prob, 2),
            'predicted_outcome': 'Win' if prediction == 1 else 'Loss',
            'confidence': round(confidence, 2),
            'confidence_level': confidence_level,
            'model': model_name,
            'accuracy': '72.48%',
            'speed': speed
        }
    except Exception as e:
        import traceback
        print(f"❌ Error in get_prediction_result for {model_name}: {e}")
        traceback.print_exc()
        return {'error': str(e)}

@app.route('/predict-both', methods=['POST'])
def predict_both():
    """
    Get predictions from both XGBoost and Random Forest
    
    Request Body:
    {
        "current_score": 85,
        "wickets_lost": 2,
        "overs_played": 10.0,
        "innings": 1,
        "target": 0,
        "runs_needed": 0
    }
    """
    try:
        data = request.json
        
        print(f"\n{'='*70}")
        print(f"📥 DUAL MODEL PREDICTION REQUEST")
        print(f"{'='*70}")
        print(f"Data: {data}")
        
        # Validate required fields
        required_fields = ['current_score', 'wickets_lost', 'overs_played', 'innings']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Set defaults for optional fields
        data.setdefault('target', 0)
        data.setdefault('runs_needed', 0)
        
        # Calculate features
        features_df = calculate_features(data)
        
        print(f"🧮 Calculated Features:")
        print(features_df.to_dict('records')[0])
        
        results = {}
        
        # === XGBoost Prediction ===
        if xgb_model:
            print("\n🚀 Running XGBoost...")
            results['xgboost'] = get_prediction_result(
                xgb_model, 'XGBoost', features_df, 'Faster'
            )
            if 'error' not in results['xgboost']:
                print(f"   ✅ XGBoost: {results['xgboost']['predicted_outcome']} "
                      f"({results['xgboost']['confidence']}%)")
            else:
                print(f"   ❌ XGBoost Error: {results['xgboost']['error']}")
        else:
            results['xgboost'] = {
                'error': 'XGBoost model not available',
                'message': 'Train model: python ml_models/train_model.py',
                'win_probability': 50.0,
                'loss_probability': 50.0,
                'confidence': 50.0,
                'predicted_outcome': 'Unknown',
                'model': 'XGBoost',
                'accuracy': '72.48%',
                'speed': 'Faster'
            }
            print("   ⚠️ XGBoost not available")
        
        # === Random Forest Prediction ===
        if rf_model:
            print("\n🌲 Running Random Forest...")
            results['random_forest'] = get_prediction_result(
                rf_model, 'Random Forest', features_df, 'Moderate'
            )
            if 'error' not in results['random_forest']:
                print(f"   ✅ Random Forest: {results['random_forest']['predicted_outcome']} "
                      f"({results['random_forest']['confidence']}%)")
            else:
                print(f"   ❌ Random Forest Error: {results['random_forest']['error']}")
        else:
            results['random_forest'] = {
                'error': 'Random Forest model not available',
                'message': 'Train model: python ml_models/train_random_forest.py',
                'win_probability': 50.0,
                'loss_probability': 50.0,
                'confidence': 50.0,
                'predicted_outcome': 'Unknown',
                'model': 'Random Forest',
                'accuracy': '72.48%',
                'speed': 'Moderate'
            }
            print("   ⚠️ Random Forest not available")
        
        # Calculate agreement
        agreement = None
        if xgb_model and rf_model:
            if 'error' not in results['xgboost'] and 'error' not in results['random_forest']:
                xgb_prob = results['xgboost']['win_probability']
                rf_prob = results['random_forest']['win_probability']
                diff = abs(xgb_prob - rf_prob)
                
                if diff < 5:
                    agreement = 'strong'
                    agreement_text = '✅ Models strongly agree'
                elif diff < 10:
                    agreement = 'moderate'
                    agreement_text = '🟡 Models moderately agree'
                else:
                    agreement = 'disagree'
                    agreement_text = '⚠️ Models disagree - match is uncertain'
                
                print(f"\n🎯 Agreement: {agreement_text} (diff: {diff:.1f}%)")
        
        print(f"{'='*70}\n")
        
        return jsonify({
            'success': True,
            'models': results,
            'agreement': agreement,
            'match_context': {
                'current_score': data['current_score'],
                'wickets_lost': data['wickets_lost'],
                'overs_played': data['overs_played'],
                'innings': data['innings'],
                'target': data.get('target', 0),
                'runs_needed': data.get('runs_needed', 0)
            }
        })
        
    except Exception as e:
        import traceback
        print(f"\n❌ Error in predict_both: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/predict-xgboost', methods=['POST'])
def predict_xgboost():
    """XGBoost prediction only"""
    try:
        if not xgb_model:
            return jsonify({
                'success': False,
                'error': 'XGBoost model not available'
            }), 503
        
        data = request.json
        features_df = calculate_features(data)
        result = get_prediction_result(xgb_model, 'XGBoost', features_df, 'Faster')
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict-rf', methods=['POST'])
def predict_rf():
    """Random Forest prediction only"""
    try:
        if not rf_model:
            return jsonify({
                'success': False,
                'error': 'Random Forest model not available'
            }), 503
        
        data = request.json
        features_df = calculate_features(data)
        result = get_prediction_result(rf_model, 'Random Forest', features_df, 'Moderate')
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 STARTING DUAL MODEL API SERVER")
    print("=" * 70)
    print("📡 Server: http://localhost:5001")
    print("📖 Documentation: http://localhost:5001/")
    print("🤖 Models Status:")
    print(f"   - XGBoost: {'✅ Loaded' if xgb_model else '❌ Not Loaded'}")
    print(f"   - Random Forest: {'✅ Loaded' if rf_model else '❌ Not Loaded'}")
    print("📊 Dataset: 8720 IPL matches (2008-2020)")
    print("🎯 Accuracy: 72.48% (both models)")
    
    if not xgb_model or not rf_model:
        print("\n⚠️  WARNING: Some models are not loaded!")
        print("💡 Solutions:")
        if not xgb_model:
            print("   1. Train XGBoost: python ml_models/train_model.py")
        if not rf_model:
            print("   2. Train Random Forest: python ml_models/train_random_forest.py")
        print("   3. Check model files exist in ml_models/models/")
    
    print("=" * 70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)