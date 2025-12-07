import sys
import json
import pickle
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def load_model():
    """Load the trained XGBoost model"""
    try:
        # Load new XGBoost model (8720 IPL samples, 72.48% accuracy)
        with open('ml_models/models/model_xgb.pkl', 'rb') as f:
            model = pickle.load(f)
            print("✅ Loaded XGBoost model (72.48% accuracy, 8720 IPL samples)", file=sys.stderr)
            return model, 'XGBoost (72.48%)'
    except FileNotFoundError:
        try:
            # Fallback to old model if new one doesn't exist
            with open('ml_models/models/model.pkl', 'rb') as f:
                model = pickle.load(f)
                print("⚠️ Using old model (40 samples) - Train new model!", file=sys.stderr)
                return model, 'Old Model (40 samples)'
        except FileNotFoundError:
            print(json.dumps({
                "success": False,
                "error": "Model not found. Train model first: python ml_models/train_model.py"
            }))
            sys.exit(1)

def extract_features(match_data):
    """Extract features from match data"""
    current_innings = match_data['currentInnings']
    total_overs = match_data['totalOvers']
    innings = match_data['innings']
    
    if current_innings == 1:
        # First innings
        current = innings[0]
        score = current['score']
        wickets = current['wickets']
        overs = current['overs']
        
        features = {
            'current_score': score,
            'wickets_lost': wickets,
            'overs_played': overs,
            'total_overs': total_overs,
            'innings': 1,
            'run_rate': score / overs if overs > 0 else 0,
            'target': 0,
            'runs_needed': 0,
            'wickets_remaining': 10 - wickets,
            'required_run_rate': 0
        }
    else:
        # Second innings
        first = innings[0]
        current = innings[1]
        
        target = first['score'] + 1
        score = current['score']
        wickets = current['wickets']
        overs = current['overs']
        runs_needed = target - score
        overs_left = total_overs - overs
        
        features = {
            'current_score': score,
            'wickets_lost': wickets,
            'overs_played': overs,
            'total_overs': total_overs,
            'innings': 2,
            'run_rate': score / overs if overs > 0 else 0,
            'target': target,
            'runs_needed': runs_needed,
            'wickets_remaining': 10 - wickets,
            'required_run_rate': (runs_needed / overs_left) if overs_left > 0 else 0
        }
    
    return features

def predict_match(match_data):
    """Make prediction using XGBoost model"""
    try:
        model, model_name = load_model()
        features = extract_features(match_data)
        
        # Create DataFrame with correct feature order for XGBoost
        feature_columns = [
            'current_score', 'wickets_lost', 'overs_played', 'run_rate',
            'innings', 'target', 'runs_needed', 'wickets_remaining', 
            'required_run_rate'
        ]
        X = pd.DataFrame([features])[feature_columns]
        
        # Predict
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Current batting team
        current_innings = match_data['currentInnings']
        batting_team = match_data['innings'][current_innings - 1]['battingTeam']['_id']
        team_a = match_data['teamA']['_id']
        
        # Calculate probabilities - Convert numpy types to Python float
        if current_innings == 1:
            # First innings: batting team win probability
            if batting_team == team_a:
                team_a_prob = float(probabilities[1] * 100)
                team_b_prob = float(probabilities[0] * 100)
            else:
                team_a_prob = float(probabilities[0] * 100)
                team_b_prob = float(probabilities[1] * 100)
        else:
            # Second innings: chasing team win probability
            if batting_team == team_a:
                team_a_prob = float(probabilities[1] * 100)
                team_b_prob = float(probabilities[0] * 100)
            else:
                team_a_prob = float(probabilities[0] * 100)
                team_b_prob = float(probabilities[1] * 100)
        
        # Predicted score with realistic bounds
        if current_innings == 1:
            current_score = features['current_score']
            overs_played = features['overs_played']
            overs_left = features['total_overs'] - overs_played
            run_rate = features['run_rate']
            wickets_remaining = features['wickets_remaining']
            
            # Calculate projected score with wicket factor
            wicket_factor = wickets_remaining / 10
            acceleration = 1.15 if overs_left < 5 else 1.0
            predicted_score = int(current_score + (run_rate * overs_left * wicket_factor * acceleration))
            
            # Apply realistic bounds based on format
            if features['total_overs'] == 20:  # T20
                predicted_score = max(120, min(predicted_score, 240))
            elif features['total_overs'] == 50:  # ODI
                predicted_score = max(200, min(predicted_score, 400))
            else:  # Other formats
                predicted_score = max(100, min(predicted_score, int(features['total_overs'] * 12)))
                
        else:
            # Second innings - target is the predicted score
            predicted_score = int(features['target'])
        
        # Key factors
        key_factors = []
        if features['wickets_remaining'] <= 3:
            key_factors.append("Few wickets remaining")
        if features.get('required_run_rate', 0) > 12:
            key_factors.append("High required run rate")
        if features['run_rate'] > 8:
            key_factors.append("Strong batting performance")
        if features.get('required_run_rate', 0) > 0 and features['run_rate'] > features['required_run_rate']:
            key_factors.append("Ahead of required run rate")
        
        # Confidence - Convert to Python float
        max_prob = float(max(probabilities))
        if max_prob > 0.8:
            confidence = "high"
        elif max_prob > 0.6:
            confidence = "medium"
        else:
            confidence = "low"
        
        result = {
            "success": True,
            "data": {
                "winProbability": {
                    "teamA": float(round(team_a_prob, 2)),
                    "teamB": float(round(team_b_prob, 2))
                },
                "predictedScore": predicted_score,
                "keyFactors": key_factors,
                "confidence": confidence,
                "model": model_name
            }
        }
        
        return result
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {
            "success": False,
            "error": str(e)
        }


# === Main Entry Point ===
if __name__ == "__main__":
    import sys
    
    try:
        # Try reading from stdin (for Node.js bridge)
        if not sys.stdin.isatty():
            input_data = ""
            for line in sys.stdin:
                input_data += line
            
            if input_data.strip():
                match_data = json.loads(input_data.strip())
                result = predict_match(match_data)
                print(json.dumps(result))
                sys.exit(0)
        
        # If no stdin, show help message
        result = {
            "success": False,
            "error": "No match data provided via stdin",
            "usage": "echo '{...match_data...}' | python predict.py",
            "example": {
                "currentInnings": 1,
                "totalOvers": 20,
                "innings": [{
                    "score": 85,
                    "wickets": 2,
                    "overs": 10,
                    "battingTeam": {"_id": "team1"}
                }],
                "teamA": {"_id": "team1"}
            }
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)
        
    except json.JSONDecodeError as e:
        error_result = {
            "success": False,
            "error": f"Invalid JSON: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except Exception as e:
        import traceback
        error_result = {
            "success": False,
            "error": f"Prediction failed: {str(e)}",
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)