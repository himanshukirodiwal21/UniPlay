import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ML Prediction using Python
function predictWithML(matchData) {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python';
    
    // Fix: Use process.cwd() for correct path
    const scriptPath = path.join(process.cwd(), 'ml_models', 'predict.py');
    
    console.log('🐍 Starting Python ML prediction...');
    console.log('📂 Script path:', scriptPath);
    
    // Spawn Python process
    const pythonProcess = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true  // Important for Windows!
    });
    
    let stdoutData = '';
    let stderrData = '';
    let processStarted = false;
    
    // Timeout handler
    const timeout = setTimeout(() => {
      if (!processStarted) {
        pythonProcess.kill();
        reject(new Error('Python process timeout'));
      }
    }, 10000); // 10 second timeout
    
    // Prepare input
    const inputData = JSON.stringify(matchData) + '\n';
    
    // Send data to Python
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
    processStarted = true;
    
    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      console.log(`🏁 Python process exited with code: ${code}`);
      
      if (code !== 0) {
        console.error('❌ Python stderr:', stderrData);
        reject(new Error(`Python process failed with code ${code}: ${stderrData}`));
        return;
      }
      
      try {
        // Parse only the last valid JSON (ignore print statements)
        const lines = stdoutData.trim().split('\n');
        let jsonResult = null;
        
        // Find the JSON result (search from end)
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const parsed = JSON.parse(lines[i]);
            if (parsed.success !== undefined) {
              jsonResult = parsed;
              break;
            }
          } catch (e) {
            // Not JSON, skip
            continue;
          }
        }
        
        if (!jsonResult) {
          throw new Error('No valid JSON found in Python output');
        }
        
        if (jsonResult.success) {
          console.log('✅ ML Prediction successful:', jsonResult.data);
          resolve(jsonResult);
        } else {
          console.error('❌ Prediction failed:', jsonResult.error);
          reject(new Error(jsonResult.error));
        }
        
      } catch (error) {
        console.error('❌ JSON parse error:', error.message);
        console.error('Raw Python output:', stdoutData);
        reject(error);
      }
    });
    
    // Handle spawn errors
    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to start Python process:', error);
      reject(error);
    });
  });
}

// Fallback: JavaScript prediction
function predictWithJS(matchData) {
  try {
    const currentInnings = matchData.innings[matchData.currentInnings - 1];
    const currentScore = currentInnings?.score || 0;
    const wicketsLost = currentInnings?.wickets || 0;
    const oversPlayed = currentInnings?.overs || 0;
    const oversRemaining = matchData.totalOvers - oversPlayed;
    
    const currentRunRate = oversPlayed > 0 ? currentScore / oversPlayed : 0;
    const wicketFactor = 1 - (wicketsLost * 0.08);
    const predictedScore = Math.round(
      currentScore + (currentRunRate * oversRemaining * wicketFactor * 1.15)
    );
    
    let teamAProb = 50;
    if (matchData.currentInnings === 1) {
      if (predictedScore >= 180) teamAProb = 65;
      else if (predictedScore >= 160) teamAProb = 55;
      else if (predictedScore <= 140) teamAProb = 35;
    }
    
    return {
      success: true,
      data: {
        winProbability: {
          teamA: teamAProb,
          teamB: 100 - teamAProb
        },
        predictedScore: predictedScore,
        keyFactors: ["Fallback JavaScript prediction"],
        momentum: "neutral",
        confidence: "low",
        model: "JavaScript Fallback"
      }
    };
  } catch (error) {
    throw error;
  }
}

// Main Prediction Endpoint
router.post('/predict-match', async (req, res) => {
  try {
    const { matchData } = req.body;
    
    if (!matchData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Match data is required' 
      });
    }

    console.log('🎯 Prediction requested for match');

    try {
      // Try ML prediction
      const prediction = await predictWithML(matchData);
      res.json(prediction);
      
    } catch (mlError) {
      // Fallback to JS
      console.warn('⚠️ ML prediction failed, using fallback:', mlError.message);
      const prediction = predictWithJS(matchData);
      res.json(prediction);
    }

  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate prediction' 
    });
  }
});

export default router;