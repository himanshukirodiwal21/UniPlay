import joblib
import numpy as np

print("🏆 Testing Famous IPL Finals\n")

# Load model
model = joblib.load('models/match_winner_model.pkl')
le_team1 = joblib.load('models/le_team1.pkl')
le_team2 = joblib.load('models/le_team2.pkl')
le_venue = joblib.load('models/le_venue.pkl')
le_toss_winner = joblib.load('models/le_toss_winner.pkl')
le_toss_decision = joblib.load('models/le_toss_decision.pkl')
le_winner = joblib.load('models/le_winner.pkl')

# Famous IPL Finals
test_cases = [
    {
        'name': 'IPL 2019 Final',
        'team1': 'Mumbai Indians',
        'team2': 'Chennai Super Kings',
        'venue': 'Rajiv Gandhi International Stadium',
        'toss_winner': 'Mumbai Indians',
        'toss_decision': 'bat',
        'actual_winner': 'Mumbai Indians'
    },
    {
        'name': 'IPL 2020 Final',
        'team1': 'Mumbai Indians',
        'team2': 'Delhi Capitals',
        'venue': 'Dubai International Cricket Stadium',
        'toss_winner': 'Mumbai Indians',
        'toss_decision': 'field',
        'actual_winner': 'Mumbai Indians'
    },
    {
        'name': 'IPL 2021 Final',
        'team1': 'Chennai Super Kings',
        'team2': 'Kolkata Knight Riders',
        'venue': 'Dubai International Cricket Stadium',
        'toss_winner': 'Kolkata Knight Riders',
        'toss_decision': 'field',
        'actual_winner': 'Chennai Super Kings'
    },
]

correct = 0
total = 0

for match in test_cases:
    try:
        # Encode
        team1_enc = le_team1.transform([match['team1']])[0]
        team2_enc = le_team2.transform([match['team2']])[0]
        venue_enc = le_venue.transform([match['venue']])[0]
        toss_winner_enc = le_toss_winner.transform([match['toss_winner']])[0]
        toss_decision_enc = le_toss_decision.transform([match['toss_decision']])[0]
        
        # Predict
        features = np.array([[team1_enc, team2_enc, venue_enc, 
                             toss_winner_enc, toss_decision_enc]])
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        predicted_winner = le_winner.inverse_transform([prediction])[0]
        confidence = max(probabilities) * 100
        
        is_correct = predicted_winner == match['actual_winner']
        if is_correct:
            correct += 1
        total += 1
        
        status = "✅" if is_correct else "❌"
        
        print(f"{status} {match['name']}")
        print(f"   Match: {match['team1']} vs {match['team2']}")
        print(f"   Venue: {match['venue']}")
        print(f"   Predicted: {predicted_winner} ({confidence:.1f}%)")
        print(f"   Actual: {match['actual_winner']}")
        print()
        
    except Exception as e:
        print(f"⚠️ Error in {match['name']}: {e}\n")

print("=" * 60)
print(f"📊 Results: {correct}/{total} correct")
print(f"🎯 Accuracy: {(correct/total)*100:.1f}%")