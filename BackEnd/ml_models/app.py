from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

print("🔄 Loading models and encoders...")

# Load Winner Prediction Model
try:
    model = joblib.load('models/match_winner_model.pkl')
    le_team1 = joblib.load('models/le_team1.pkl')
    le_team2 = joblib.load('models/le_team2.pkl')
    le_venue = joblib.load('models/le_venue.pkl')
    le_toss_winner = joblib.load('models/le_toss_winner.pkl')
    le_toss_decision = joblib.load('models/le_toss_decision.pkl')
    le_winner = joblib.load('models/le_winner.pkl')
    
    with open('models/metadata.json', 'r') as f:
        metadata = json.load(f)
    
    print("✅ Winner prediction model loaded successfully!")
    print(f"📊 Accuracy: {metadata['accuracy'] * 100:.2f}%")
    print(f"🏏 Total Teams: {metadata['total_teams']}")
    print(f"🏟️ Total Venues: {len(metadata['venues'])}")
    
except Exception as e:
    print(f"❌ Error loading winner model: {e}")
    exit(1)

# Load Score Prediction Model
try:
    score_model = joblib.load('models/score_predictor.pkl')
    le_team_score = joblib.load('models/le_team_score.pkl')
    le_venue_score = joblib.load('models/le_venue_score.pkl')
    le_toss_winner_score = joblib.load('models/le_toss_winner_score.pkl')
    le_toss_decision_score = joblib.load('models/le_toss_decision_score.pkl')
    print("✅ Score prediction model loaded successfully!")
except Exception as e:
    print(f"⚠️ Score model not loaded: {e}")
    print("ℹ️ Run 'python score_predictor.py' to train the model")
    score_model = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'IPL Match Winner Prediction API',
        'version': '2.0',
        'endpoints': {
            'predict': '/predict [POST] - Base ML prediction',
            'predict_live': '/predict-live [POST] - Context-aware live prediction',
            'predict_score': '/predict-score [POST] - Score prediction',
            'metadata': '/metadata [GET]',
            'health': '/health [GET]'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Base ML prediction without live context"""
    try:
        data = request.json
        print(f"📥 Received data: {data}")
        
        # Validate input
        required_fields = ['team1', 'team2', 'venue', 'toss_winner', 'toss_decision']
        for field in required_fields:
            if field not in data:
                error_msg = f'Missing field: {field}'
                print(f"❌ Error: {error_msg}")
                return jsonify({
                    'success': False,
                    'error': error_msg
                }), 400
        
        # Extract features
        team1 = data['team1']
        team2 = data['team2']
        venue = data['venue']
        toss_winner = data['toss_winner']
        toss_decision = data['toss_decision'].lower()
        
        print(f"🏏 Processing: {team1} vs {team2} at {venue}")
        
        # Validate teams
        if team1 not in le_team1.classes_:
            error_msg = f'Invalid team1: {team1}'
            print(f"❌ Error: {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
            
        if team2 not in le_team2.classes_:
            return jsonify({
                'success': False,
                'error': f'Invalid team2: {team2}'
            }), 400
        
        # Encode features
        team1_enc = le_team1.transform([team1])[0]
        team2_enc = le_team2.transform([team2])[0]
        venue_enc = le_venue.transform([venue])[0]
        toss_winner_enc = le_toss_winner.transform([toss_winner])[0]
        toss_decision_enc = le_toss_decision.transform([toss_decision])[0]
        
        # Prepare input
        features = np.array([[team1_enc, team2_enc, venue_enc, 
                             toss_winner_enc, toss_decision_enc]])
        
        # Predict
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        # Decode prediction
        winner = le_winner.inverse_transform([prediction])[0]
        
        # Get probability for predicted winner
        winner_prob = float(max(probabilities)) * 100
        
        return jsonify({
            'success': True,
            'predicted_winner': winner,
            'confidence': round(winner_prob, 2),
            'team1': team1,
            'team2': team2,
            'venue': venue
        })
    
    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': f'Invalid value: {str(ve)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict-live', methods=['POST'])
def predict_live():
    """
    ML-powered live match prediction with context awareness
    Considers: wickets, current score, overs, target (for 2nd innings)
    """
    try:
        data = request.json
        print(f"\n{'='*60}")
        print(f"📥 LIVE PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"Data: {data}")
        
        # Extract match context
        team1 = data['team1']
        team2 = data['team2']
        venue = data['venue']
        toss_winner = data['toss_winner']
        toss_decision = data['toss_decision'].lower()
        
        # Live match data
        innings = data.get('innings', 1)
        current_score = data.get('current_score', 0)
        current_wickets = data.get('current_wickets', 0)
        current_overs = data.get('current_overs', 0)
        target_score = data.get('target_score', 0)
        batting_team = data.get('batting_team', team1)
        
        print(f"🏏 Match: {team1} vs {team2} at {venue}")
        print(f"📊 Innings {innings}: {current_score}/{current_wickets} in {current_overs} overs")
        print(f"🎯 Batting Team: {batting_team}")
        if innings == 2:
            print(f"🎯 Target: {target_score + 1}")
        
        # === BASE ML PREDICTION ===
        team1_enc = le_team1.transform([team1])[0]
        team2_enc = le_team2.transform([team2])[0]
        venue_enc = le_venue.transform([venue])[0]
        toss_winner_enc = le_toss_winner.transform([toss_winner])[0]
        toss_decision_enc = le_toss_decision.transform([toss_decision])[0]
        
        features = np.array([[team1_enc, team2_enc, venue_enc, 
                             toss_winner_enc, toss_decision_enc]])
        
        base_prediction = model.predict(features)[0]
        base_probabilities = model.predict_proba(features)[0]
        
        base_winner = le_winner.inverse_transform([base_prediction])[0]
        base_confidence = float(max(base_probabilities)) * 100
        
        print(f"🤖 Base ML Prediction: {base_winner} ({base_confidence:.1f}%)")
        
        # === ML-POWERED CONTEXT ADJUSTMENT ===
        
        if innings == 1:
            # First innings - use base prediction with slight adjustment for wickets
            team1_prob = base_confidence if base_winner == team1 else (100 - base_confidence)
            team2_prob = 100 - team1_prob
            
            # Minor adjustment for wickets in first innings
            if current_overs > 0:
                wicket_penalty = (current_wickets / 10) * 5  # Max 5% penalty
                if batting_team == team1:
                    team1_prob = max(10, team1_prob - wicket_penalty)
                    team2_prob = 100 - team1_prob
                else:
                    team2_prob = max(10, team2_prob - wicket_penalty)
                    team1_prob = 100 - team2_prob
            
            print(f"📊 Innings 1 Probabilities: Team1={team1_prob:.1f}%, Team2={team2_prob:.1f}%")
            
        elif innings == 2:
            # Second innings - ML-based dynamic calculation
            runs_needed = target_score - current_score + 1
            balls_left = (20 - current_overs) * 6
            wickets_left = 10 - current_wickets
            
            print(f"🎲 Chase Analysis:")
            print(f"   Runs Needed: {runs_needed}")
            print(f"   Balls Left: {balls_left}")
            print(f"   Wickets Left: {wickets_left}")
            
            if runs_needed <= 0:
                # Already won
                print(f"✅ Match Won by {batting_team}!")
                team1_prob = 100 if batting_team == team1 else 0
                team2_prob = 100 - team1_prob
                
            elif wickets_left == 0:
                # All out - lost
                print(f"❌ All Out! Match Lost")
                team1_prob = 0 if batting_team == team1 else 100
                team2_prob = 100 - team1_prob
                
            elif balls_left <= 0:
                # Overs finished - lost
                print(f"⏰ Overs Finished! Match Lost")
                team1_prob = 0 if batting_team == team1 else 100
                team2_prob = 100 - team1_prob
                
            else:
                # === ML-STYLE FEATURE ENGINEERING ===
                
                # Required run rate
                required_rr = (runs_needed / balls_left) * 6 if balls_left > 0 else 100
                current_rr = (current_score / current_overs) if current_overs > 0 else 0
                
                print(f"📈 Run Rates: Current={current_rr:.2f}, Required={required_rr:.2f}")
                
                # Feature 1: Wickets Strength (exponential decay - realistic cricket impact)
                # This mimics how tail-enders reduce win probability exponentially
                wicket_strength = np.power(wickets_left / 10, 1.5)  # Exponential: 10 wkts=1.0, 5 wkts=0.35, 2 wkts=0.09
                
                # Feature 2: Run Rate Pressure (sigmoid function - ML style)
                # Transforms required RR into probability (6 RR = easy, 15 RR = impossible)
                rr_pressure = 1 / (1 + np.exp((required_rr - 8) / 2.5))
                
                # Feature 3: Balls Remaining Factor
                balls_factor = min(1.0, balls_left / 72)  # 72 balls = 12 overs (comfortable chase)
                
                # Feature 4: Runs Remaining Factor (normalized)
                runs_factor = 1 - min(1.0, runs_needed / 120)  # 120 runs = very difficult
                
                # Feature 5: Current Momentum (how far ahead/behind current RR is)
                rr_diff = current_rr - required_rr
                if current_overs >= 2:  # Only after 2 overs
                    if rr_diff > 4:
                        momentum = 0.9   # Way ahead
                    elif rr_diff > 2:
                        momentum = 0.75  # Ahead
                    elif rr_diff > -1:
                        momentum = 0.55  # On track
                    elif rr_diff > -3:
                        momentum = 0.35  # Behind
                    else:
                        momentum = 0.15  # Far behind
                else:
                    momentum = 0.5  # Neutral in early overs
                
                print(f"🧮 ML Features:")
                print(f"   wicket_strength: {wicket_strength:.3f}")
                print(f"   rr_pressure: {rr_pressure:.3f}")
                print(f"   balls_factor: {balls_factor:.3f}")
                print(f"   runs_factor: {runs_factor:.3f}")
                print(f"   momentum: {momentum:.3f}")
                
                # === WEIGHTED ML-STYLE PROBABILITY CALCULATION ===
                # Weights tuned based on cricket dynamics
                batting_win_prob = (
                    wicket_strength * 35 +    # 35% weight - wickets are crucial
                    rr_pressure * 25 +        # 25% weight - required RR difficulty
                    balls_factor * 15 +       # 15% weight - time available
                    runs_factor * 10 +        # 10% weight - runs remaining
                    momentum * 15             # 15% weight - current form
                )
                
                # Clamp between 5-95% (realistic bounds)
                batting_win_prob = max(5, min(95, batting_win_prob))
                
                print(f"🎲 Calculated Batting Win Probability: {batting_win_prob:.1f}%")
                
                # Assign to correct teams
                if batting_team == team1:
                    team1_prob = batting_win_prob
                    team2_prob = 100 - batting_win_prob
                else:
                    team2_prob = batting_win_prob
                    team1_prob = 100 - batting_win_prob
        
        else:
            # Invalid innings
            print(f"⚠️ Invalid innings number: {innings}")
            team1_prob = 50
            team2_prob = 50
        
        # Determine final winner
        final_winner = team1 if team1_prob > team2_prob else team2
        final_confidence = max(team1_prob, team2_prob)
        
        print(f"\n{'='*60}")
        print(f"✅ FINAL ML PREDICTION")
        print(f"{'='*60}")
        print(f"Winner: {final_winner} ({final_confidence:.1f}%)")
        print(f"{team1}: {team1_prob:.1f}%")
        print(f"{team2}: {team2_prob:.1f}%")
        print(f"{'='*60}\n")
        
        return jsonify({
            'success': True,
            'predicted_winner': final_winner,
            'confidence': round(final_confidence, 2),
            'probabilities': {
                'team1': round(team1_prob, 2),
                'team2': round(team2_prob, 2)
            },
            'base_ml_prediction': {
                'winner': base_winner,
                'confidence': round(base_confidence, 2)
            },
            'context': {
                'innings': innings,
                'current_score': current_score,
                'current_wickets': current_wickets,
                'current_overs': current_overs,
                'batting_team': batting_team
            }
        })
        
    except Exception as e:
        print(f"❌ Live prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict-score', methods=['POST'])
def predict_score():
    """Predict first innings score using ML model"""
    try:
        if not score_model:
            return jsonify({
                'success': False,
                'error': 'Score prediction model not available. Run: python score_predictor.py'
            }), 503
        
        data = request.json
        print(f"📥 Score prediction request: {data}")
        
        # Extract features
        team = data.get('team', data.get('team1'))
        venue = data['venue']
        toss_winner = data['toss_winner']
        toss_decision = data['toss_decision'].lower()
        
        # Current match context
        current_score = data.get('current_score', 0)
        current_overs = data.get('current_overs', 0)
        current_wickets = data.get('current_wickets', 0)
        
        print(f"🏏 Score prediction for: {team} at {venue}")
        print(f"📊 Current: {current_score}/{current_wickets} in {current_overs} overs")
        
        # Validate team
        if team not in le_team_score.classes_:
            return jsonify({
                'success': False,
                'error': f'Invalid team: {team}'
            }), 400
        
        if venue not in le_venue_score.classes_:
            venue = le_venue_score.classes_[0]
            print(f"⚠️ Venue not found, using default: {venue}")
        
        # Encode features
        team_enc = le_team_score.transform([team])[0]
        venue_enc = le_venue_score.transform([venue])[0]
        toss_winner_enc = le_toss_winner_score.transform([toss_winner])[0]
        toss_decision_enc = le_toss_decision_score.transform([toss_decision])[0]
        
        # ML prediction
        features = np.array([[team_enc, venue_enc, toss_winner_enc, toss_decision_enc]])
        predicted_final_score = score_model.predict(features)[0]
        
        # Adjust based on current match situation
        if current_overs > 0 and current_overs < 20:
            overs_remaining = 20 - current_overs
            
            # ML-based adjustment considering wickets
            wicket_factor = (10 - current_wickets) / 10  # Remaining batting strength
            
            # Predicted runs in remaining overs
            remaining_runs = (predicted_final_score - current_score) * (overs_remaining / (20 - current_overs))
            remaining_runs *= wicket_factor  # Reduce if wickets lost
            
            adjusted_score = current_score + remaining_runs
            
            # Ensure realistic bounds
            min_score = current_score + (overs_remaining * 5)  # Min 5 RPO
            predicted_final_score = max(min_score, adjusted_score)
        
        predicted_final_score = int(round(predicted_final_score))
        
        print(f"✅ Predicted final score: {predicted_final_score}")
        
        return jsonify({
            'success': True,
            'predicted_score': predicted_final_score,
            'current_score': current_score,
            'current_overs': current_overs,
            'team': team,
            'venue': venue
        })
        
    except Exception as e:
        print(f"❌ Score prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/metadata', methods=['GET'])
def get_metadata():
    return jsonify({
        'success': True,
        'data': metadata
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'models': {
            'winner_prediction': 'loaded',
            'score_prediction': 'loaded' if score_model else 'not available',
            'live_prediction': 'enabled'
        },
        'accuracy': f"{metadata['accuracy'] * 100:.2f}%"
    })

if __name__ == '__main__':
    print("\n🚀 Starting Flask API server...")
    print("📡 Server running on http://localhost:5000")
    print("📖 API Documentation: http://localhost:5000/")
    print("✨ Features: Base ML + Live Context-Aware Predictions")
    app.run(debug=True, port=5000, host='0.0.0.0')