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


  if (request.action === 'capture_screenshot') {
    console.log('Background: Received capture_screenshot request', request.area);
    handleScreenshotCapture(request.area, sender.tab?.id)
      .then(res => {
        console.log('Background: Capture complete, sending response', res);
        sendResponse(res);
      })
      .catch(err => {
        console.error('Background: Capture error', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
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

// --- IMAGE CAPTURE FLOW ---
async function handleScreenshotCapture(area, tabId) {
  console.log('handleScreenshotCapture called with area:', area, 'tabId:', tabId);

  try {
    // Notify UI: Starting capture
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'status_update',
        status: 'capturing',
        message: '📸 Processing screenshot...'
      });
    }

    console.log('Taking screenshot of visible tab...');
    // Capture the full tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    console.log('Screenshot captured, data URL length:', dataUrl.length);

    // Crop the image to the selected area
    const croppedBase64 = await cropImage(dataUrl, area);

    if (!croppedBase64) {
      throw new Error('Failed to crop screenshot');
    }

    // 1. CALL IMAGE AGENT (Extract content from image)
    console.log("🖼️ Calling Image Agent...");
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'status_update',
        status: 'analyzing',
        message: '🔍 Analyzing image content...'
      });
    }

    const imageResponse = await fetch(`${API_BASE}/process-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Image: croppedBase64,
        userMessage: "Extract all claims and factual information from this image for fact-checking."
      })
    });

    if (!imageResponse.ok) throw new Error('Image processing failed');
    const imageResult = await imageResponse.json();

    if (!imageResult.extracted_content || imageResult.extracted_content.includes('Failed to process')) {
      throw new Error('No readable content found in image');
    }

    // 2. CALL CHECK AGENT (Fact-check the extracted content)
    console.log("✨ Calling Check Agent for image content...");
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'status_update',
        status: 'fact_checking',
        message: '✨ Fact-checking content...'
      });
    }

    const checkResponse = await fetch(`${API_BASE}/check-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: imageResult.extracted_content })
    });

    if (!checkResponse.ok) throw new Error('Fact-checking failed');
    const checkResult = await checkResponse.json();

    // 3. CALL SYNTHESIS AGENT (Create human-readable report)
    console.log("🔮 Calling Synthesis Agent...");
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'status_update',
        status: 'synthesizing',
        message: '🔮 Generating report...'
      });
    }

    const synthesisResponse = await fetch(`${API_BASE}/synthesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery: `Image content: ${imageResult.extracted_content}`,
        checkResult: checkResult
      })
    });

    const synthesisResult = await synthesisResponse.json();

    // 4. COMBINE & RETURN (Same format as text verification)
    const finalPacket = {
      claim: imageResult.extracted_content,
      verdict: checkResult.verdict,
      confidence: checkResult.confidence,
      sources: checkResult.sources,
      analysis: synthesisResult.text,
      extracted_content: imageResult.extracted_content
    };

    // 5. Send to UI (using image-specific display)
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'image_validation_complete',
        result: finalPacket
      });
    }

    return { success: true, data: finalPacket };

  } catch (error) {
    console.error("Image capture error:", error);
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'agent_error', error: error.message });
    }
    return { success: false, error: error.message };
  }
}

// Helper function to crop image
async function cropImage(dataUrl, area) {
  console.log('cropImage called with area:', area);

  return new Promise((resolve) => {
    try {
      console.log('Creating OffscreenCanvas...');
      const canvas = new OffscreenCanvas(area.width, area.height);
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        console.log('Image loaded, cropping...');
        ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

        canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 }).then(blob => {
          console.log('Canvas converted to blob, size:', blob.size);
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            console.log('Image cropped successfully, base64 length:', base64.length);
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        }).catch(blobError => {
          console.error('Blob conversion error:', blobError);
          resolve(null);
        });
      };
      img.onerror = (imgError) => {
        console.error('Image load error:', imgError);
        resolve(null);
      };
      img.src = dataUrl;

    } catch (error) {
      console.error('Image cropping error:', error);
      resolve(null);
    }
  });
}