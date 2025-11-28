// background.js - Veritas Orchestrator

// POINT TO YOUR FASTAPI BACKEND
const API_BASE = 'http://localhost:8000/api';

// Initialize Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'veritas-check',
    title: 'Verify with Veritas Agent',
    contexts: ['selection']
  });
});

// Handle Context Menu (Selection Mode)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'veritas-check' && info.selectionText) {
    runVerificationFlow(info.selectionText, tab.id);
  }
});

// Handle Messages from Popup/Content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'check_selection') {
    runVerificationFlow(request.text, sender.tab?.id || request.tabId)
      .then(res => sendResponse(res));
    return true; // Async
  }
  
  if (request.action === 'scan_page') {
    runPageScan(request.content, sender.tab?.id || request.tabId)
      .then(res => sendResponse(res));
    return true; // Async
  }
});

// --- CORE AGENTIC FLOW ---
async function runVerificationFlow(text, tabId) {
  try {
    // 1. Notify UI: Agent Started
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { 
        action: 'status_update', 
        status: 'thinking', 
        message: '🔍 Check Agent analyzing...' 
      });
    }

    // 2. CALL CHECK AGENT (The Researcher)
    console.log("🚀 Calling Check Agent...");
    const checkResponse = await fetch(`${API_BASE}/check-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text })
    });
    
    if (!checkResponse.ok) throw new Error('Check Agent failed');
    const checkResult = await checkResponse.json();

    // 3. CALL SYNTHESIS AGENT (The Spokesperson)
    console.log("✨ Calling Synthesis Agent...");
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { 
        action: 'status_update', 
        status: 'synthesizing', 
        message: '✨ Synthesizing report...' 
      });
    }
    
    const synthesisResponse = await fetch(`${API_BASE}/synthesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userQuery: text,
        checkResult: checkResult 
      })
    });

    const synthesisResult = await synthesisResponse.json();

    // 4. COMBINE & RETURN
    const finalPacket = {
      claim: text,
      verdict: checkResult.verdict,        // REAL / FAKE / UNCERTAIN
      confidence: checkResult.confidence,  // 0.0 - 1.0
      sources: checkResult.sources,        // Array of links
      analysis: synthesisResult.text       // The human-readable synthesis
    };

    // 5. Send to UI
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { 
        action: 'validation_complete', 
        result: finalPacket 
      });
    }

    return { success: true, data: finalPacket };

  } catch (error) {
    console.error("Agent Error:", error);
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'agent_error', error: error.message });
    }
    return { success: false, error: error.message };
  }
}

// --- PAGE SCAN MODE ---
async function runPageScan(pageText, tabId) {
  try {
    // Simple heuristic: Take first 5 "claim-like" sentences
    const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [];
    const claims = sentences
      .filter(s => s.length > 30 && s.length < 300) // Filter short/long noise
      .filter(s => !s.includes('©') && !s.includes('Privacy')) // Filter footer text
      .slice(0, 5); // Take top 5

    if (claims.length === 0) {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { 
          action: 'agent_error', 
          error: 'No verifiable claims found on this page.' 
        });
      }
      return { success: false, error: 'No claims found' };
    }

    // Notify UI
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { 
        action: 'status_update', 
        status: 'scanning', 
        message: `📡 Scanning ${claims.length} claims...` 
      });
    }

    // Run Check Agent in Parallel (Like your Swarm)
    const results = await Promise.all(claims.map(async (claim, index) => {
      try {
        const res = await fetch(`${API_BASE}/check-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: claim.trim() })
        });
        
        if (!res.ok) throw new Error('Check failed');
        const result = await res.json();
        
        return {
          claim: claim.trim(),
          verdict: result.verdict,
          confidence: result.confidence,
          explanation: result.explanation,
          sources: result.sources || []
        };
      } catch (err) {
        console.error(`Error checking claim ${index + 1}:`, err);
        return {
          claim: claim.trim(),
          verdict: 'UNCERTAIN',
          confidence: 0,
          explanation: 'Failed to verify this claim.',
          sources: []
        };
      }
    }));

    // Send aggregated results
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { 
        action: 'scan_complete', 
        results: results
      });
    }

    return { success: true, results: results };

  } catch (error) {
    console.error("Page scan error:", error);
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'agent_error', error: error.message });
    }
    return { success: false, error: error.message };
  }
}