// popup.js - Popup Interface

document.addEventListener('DOMContentLoaded', function() {
  const scanBtn = document.getElementById('scanBtn');
  const statusDiv = document.getElementById('statusDiv');
  
  // Check backend connection status
  checkBackendConnection();
  
  // Scan button click handler
  scanBtn.addEventListener('click', async function() {
    try {
      scanBtn.disabled = true;
      scanBtn.innerHTML = '<span>⚙️</span> Scanning...';
      
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      // Inject content script and extract page content
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageText
      });
      
      // Get the extracted text
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return window.pageTextForVeritas || document.body.innerText;
        }
      });
      
      const pageText = results[0]?.result || '';
      
      if (!pageText.trim()) {
        throw new Error('No content found on this page');
      }
      
      // Send to background script for processing
      chrome.runtime.sendMessage({
        action: 'scan_page',
        content: pageText,
        tabId: tab.id
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          updateStatus('❌ Communication error', '#ef4444');
        } else if (response && response.success) {
          updateStatus('✅ Scan complete! Check the page.', '#10b981');
        } else {
          updateStatus('⚠️ ' + (response?.error || 'Scan failed'), '#f59e0b');
        }
        
        // Reset button
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span>🔍</span> Scan This Page';
        
        // Close popup after a delay
        setTimeout(() => window.close(), 1500);
      });
      
    } catch (error) {
      console.error('Scan error:', error);
      updateStatus('❌ ' + error.message, '#ef4444');
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<span>🔍</span> Scan This Page';
    }
  });
  
  async function checkBackendConnection() {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        updateStatus('🟢 Backend Online', '#10b981');
      } else {
        updateStatus('🟡 Backend Responding (Non-OK)', '#f59e0b');
      }
    } catch (error) {
      updateStatus('🔴 Backend Offline', '#ef4444');
      scanBtn.disabled = true;
    }
  }
  
  function updateStatus(message, color = '#64748b') {
    statusDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 5px; color: ${color};">
        ${message}
      </div>
    `;
  }
});

// Function to be injected into the page
function extractPageText() {
  // Get main content, avoiding navigation and footer elements
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post-content',
    '.article-body',
    '.entry-content'
  ];
  
  let content = '';
  
  // Try to find main content area first
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }
  
  // Fallback to body text if no content area found
  if (!content) {
    content = document.body.innerText;
  }
  
  // Clean up the text and store it
  const cleanText = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
    
  // Store in window for retrieval
  window.pageTextForVeritas = cleanText;
  
  return cleanText;
}