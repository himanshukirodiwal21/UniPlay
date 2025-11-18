import json
from ml_models.predict import predict_match

# Scenario 1: Good start
test1 = {
    "teamA": {"_id": "team1"},
    "teamB": {"_id": "team2"},
    "currentInnings": 1,
    "totalOvers": 20,
    "innings": [{
        "score": 85,
        "wickets": 2,
        "overs": 10,
        "battingTeam": {"_id": "team1"}
    }]
}

# Scenario 2: Bad start
test2 = {
    "teamA": {"_id": "team1"},
    "teamB": {"_id": "team2"},
    "currentInnings": 1,
    "totalOvers": 20,
    "innings": [{
        "score": 45,
        "wickets": 6,
        "overs": 10,
        "battingTeam": {"_id": "team1"}
    }]
}

# Scenario 3: Late stage
test3 = {
    "teamA": {"_id": "team1"},
    "teamB": {"_id": "team2"},
    "currentInnings": 1,
    "totalOvers": 20,
    "innings": [{
        "score": 150,
        "wickets": 4,
        "overs": 18,
        "battingTeam": {"_id": "team1"}
    }]
}

for i, test in enumerate([test1, test2, test3], 1):
    result = predict_match(test)
    print(f"\n📊 Scenario {i}:")
    print(f"Score: {test['innings'][0]['score']}/{test['innings'][0]['wickets']} in {test['innings'][0]['overs']} overs")
    print(f"Predicted: {result['data']['predictedScore']}")
    print(f"Win%: Team A {result['data']['winProbability']['teamA']}%")