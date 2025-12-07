import json
from ml_models.predict import predict_match

scenarios = [
    {
        "name": "🔴 Very Low Score (45/5 in 10 overs)",
        "data": {
            "currentInnings": 1,
            "totalOvers": 20,
            "innings": [{
                "score": 45,
                "wickets": 5,
                "overs": 10,
                "battingTeam": {"_id": "team1"}
            }],
            "teamA": {"_id": "team1"},
            "teamB": {"_id": "team2"}
        }
    },
    {
        "name": "🟡 Medium Score (120/3 in 15 overs)",
        "data": {
            "currentInnings": 1,
            "totalOvers": 20,
            "innings": [{
                "score": 120,
                "wickets": 3,
                "overs": 15,
                "battingTeam": {"_id": "team1"}
            }],
            "teamA": {"_id": "team1"},
            "teamB": {"_id": "team2"}
        }
    },
    {
        "name": "🟢 High Score (180/2 in 18 overs)",
        "data": {
            "currentInnings": 1,
            "totalOvers": 20,
            "innings": [{
                "score": 180,
                "wickets": 2,
                "overs": 18,
                "battingTeam": {"_id": "team1"}
            }],
            "teamA": {"_id": "team1"},
            "teamB": {"_id": "team2"}
        }
    },
    {
        "name": "🔵 Chasing: Easy Target (30 needed, 8 overs, 7 wickets)",
        "data": {
            "currentInnings": 2,
            "totalOvers": 20,
            "innings": [
                {"score": 140, "wickets": 5, "overs": 20, "battingTeam": {"_id": "team1"}},
                {"score": 110, "wickets": 3, "overs": 12, "battingTeam": {"_id": "team2"}}
            ],
            "teamA": {"_id": "team1"},
            "teamB": {"_id": "team2"}
        }
    },
    {
        "name": "🔴 Chasing: Hard Target (70 needed, 4 overs, 2 wickets)",
        "data": {
            "currentInnings": 2,
            "totalOvers": 20,
            "innings": [
                {"score": 175, "wickets": 4, "overs": 20, "battingTeam": {"_id": "team1"}},
                {"score": 105, "wickets": 8, "overs": 16, "battingTeam": {"_id": "team2"}}
            ],
            "teamA": {"_id": "team1"},
            "teamB": {"_id": "team2"}
        }
    }
]

print("\n" + "="*70)
print(" "*20 + "🏏 MATCH PREDICTION TEST 🏏")
print("="*70)

for i, scenario in enumerate(scenarios, 1):
    print(f"\n{'='*70}")
    print(f"Test {i}: {scenario['name']}")
    print("="*70)
    
    result = predict_match(scenario['data'])
    
    if result['success']:
        data = result['data']
        print(f"✅ Team A Win Probability: {data['winProbability']['teamA']:.2f}%")
        print(f"✅ Team B Win Probability: {data['winProbability']['teamB']:.2f}%")
        print(f"📊 Predicted Final Score: {data['predictedScore']}")
        print(f"🎯 Confidence Level: {data['confidence'].upper()}")
        
        if data['keyFactors']:
            print(f"⚡ Key Factors:")
            for factor in data['keyFactors']:
                print(f"   • {factor}")
    else:
        print(f"❌ Error: {result['error']}")

print("\n" + "="*70)
print(" "*25 + "🎉 TESTING COMPLETE 🎉")
print("="*70 + "\n")