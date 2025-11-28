// content.js - Veritas UI

// 1. LISTENERS
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'status_update') showLoading(msg.message);
  if (msg.action === 'validation_complete') showResult(msg.result);
  if (msg.action === 'scan_complete') showScanResults(msg.results);
  if (msg.action === 'agent_error') showError(msg.error);
});

// 2. UI BUILDER
function createWidget() {
  let w = document.getElementById('veritas-widget');
  if (!w) {
    w = document.createElement('div');
    w.id = 'veritas-widget';
    w.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 380px; max-width: 90vw;
      background: #0f172a; color: white; z-index: 2147483647;
      border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      border: 1px solid #334155; overflow: hidden; 
      transition: all 0.3s ease; backdrop-filter: blur(10px);
    `;
    document.body.appendChild(w);
  }
  return w;
}

// 3. STATES
function showLoading(text) {
  const w = createWidget();
  w.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <div style="font-size: 24px; animation: spin 1s linear infinite;">⚙️</div>
      <h3 style="margin: 10px 0 5px; color: #10b981; font-size: 16px;">Veritas Agent</h3>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">${text}</p>
    </div>
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
  `;
}

function showResult(data) {
  const w = createWidget();
  const color = data.verdict === 'REAL' ? '#10b981' : data.verdict === 'FAKE' ? '#ef4444' : '#f59e0b';
  const icon = data.verdict === 'REAL' ? '✅' : data.verdict === 'FAKE' ? '❌' : '⚠️';

  // Clean up claim text for display
  const cleanClaim = data.claim.length > 100 ? data.claim.substring(0, 100) + '...' : data.claim;

  w.innerHTML = `
    <div style="background: ${color}20; padding: 15px; border-bottom: 1px solid ${color}; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <span style="font-size: 24px;">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 900; font-size: 18px; color: ${color}; letter-spacing: 1px;">${data.verdict}</div>
          <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">CONFIDENCE: ${Math.round(data.confidence * 100)}%</div>
        </div>
      </div>
      <button id="v-close" style="background:none; border:none; color:white; cursor:pointer; font-size: 20px; padding: 5px;">&times;</button>
    </div>
    
    <div style="padding: 15px;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 10px; font-style: italic;">
        "${cleanClaim}"
      </div>
      
      <div style="font-size: 13px; line-height: 1.6; color: #e2e8f0; margin-bottom: 15px;">
        ${formatSynthesis(data.analysis)}
      </div>

      ${data.sources && data.sources.length > 0 ? `
        <div style="border-top: 1px solid #334155; padding-top: 15px;">
          <div style="font-size: 10px; font-weight: bold; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">Verified Sources</div>
          ${data.sources.slice(0, 3).map(s => `
            <a href="${s.uri}" target="_blank" style="display: block; color: #3b82f6; font-size: 11px; text-decoration: none; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              🔗 ${s.title || 'Source Link'}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  const closeBtn = document.getElementById('v-close');
  if (closeBtn) {
    closeBtn.onclick = () => w.remove();
  }
}

function showScanResults(results) {
  const w = createWidget();
  w.innerHTML = `
    <div style="background: #1e293b; padding: 15px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; color: white; font-size: 16px;">📊 Page Scan Results</h3>
      <button id="v-close" style="background:none; border:none; color:white; cursor:pointer; font-size: 18px; padding: 5px;">&times;</button>
    </div>
    <div style="padding: 0; max-height: 400px; overflow-y: auto;">
      ${results.map((r, index) => `
        <div style="padding: 15px; border-bottom: 1px solid #334155;">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 5px; line-height: 1.4;">
            <strong>Claim ${index + 1}:</strong> "${r.claim.length > 80 ? r.claim.substring(0, 80) + '...' : r.claim}"
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 12px; color: ${
              r.verdict === 'REAL' ? '#10b981' : 
              r.verdict === 'FAKE' ? '#ef4444' : '#f59e0b'
            }">
              ${r.verdict === 'REAL' ? '✅' : r.verdict === 'FAKE' ? '❌' : '⚠️'} ${r.verdict}
            </span>
            <span style="font-size: 10px; background: #334155; padding: 2px 6px; border-radius: 4px;">
              ${Math.round(r.confidence * 100)}%
            </span>
          </div>
          ${r.explanation ? `
            <div style="font-size: 10px; color: #94a3b8; line-height: 1.3; margin-top: 5px;">
              ${r.explanation.substring(0, 150)}${r.explanation.length > 150 ? '...' : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    <div style="padding: 10px; background: #1e293b; text-align: center; border-top: 1px solid #334155;">
      <div style="font-size: 10px; color: #64748b;">
        Scanned ${results.length} claims • Right-click any text to verify individually
      </div>
    </div>
  `;
  
  const closeBtn = document.getElementById('v-close');
  if (closeBtn) {
    closeBtn.onclick = () => w.remove();
  }
}

function formatSynthesis(text) {
  if (!text) return 'Analysis completed.';
  
  // Convert markdown bold to HTML bold for display
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Limit length for popup display
  if (formatted.length > 300) {
    formatted = formatted.substring(0, 300) + '...';
  }
  
  return formatted;
}

function showError(msg) {
  const w = createWidget();
  w.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <div style="font-size: 24px; color: #ef4444;">⚠️</div>
      <h3 style="margin: 10px 0 5px; color: #ef4444; font-size: 16px;">Error</h3>
      <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">${msg}</p>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px;">
        Close
      </button>
    </div>
  `;
  setTimeout(() => {
    if (w && w.parentElement) w.remove();
  }, 5000);
}

// 4. PAGE CONTENT EXTRACTION
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
  
  // Clean up the text
  return content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
}