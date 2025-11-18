import json
from ml_models.predict import predict_match

# Read test data
with open('test_prediction.json', 'r') as f:
    match_data = json.load(f)

# Predict
result = predict_match(match_data)

# Print result
print(json.dumps(result, indent=2))