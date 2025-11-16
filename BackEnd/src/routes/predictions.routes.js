import express from 'express';

const router = express.Router();

// Cricket prediction algorithm - no API needed!
function predictMatchOutcome(matchData) {
  try {
    const currentInnings = matchData.innings[matchData.currentInnings - 1];
    const teamAScore = getTeamScore(matchData.teamA?._id, matchData);
    const teamBScore = getTeamScore(matchData.teamB?._id, matchData);
    
    let teamAWinProbability = 50;
    let predictedScore = 0;
    let keyFactors = [];
    let momentum = "neutral";
    let confidence = "medium";
    let reasoning = "";

    // FIRST INNINGS PREDICTION
    if (matchData.currentInnings === 1) {
      const battingTeam = teamAScore.isBatting ? 'teamA' : 'teamB';
      const currentScore = currentInnings.score || 0;
      const wicketsLost = currentInnings.wickets || 0;
      const oversPlayed = currentInnings.overs || 0;
      const oversRemaining = matchData.totalOvers - oversPlayed;
      
      // Calculate run rate
      const currentRunRate = oversPlayed > 0 ? currentScore / oversPlayed : 0;
      
      // Predict final score based on current run rate and wickets
      const wicketFactor = 1 - (wicketsLost * 0.08); // Each wicket reduces scoring ability
      const accelerationFactor = oversRemaining > 5 ? 1.15 : 1.3; // Death overs boost
      
      predictedScore = Math.round(
        currentScore + (currentRunRate * oversRemaining * wicketFactor * accelerationFactor)
      );
      
      // Adjust for wickets in hand
      if (wicketsLost >= 7) {
        predictedScore = Math.round(predictedScore * 0.85);
      } else if (wicketsLost <= 2) {
        predictedScore = Math.round(predictedScore * 1.1);
      }
      
      // Win probability based on predicted score
      if (predictedScore >= 200) {
        teamAWinProbability = battingTeam === 'teamA' ? 70 : 30;
        keyFactors.push("Excellent batting display - high scoring rate");
      } else if (predictedScore >= 180) {
        teamAWinProbability = battingTeam === 'teamA' ? 60 : 40;
        keyFactors.push("Strong total being built");
      } else if (predictedScore >= 160) {
        teamAWinProbability = 50;
        keyFactors.push("Competitive score expected");
      } else if (predictedScore >= 140) {
        teamAWinProbability = battingTeam === 'teamA' ? 40 : 60;
        keyFactors.push("Below par score - challenging target needed");
      } else {
        teamAWinProbability = battingTeam === 'teamA' ? 30 : 70;
        keyFactors.push("Low scoring innings - defensive bowling dominance");
      }
      
      // Run rate analysis
      if (currentRunRate > 9) {
        keyFactors.push(`Aggressive batting - ${currentRunRate.toFixed(2)} run rate`);
        momentum = battingTeam;
      } else if (currentRunRate < 6) {
        keyFactors.push(`Slow scoring rate - ${currentRunRate.toFixed(2)} RPO`);
        momentum = battingTeam === 'teamA' ? 'teamB' : 'teamA';
      } else {
        keyFactors.push(`Steady progress at ${currentRunRate.toFixed(2)} RPO`);
      }
      
      // Wickets analysis
      if (wicketsLost <= 2 && oversPlayed > 10) {
        keyFactors.push("Solid foundation - wickets in hand");
        confidence = "high";
      } else if (wicketsLost >= 6) {
        keyFactors.push("Lower order exposed - limited firepower");
        confidence = "medium";
      }
      
      reasoning = `Based on current run rate of ${currentRunRate.toFixed(2)}, ${wicketsLost} wickets lost, and ${oversRemaining} overs remaining, predicting a total of ${predictedScore}. ${wicketsLost <= 3 ? 'Good platform set for acceleration.' : 'Wickets lost may restrict final total.'}`;
    }
    
    // SECOND INNINGS PREDICTION (CHASE)
    else if (matchData.currentInnings === 2) {
      const target = matchData.innings[0]?.score + 1 || 0;
      const currentScore = currentInnings.score || 0;
      const wicketsLost = currentInnings.wickets || 0;
      const oversPlayed = currentInnings.overs || 0;
      const oversRemaining = matchData.totalOvers - oversPlayed;
      const runsNeeded = target - currentScore;
      
      // Calculate run rates
      const currentRunRate = oversPlayed > 0 ? currentScore / oversPlayed : 0;
      const requiredRunRate = oversRemaining > 0 ? runsNeeded / oversRemaining : 0;
      
      predictedScore = target; // Target is the benchmark
      
      // Base probability calculation
      const runRateDiff = currentRunRate - requiredRunRate;
      const wicketsRemaining = 10 - wicketsLost;
      const oversPercentage = (oversPlayed / matchData.totalOvers) * 100;
      
      // Complex win probability algorithm
      let baseProbability = 50;
      
      // Run rate factor (-5 to +5 range)
      if (runRateDiff > 3) {
        baseProbability += 35;
      } else if (runRateDiff > 2) {
        baseProbability += 25;
      } else if (runRateDiff > 1) {
        baseProbability += 15;
      } else if (runRateDiff > 0) {
        baseProbability += 10;
      } else if (runRateDiff > -1) {
        baseProbability -= 10;
      } else if (runRateDiff > -2) {
        baseProbability -= 20;
      } else {
        baseProbability -= 30;
      }
      
      // Wickets factor
      if (wicketsRemaining >= 8) {
        baseProbability += 10;
      } else if (wicketsRemaining >= 6) {
        baseProbability += 5;
      } else if (wicketsRemaining <= 3) {
        baseProbability -= 15;
      } else if (wicketsRemaining <= 2) {
        baseProbability -= 25;
      }
      
      // Pressure situations
      if (runsNeeded <= 20 && wicketsRemaining >= 4) {
        baseProbability += 15;
        keyFactors.push("Close to victory - comfortable position");
      } else if (runsNeeded <= 10) {
        baseProbability += 20;
        keyFactors.push("Victory within reach");
      }
      
      if (requiredRunRate > 12 && oversRemaining < 5) {
        baseProbability -= 20;
        keyFactors.push("Very high required rate in death overs");
      }
      
      // Determine which team is batting
      const chasingTeam = teamBScore.isBatting ? 'teamB' : 'teamA';
      
      if (chasingTeam === 'teamB') {
        teamAWinProbability = 100 - Math.max(5, Math.min(95, baseProbability));
      } else {
        teamAWinProbability = Math.max(5, Math.min(95, baseProbability));
      }
      
      // Key factors analysis
      if (requiredRunRate > currentRunRate + 2) {
        keyFactors.push(`Required RR ${requiredRunRate.toFixed(2)} well above current RR ${currentRunRate.toFixed(2)}`);
        momentum = chasingTeam === 'teamA' ? 'teamB' : 'teamA';
        confidence = "high";
      } else if (currentRunRate > requiredRunRate + 1) {
        keyFactors.push(`Ahead of required rate - comfortable chase`);
        momentum = chasingTeam;
        confidence = "high";
      } else {
        keyFactors.push(`Balanced chase - ${runsNeeded} needed from ${oversRemaining} overs`);
        confidence = "medium";
      }
      
      if (wicketsRemaining >= 7) {
        keyFactors.push("Plenty of wickets in hand");
      } else if (wicketsRemaining <= 3) {
        keyFactors.push("Running out of wickets - pressure mounting");
      }
      
      // Add run rate comparison
      keyFactors.push(`Current RR: ${currentRunRate.toFixed(2)} | Required RR: ${requiredRunRate.toFixed(2)}`);
      
      reasoning = `Chasing ${target}, need ${runsNeeded} runs from ${oversRemaining} overs with ${wicketsRemaining} wickets remaining. ${currentRunRate > requiredRunRate ? 'Ahead of the required rate.' : 'Behind the required rate - need acceleration.'}`;
    }
    
    return {
      success: true,
      data: {
        winProbability: {
          teamA: Math.round(teamAWinProbability),
          teamB: Math.round(100 - teamAWinProbability)
        },
        predictedScore: Math.round(predictedScore),
        keyFactors: keyFactors.slice(0, 4), // Limit to 4 factors
        momentum: momentum,
        confidence: confidence,
        reasoning: reasoning
      }
    };
    
  } catch (error) {
    console.error('Prediction calculation error:', error);
    throw error;
  }
}

// Helper function to get team score
function getTeamScore(teamId, matchData) {
  const currentInnings = matchData.innings[matchData.currentInnings - 1];
  
  if (currentInnings?.battingTeam?._id?.toString() === teamId?.toString()) {
    return {
      score: currentInnings.score || 0,
      wickets: currentInnings.wickets || 0,
      overs: currentInnings.overs || 0,
      isBatting: true
    };
  }
  
  if (matchData.innings[0]?.battingTeam?._id?.toString() === teamId?.toString()) {
    return {
      score: matchData.innings[0].score || 0,
      wickets: matchData.innings[0].wickets || 0,
      overs: matchData.innings[0].overs || 0,
      isBatting: false
    };
  }
  
  return { score: 0, wickets: 0, overs: 0, isBatting: false };
}

// Prediction endpoint
router.post('/predict-match', async (req, res) => {
  try {
    const { matchData } = req.body;
    
    if (!matchData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Match data is required' 
      });
    }

    console.log('Generating prediction for match...');

    const prediction = predictMatchOutcome(matchData);
    
    console.log('Prediction generated successfully:', prediction.data);

    res.json(prediction);

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate prediction' 
    });
  }
});

export default router;