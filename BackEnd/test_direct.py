import sys
import json

print("🔍 Starting test...")
print(f"Python version: {sys.version}")

try:
    print("📦 Importing predict function...")
    from ml_models.predict import predict_match
    print("✅ Import successful!")
    
    # Test data
    test_data = {
        "teamA": {"_id": "team1", "name": "Team A"},
        "teamB": {"_id": "team2", "name": "Team B"},
        "currentInnings": 1,
        "totalOvers": 20,
        "innings": [{
            "score": 85,
            "wickets": 3,
            "overs": 12,
            "battingTeam": {"_id": "team1"}
        }]
    }
    
    print("📊 Test data prepared")
    print(json.dumps(test_data, indent=2))
    
    print("\n🎯 Running prediction...")
    result = predict_match(test_data)
    
    print("\n✅ RESULT:")
    print(json.dumps(result, indent=2))
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print(f"Current directory: {sys.path}")
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()