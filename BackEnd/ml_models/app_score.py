from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

print("=" * 70)
print("🎯 LOADING DUAL SCORE PREDICTION SYSTEM (XGBoost + Random Forest)")
print("=" * 70)

# Load XGBoost Score Model
xgb_score_model = None
xgb_score_paths = [
    'ml_models/models/model_score_xgb.pkl',
    'models/model_score_xgb.pkl',
    './model_score_xgb.pkl'
]

for path in xgb_score_paths:
    if os.path.exists(path):
        try:
            with open(path, 'rb') as f:
                xgb_score_model = pickle.load(f)
            print(f"✅ XGBoost Score Model loaded from: {path}")
            break
        except Exception as e:
            print(f"❌ Error loading XGBoost Score: {e}")

if not xgb_score_model:
    print("❌ XGBoost Score model NOT loaded!")
    print("💡 Run: python ml_models/train_score_xgboost.py")

# Load Random Forest Score Model
rf_score_model = None
rf_score_paths = [
    'ml_models/models/model_score_rf.pkl',
    'models/model_score_rf.pkl',
    './model_score_rf.pkl'
]

for path in rf_score_paths:
    if os.path.exists(path):
        try:
            with open(path, 'rb') as f:
                rf_score_model = pickle.load(f)
            print(f"✅ Random Forest Score Model loaded from: {path}")
            break
        except Exception as e:
            print(f"❌ Error loading RF Score: {e}")

if not rf_score_model:
    print("❌ Random Forest Score model NOT loaded!")
    print("💡 Run: python ml_models/train_score_random_forest.py")

print("=" * 70)

FEATURE_COLUMNS = [
    'current_score', 'wickets_lost', 'overs_played', 
    'run_rate', 'wickets_remaining', 'total_overs'
]

@app.route('/')
def home():
    return jsonify({
        'message': 'Cricket Score Prediction API - Dual Model System',
        'version': '1.0',
        'models': {
            'xgboost': 'loaded' if xgb_score_model else 'not available',
            'random_forest': 'loaded' if rf_score_model else 'not available'
        },
        'endpoints': {
            'predict_score_both': '/predict-score-both [POST]',
            'health': '/health [GET]'
        }
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'models': {
            'xgboost_score': 'loaded' if xgb_score_model else 'not loaded',
            'rf_score': 'loaded' if rf_score_model else 'not loaded'
        }
    })

def calculate_score_features(data):
    """Calculate features for score prediction"""
    current_score = data.get('current_score', 0)
    wickets_lost = data.get('wickets_lost', 0)
    overs_played = data.get('overs_played', 0)
    total_overs = data.get('total_overs', 20)
    
    run_rate = current_score / overs_played if overs_played > 0 else 0
    wickets_remaining = 10 - wickets_lost
    
    features = {
        'current_score': current_score,
        'wickets_lost': wickets_lost,
        'overs_played': overs_played,
        'run_rate': round(run_rate, 2),
        'wickets_remaining': wickets_remaining,
        'total_overs': total_overs
    }
    
    return pd.DataFrame([features])[FEATURE_COLUMNS]

@app.route('/predict-score-both', methods=['POST'])
def predict_score_both():
    """
    Get score predictions from both models
    
    Request:
    {
        "current_score": 85,
        "wickets_lost": 2,
        "overs_played": 10.0,
        "total_overs": 20
    }
    """
    try:
        data = request.json
        
        print(f"\n{'='*70}")
        print(f"🎯 DUAL SCORE PREDICTION REQUEST")
        print(f"{'='*70}")
        print(f"Data: {data}")
        
        # Validate
        required = ['current_score', 'wickets_lost', 'overs_played']
        for field in required:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing field: {field}'
                }), 400
        
        # Only predict for innings 1
        if data.get('innings', 1) != 1:
            return jsonify({
                'success': False,
                'error': 'Score prediction only available for first innings'
            }), 400
        
        # Check if innings complete
        total_overs = data.get('total_overs', 20)
        if data['overs_played'] >= total_overs:
            return jsonify({
                'success': False,
                'error': 'Innings already complete'
            }), 400
        
        data.setdefault('total_overs', 20)
        
        features_df = calculate_score_features(data)
        print(f"🧮 Features: {features_df.to_dict('records')[0]}")
        
        results = {}
        
        # XGBoost Prediction
        if xgb_score_model:
            print("\n🚀 XGBoost predicting...")
            xgb_pred = xgb_score_model.predict(features_df)[0]
            xgb_pred = max(data['current_score'], int(round(xgb_pred)))
            
            results['xgboost'] = {
                'predicted_score': xgb_pred,
                'model': 'XGBoost',
                'speed': 'Faster'
            }
            print(f"   ✅ XGBoost: {xgb_pred} runs")
        else:
            results['xgboost'] = {
                'error': 'Model not available',
                'predicted_score': None
            }
        
        # Random Forest Prediction
        if rf_score_model:
            print("\n🌲 Random Forest predicting...")
            rf_pred = rf_score_model.predict(features_df)[0]
            rf_pred = max(data['current_score'], int(round(rf_pred)))
            
            results['random_forest'] = {
                'predicted_score': rf_pred,
                'model': 'Random Forest',
                'speed': 'Moderate'
            }
            print(f"   ✅ Random Forest: {rf_pred} runs")
        else:
            results['random_forest'] = {
                'error': 'Model not available',
                'predicted_score': None
            }
        
        # Calculate average if both available
        average_pred = None
        if xgb_score_model and rf_score_model:
            average_pred = int(round((results['xgboost']['predicted_score'] + 
                                     results['random_forest']['predicted_score']) / 2))
            print(f"\n📊 Average Prediction: {average_pred} runs")
        
        print(f"{'='*70}\n")
        
        return jsonify({
            'success': True,
            'models': results,
            'average_prediction': average_pred,
            'match_context': {
                'current_score': data['current_score'],
                'wickets_lost': data['wickets_lost'],
                'overs_played': data['overs_played'],
                'overs_remaining': total_overs - data['overs_played']
            }
        })
        
    except Exception as e:
        import traceback
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 STARTING SCORE PREDICTION API")
    print("=" * 70)
    print("📡 Server: http://localhost:5002")
    print("🤖 Models:")
    print(f"   XGBoost: {'✅' if xgb_score_model else '❌'}")
    print(f"   Random Forest: {'✅' if rf_score_model else '❌'}")
    print("=" * 70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5002)