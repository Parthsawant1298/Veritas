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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'veritas-check' && info.selectionText) {
    try {
      // Ensure content script is injected
      await ensureContentScriptInjected(tab.id);
      // Run verification flow
      runVerificationFlow(info.selectionText, tab.id);
    } catch (error) {
      console.error('Context menu error:', error);
    }
  }
});

// Helper function to ensure content script is injected
async function ensureContentScriptInjected(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch (error) {
    // Content script not loaded, inject it
    console.log('Injecting content script...');
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    // Give it a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Helper function to send messages safely
async function sendMessageSafely(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.log('Message send failed, retrying...');
    try {
      // Try to inject content script and retry
      await ensureContentScriptInjected(tabId);
      await chrome.tabs.sendMessage(tabId, message);
    } catch (retryError) {
      console.error('Failed to send message after retry:', retryError);
    }
  }
}

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

// --- CORE AGENTIC FLOW (MATCHING MAIN.JSX) ---
async function runVerificationFlow(text, tabId) {
  try {
    // STEP 1: Main Agent decides what to do (like main.jsx)
    if (tabId) {
      await sendMessageSafely(tabId, {
        action: 'status_update',
        status: 'thinking',
        message: '🤖 Main Agent analyzing...'
      });
    }

    console.log("🚀 Calling Main Agent...");
    const mainResponse = await fetch(`${API_BASE}/main-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText: text })
    });

    if (!mainResponse.ok) throw new Error('Main Agent failed');
    const plan = await mainResponse.json();

    if (plan.action === "DELEGATE_TO_CHECKER") {
      // STEP 2: Check Agent verification (like main.jsx)
      if (tabId) {
        await sendMessageSafely(tabId, {
          action: 'status_update',
          status: 'thinking',
          message: '🔍 Check Agent verifying...'
        });
      }

      console.log("🚀 Calling Check Agent...");
      const checkResponse = await fetch(`${API_BASE}/check-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: plan.checker_query })
      });

      if (!checkResponse.ok) throw new Error('Check Agent failed');
      const checkResult = await checkResponse.json();

      // STEP 3: Synthesis Agent (like main.jsx)
      if (tabId) {
        await sendMessageSafely(tabId, {
          action: 'status_update',
          status: 'synthesizing',
          message: '✨ Synthesizing response...'
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

      if (!synthesisResponse.ok) throw new Error('Synthesis failed');
      const synthesisResult = await synthesisResponse.json();

      // 4. COMBINE & RETURN (like main.jsx)
      const finalPacket = {
        claim: text,
        verdict: checkResult.verdict,
        confidence: checkResult.confidence,
        sources: checkResult.sources,
        analysis: synthesisResult.text
      };

      // 5. Send to UI
      if (tabId) {
        await sendMessageSafely(tabId, {
          action: 'validation_complete',
          result: finalPacket
        });
      }

      return { success: true, data: finalPacket };

    } else {
      // Handle other plan actions (like DIRECT_REPLY)
      const responseText = plan.reply_text || "I can help you verify information.";

      if (tabId) {
        await sendMessageSafely(tabId, {
          action: 'validation_complete',
          result: {
            claim: text,
            verdict: 'INFO',
            confidence: 1.0,
            sources: [],
            analysis: responseText
          }
        });
      }

      return { success: true, data: { analysis: responseText } };
    }

  } catch (error) {
    console.error("Agent Error:", error);
    if (tabId) {
      await sendMessageSafely(tabId, { action: 'agent_error', error: error.message });
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
        await sendMessageSafely(tabId, { 
          action: 'agent_error', 
          error: 'No verifiable claims found on this page.' 
        });
      }
      return { success: false, error: 'No claims found' };
    }

    // Notify UI
    if (tabId) {
      await sendMessageSafely(tabId, { 
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
      await sendMessageSafely(tabId, { 
        action: 'scan_complete', 
        results: results
      });
    }

    return { success: true, results: results };

  } catch (error) {
    console.error("Page scan error:", error);
    if (tabId) {
      await sendMessageSafely(tabId, { action: 'agent_error', error: error.message });
    }
    return { success: false, error: error.message };
  }
}

// --- IMAGE CAPTURE FLOW (MATCHING MAIN.JSX) ---
async function handleScreenshotCapture(area, tabId) {
  console.log('handleScreenshotCapture called with area:', area, 'tabId:', tabId);

  try {
    // Notify UI: Starting capture
    if (tabId) {
      await sendMessageSafely(tabId, {
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

    // STEP 1: Process image first (like main.jsx)
    console.log("🖼️ Calling Image Agent...");
    if (tabId) {
      await sendMessageSafely(tabId, {
        action: 'status_update',
        status: 'analyzing',
        message: '🖼️ Image Agent processing...'
      });
    }

    const imageResponse = await fetch(`${API_BASE}/process-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Image: croppedBase64,
        userMessage: "Verify content in captured image"
      })
    });

    if (!imageResponse.ok) throw new Error('Image processing failed');
    const imageResult = await imageResponse.json();

    if (!imageResult.extracted_content || imageResult.extracted_content.includes('Failed to process')) {
      throw new Error('No readable content found in image');
    }

    // STEP 2: Send extracted content to Check Agent (like main.jsx)
    console.log("🔍 Calling Check Agent for image content...");
    if (tabId) {
      await sendMessageSafely(tabId, {
        action: 'status_update',
        status: 'fact_checking',
        message: '🔍 Check Agent verifying image content...'
      });
    }

    const checkResponse = await fetch(`${API_BASE}/check-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: imageResult.combined_query })
    });

    if (!checkResponse.ok) throw new Error('Fact-checking failed');
    const checkResult = await checkResponse.json();

    // STEP 3: Synthesis (like main.jsx)
    console.log("✨ Calling Synthesis Agent...");
    if (tabId) {
      await sendMessageSafely(tabId, {
        action: 'status_update',
        status: 'synthesizing',
        message: '✨ Synthesizing image analysis...'
      });
    }

    const synthesisResponse = await fetch(`${API_BASE}/synthesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery: "Image analysis: Verify content in uploaded image",
        checkResult: checkResult
      })
    });

    if (!synthesisResponse.ok) throw new Error('Synthesis failed');
    const synthesisResult = await synthesisResponse.json();

    // 4. COMBINE & RETURN (like main.jsx)
    const finalPacket = {
      claim: imageResult.extracted_content,
      verdict: checkResult.verdict,
      confidence: checkResult.confidence,
      sources: checkResult.sources,
      analysis: synthesisResult.text,
      extracted_content: imageResult.extracted_content
    };

    // 5. Send to UI
    if (tabId) {
      await sendMessageSafely(tabId, {
        action: 'image_validation_complete',
        result: finalPacket
      });
    }

    return { success: true, data: finalPacket };

  } catch (error) {
    console.error("Image capture error:", error);
    if (tabId) {
      await sendMessageSafely(tabId, { action: 'agent_error', error: error.message });
    }
    return { success: false, error: error.message };
  }
}

// Helper function to crop image
async function cropImage(dataUrl, area) {
  console.log('cropImage called with area:', area);
  try {
    console.log('Converting dataURL to blob...');

    // Convert data URL to Blob in a worker-safe way
    const resp = await fetch(dataUrl);
    const srcBlob = await resp.blob();

    // Create an ImageBitmap from the blob (available in workers)
    const bitmap = await createImageBitmap(srcBlob);

    console.log('Creating OffscreenCanvas and drawing bitmap...');
    const canvas = new OffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext('2d');

    // Draw the selected region from the full bitmap
    ctx.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

    // Convert to Blob
    const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });

    // Convert blob -> base64 (arrayBuffer -> binary -> btoa) safely in chunks
    const arrayBuffer = await croppedBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 0x8000; // 32KB chunk size
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);

    console.log('Image cropped successfully, base64 length:', base64.length);
    return base64;

  } catch (error) {
    console.error('Image cropping error:', error);
    return null;
  }
}