# main.py
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal, Any, Dict
import os
import json
import re
from datetime import datetime
import random
import string
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment variable
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable must be set")

# Initialize Google GenAI client
client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class Source(BaseModel):
    title: str
    uri: str

class CheckAgentResponse(BaseModel):
    verdict: Literal['REAL', 'FAKE', 'UNCERTAIN']
    confidence: float
    explanation: str
    sources: List[Source]

class OrchestratorResponse(BaseModel):
    action: Literal['DIRECT_REPLY', 'DELEGATE_TO_CHECKER', 'SCAN_CRISIS']
    reasoning: str
    reply_text: Optional[str] = None
    checker_query: Optional[str] = None
    scan_topic: Optional[str] = None

class CrisisTrend(BaseModel):
    id: str
    topic: str
    claim: str
    severity: Literal['HIGH', 'MEDIUM', 'LOW']
    verdict: Literal['REAL', 'FAKE', 'UNCERTAIN']
    volume: int
    timestamp: datetime

# Request models
class TranscribeRequest(BaseModel):
    base64Audio: str
    mimeType: str = "audio/webm"

class TTSRequest(BaseModel):
    text: str

class MainAgentRequest(BaseModel):
    userText: str

class CheckAgentRequest(BaseModel):
    query: str

class ScanCrisisRequest(BaseModel):
    topic: str

class SynthesisRequest(BaseModel):
    userQuery: str
    checkResult: CheckAgentResponse

# --- TOOLS DEFINITION (EXACT SAME AS TYPESCRIPT) ---
LIVE_AGENT_TOOLS = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="verify_fact",
                description="Verify a claim, news, or fact using the Check Agent. Use this for ANY objective question regarding reality, news, weather, or data.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "query": types.Schema(
                            type=types.Type.STRING,
                            description="The specific claim or fact to check."
                        )
                    },
                    required=["query"]
                )
            )
        ]
    )
]

CHECKER_TOOLS = [types.Tool(google_search=types.GoogleSearch())]

# --- AGENT 0: TRANSCRIBER (LEGACY / TEXT MODE) ---
@app.post("/api/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    try:
        clean_mime = request.mimeType.split(';')[0].strip()
        if not clean_mime:
            clean_mime = 'audio/webm'

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=types.Content(
                parts=[
                    types.Part(
                        inline_data=types.Blob(
                            mime_type=clean_mime,
                            data=request.base64Audio
                        )
                    ),
                    types.Part(
                        text="Listen to this audio. Output ONLY the verbatim spoken text. Do not reply to the speaker. If silence, output nothing."
                    )
                ]
            ),
            config=types.GenerateContentConfig(temperature=0.0)
        )
        
        return {"text": response.text or ""}
    except Exception as error:
        print(f"Transcription Error: {error}")
        return {"text": ""}

# --- AGENT 0.5: TTS (LEGACY / TEXT MODE) ---
@app.post("/api/tts")
async def generate_speech(request: TTSRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=types.Content(parts=[types.Part(text=request.text)]),
            config=types.GenerateContentConfig(
                response_modalities=[types.Modality.AUDIO],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Kore'
                        )
                    )
                )
            )
        )

        base64_audio = None
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        base64_audio = part.inline_data.data
                        break

        return {"audio": base64_audio}
    except Exception as error:
        print(f"TTS Error: {error}")
        return {"audio": None}

# --- AGENT 1: MAIN AGENT (REST) ---
orchestrator_schema = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "action": types.Schema(
            type=types.Type.STRING,
            enum=['DIRECT_REPLY', 'DELEGATE_TO_CHECKER', 'SCAN_CRISIS'],
            description="Use DELEGATE for specific checks. Use SCAN_CRISIS if user asks to 'scan', 'monitor', 'find trends', or 'check news' about a broad topic."
        ),
        "reasoning": types.Schema(
            type=types.Type.STRING,
            description="Internal thought process."
        ),
        "reply_text": types.Schema(
            type=types.Type.STRING,
            description="Response if DIRECT_REPLY."
        ),
        "checker_query": types.Schema(
            type=types.Type.STRING,
            description="Optimized search query for the Check Agent."
        ),
        "scan_topic": types.Schema(
            type=types.Type.STRING,
            description="The broad topic to scan for emerging misinformation."
        )
    },
    required=['action', 'reasoning']
)

@app.post("/api/main-agent", response_model=OrchestratorResponse)
async def run_main_agent(request: MainAgentRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.userText,
            config=types.GenerateContentConfig(
                system_instruction="You are the Main Agent. Route queries. If factual/news/weather, DELEGATE_TO_CHECKER. If user asks to scan, monitor, or find latest rumors, use SCAN_CRISIS.",
                response_mime_type="application/json",
                response_schema=orchestrator_schema,
                temperature=0.3
            )
        )
        
        text = response.text
        if not text:
            raise Exception("No response")
        
        return json.loads(text)
    except Exception as error:
        print(f"Main Agent Error: {error}")
        return OrchestratorResponse(
            action='DIRECT_REPLY',
            reasoning='Error',
            reply_text="System error."
        )

# --- AGENT 2: CHECK AGENT (REST) ---
@app.post("/api/check-agent", response_model=CheckAgentResponse)
async def run_check_agent(request: CheckAgentRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f'Fact check: "{request.query}". Format: VERDICT: [REAL/FAKE/UNCERTAIN], CONFIDENCE: [0.0-1.0], EXPLANATION: [...]',
            config=types.GenerateContentConfig(
                tools=CHECKER_TOOLS,
                temperature=0.1
            )
        )

        grounding_chunks = []
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                grounding_chunks = candidate.grounding_metadata.grounding_chunks or []

        sources = []
        for chunk in grounding_chunks:
            if hasattr(chunk, 'web') and chunk.web:
                sources.append(Source(
                    title=chunk.web.title,
                    uri=chunk.web.uri
                ))

        text = response.text or ""
        
        verdict = 'UNCERTAIN'
        confidence = 0.5

        # Parse verdict
        verdict_match = re.search(r'VERDICT:\s*(REAL|FAKE|UNCERTAIN)', text, re.IGNORECASE)
        if verdict_match:
            verdict = verdict_match.group(1).upper()

        # Parse confidence
        confidence_match = re.search(r'CONFIDENCE:\s*([0-9]*\.?[0-9]+)', text, re.IGNORECASE)
        if confidence_match:
            confidence = float(confidence_match.group(1))

        # Extract explanation
        explanation = re.sub(r'VERDICT:.*(\n|$)', '', text, flags=re.IGNORECASE)
        explanation = re.sub(r'CONFIDENCE:.*(\n|$)', '', explanation, flags=re.IGNORECASE)
        explanation = explanation.strip()

        return CheckAgentResponse(
            verdict=verdict,
            confidence=confidence,
            explanation=explanation,
            sources=sources[:5]
        )
    except Exception as error:
        print(f"Check Agent Error: {error}")
        return CheckAgentResponse(
            verdict='UNCERTAIN',
            confidence=0.0,
            explanation="Tool access failed.",
            sources=[]
        )

# --- AGENT 3: CRISIS SCANNER (SWARM) ---
@app.post("/api/scan-crisis", response_model=List[CrisisTrend])
async def scan_crisis_trends(request: ScanCrisisRequest):
    try:
        # Step 1: Find trending narratives using Grounding
        scan_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f'Find the top 3 trending rumors, news headlines, or viral claims currently circulating about: "{request.topic}". Return ONLY a JSON array of strings, no markdown.',
            config=types.GenerateContentConfig(
                tools=CHECKER_TOOLS  # Use Search to find what's trending
                # responseMimeType: "application/json" # REMOVED: Cannot be used with googleSearch
            )
        )
        
        claims = []
        try:
            # Clean potentially markdown-formatted JSON since responseMimeType is disabled
            clean_text = scan_response.text or "[]"
            clean_text = clean_text.replace('```json', '').replace('```', '').strip()
            claims = json.loads(clean_text)
        except Exception as e:
            print(f"Parse error: {e}")

        if len(claims) == 0:
            return []

        # Step 2: Spawn Parallel Check Agents
        async def check_claim(claim: str) -> CrisisTrend:
            check = await run_check_agent(CheckAgentRequest(query=claim))
            return CrisisTrend(
                id=''.join(random.choices(string.ascii_lowercase + string.digits, k=9)),
                topic=request.topic,
                claim=claim,
                severity='HIGH' if check.verdict == 'FAKE' else 'MEDIUM',
                verdict=check.verdict,
                volume=random.randint(500, 1500),  # Simulated chatter volume
                timestamp=datetime.now()
            )

        results = await asyncio.gather(*[check_claim(claim) for claim in claims])
        return list(results)

    except Exception as error:
        print(f"Scanner Error: {error}")
        return []

# --- SYNTHESIS ENDPOINT ---
@app.post("/api/synthesis")
async def run_main_agent_synthesis(request: SynthesisRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f'Synthesize response for "{request.userQuery}" based on: Verdict {request.checkResult.verdict}, Explanation: {request.checkResult.explanation}',
            config=types.GenerateContentConfig(temperature=0.6)
        )
        return {"text": response.text or "Verified."}
    except Exception as e:
        print(f"Synthesis Error: {e}")
        return {"text": "Error synthesizing."}

# --- LIVE API: VOICE AGENT (WebSocket) ---
@app.websocket("/ws/live-session")
async def create_live_session(websocket: WebSocket):
    """
    EXACT SAME LOGIC AS TYPESCRIPT: Live Voice Agent with verify_fact tool
    """
    await websocket.accept()
    
    try:
        # Create live session with EXACT same config as TypeScript
        async with client.aio.live.connect(
            model='gemini-2.5-flash-native-audio-preview-09-2025',
            config=types.LiveConnectConfig(
                response_modalities=[types.Modality.AUDIO],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Puck"
                        )
                    )
                ),
                system_instruction=types.Content(
                    parts=[types.Part(
                        text="You are the Voice Main Agent. You listen to the user. You have access to a tool called 'verify_fact'. If the user asks ANY question about facts, news, weather, or reality, you MUST use 'verify_fact' to check it. Do not answer from your own knowledge. Always cite the source provided by the tool. Be concise."
                    )]
                ),
                tools=LIVE_AGENT_TOOLS
            )
        ) as session:
            
            # Handle incoming messages from client
            async def receive_from_client():
                try:
                    while True:
                        data = await websocket.receive_json()
                        
                        if data.get("type") == "audio":
                            # Send audio to Gemini
                            await session.send(
                                types.LiveClientContent(
                                    turns=[types.LiveClientTurn(
                                        parts=[types.Part(
                                            inline_data=types.Blob(
                                                mime_type="audio/pcm",
                                                data=data.get("audio")
                                            )
                                        )]
                                    )]
                                )
                            )
                        elif data.get("type") == "tool_response":
                            # Handle tool response (verify_fact result)
                            await session.send(
                                types.LiveClientToolResponse(
                                    function_responses=[
                                        types.FunctionResponse(
                                            id=data.get("call_id"),
                                            name="verify_fact",
                                            response=data.get("response")
                                        )
                                    ]
                                )
                            )
                except WebSocketDisconnect:
                    pass
            
            # Handle messages from Gemini
            async def send_to_client():
                try:
                    async for response in session.receive():
                        if response.server_content:
                            # Audio response
                            for part in response.server_content.model_turn.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    await websocket.send_json({
                                        "type": "audio",
                                        "audio": part.inline_data.data
                                    })
                        
                        if response.tool_call:
                            # Tool call (verify_fact)
                            for call in response.tool_call.function_calls:
                                if call.name == "verify_fact":
                                    # Execute verify_fact
                                    query = call.args.get("query", "")
                                    check_result = await run_check_agent(CheckAgentRequest(query=query))
                                    
                                    # Send tool result back to client (client will forward to Gemini)
                                    await websocket.send_json({
                                        "type": "tool_call",
                                        "call_id": call.id,
                                        "name": "verify_fact",
                                        "result": {
                                            "verdict": check_result.verdict,
                                            "confidence": check_result.confidence,
                                            "explanation": check_result.explanation,
                                            "sources": [{"title": s.title, "uri": s.uri} for s in check_result.sources]
                                        }
                                    })
                except Exception as e:
                    print(f"Send error: {e}")
            
            # Run both tasks concurrently
            await asyncio.gather(
                receive_from_client(),
                send_to_client()
            )
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)