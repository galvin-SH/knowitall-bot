"""
TTS + RVC Server
A lightweight FastAPI server that provides text-to-speech with RVC voice conversion.

Usage:
    python -m uvicorn server:app --host 127.0.0.1 --port 5050

    Or directly:
    python server.py
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tts_with_rvc import TTS_RVC

# Configuration
MODELS_DIR = Path(__file__).parent / "models"
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "tts_rvc_output.wav"

# Ensure output directory exists
OUTPUT_DIR.mkdir(exist_ok=True)

# Voice configurations
VOICE_CONFIG = {
    "march": {
        "pth_path": MODELS_DIR / "march72.0.pth",
        "index_path": MODELS_DIR / "march72.0.index",
        "edge_voice": "en-US-AvaMultilingualNeural",
        "tts_rate": -5,
        "pitch": 9,
        "filter_radius": 3,
        "index_rate": 0.5,
        "protect": 0.459,
        "clean_audio": True,
        "clean_strength": 0.25,
    },
    "ranni": {
        "pth_path": MODELS_DIR / "ranni.pth",
        "index_path": MODELS_DIR / "ranni.index",
        "edge_voice": "en-GB-SoniaNeural",
        "tts_rate": -10,
        "pitch": 0,
        "filter_radius": 3,
        "index_rate": 0.75,
        "protect": 0.426,
        "clean_audio": True,
        "clean_strength": 0.5,
    },
    "trump": {
        "pth_path": MODELS_DIR / "trump.pth",
        "index_path": MODELS_DIR / "trump.index",
        "edge_voice": "en-US-AndrewMultilingualNeural",
        "tts_rate": 0,
        "pitch": 0,
        "filter_radius": 3,
        "index_rate": 0.75,
        "protect": 0.426,
        "clean_audio": True,
        "clean_strength": 0.5,
    },
}

# Pre-loaded models (lazy loading)
models: dict[str, TTS_RVC] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    print("TTS+RVC Server starting...")
    print(f"Models directory: {MODELS_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")

    if not MODELS_DIR.exists():
        print("WARNING: Models directory does not exist!")
    else:
        model_files = list(MODELS_DIR.glob("*.pth"))
        print(f"Found {len(model_files)} model files: {[f.name for f in model_files]}")

    print("Server ready!")
    yield
    # Shutdown (cleanup if needed)
    print("TTS+RVC Server shutting down...")


# FastAPI app
app = FastAPI(title="TTS+RVC Server", version="1.0.0", lifespan=lifespan)


def get_model(voice: str) -> TTS_RVC:
    """Get or create a TTS_RVC model for the specified voice."""
    if voice not in VOICE_CONFIG:
        raise ValueError(
            f"Unknown voice: {voice}. Available: {list(VOICE_CONFIG.keys())}"
        )

    if voice not in models:
        config = VOICE_CONFIG[voice]

        # Check if model files exist
        if not config["pth_path"].exists():
            raise FileNotFoundError(f"Model file not found: {config['pth_path']}")
        if not config["index_path"].exists():
            raise FileNotFoundError(f"Index file not found: {config['index_path']}")

        print(f"Loading model: {voice}...")
        models[voice] = TTS_RVC(
            model_path=str(config["pth_path"]),
            index_path=str(config["index_path"]),
            device="cuda:0",  # Use GPU
        )
        print(f"Model loaded: {voice}")

    return models[voice]


class TTSRequest(BaseModel):
    """Request body for TTS generation."""

    text: str
    voice: str = "march"


class TTSResponse(BaseModel):
    """Response body for TTS generation."""

    audio_path: str
    voice: str


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "TTS+RVC Server",
        "available_voices": list(VOICE_CONFIG.keys()),
    }


@app.get("/voices")
async def list_voices():
    """List available voices and their configurations."""
    return {
        voice: {
            "edge_voice": config["edge_voice"],
            "model_loaded": voice in models,
        }
        for voice, config in VOICE_CONFIG.items()
    }


@app.post("/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """Generate TTS audio with RVC voice conversion."""
    try:
        # Validate voice
        if request.voice not in VOICE_CONFIG:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown voice: {request.voice}. Available: {list(VOICE_CONFIG.keys())}",
            )

        # Clean text (remove markdown formatting)
        clean_text = request.text.replace("*", "").replace("\n", " ").strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        # Get model and config
        model = get_model(request.voice)
        config = VOICE_CONFIG[request.voice]

        # Set the Edge TTS voice
        model.set_voice(config["edge_voice"])

        # Generate TTS with RVC
        generated_path = model(
            text=clean_text,
            pitch=config["pitch"],
            tts_rate=config["tts_rate"],
            index_rate=config["index_rate"],
            filter_radius=config["filter_radius"],
            protect=config["protect"],
            output_filename=str(OUTPUT_FILE),
        )

        return TTSResponse(
            audio_path=generated_path,
            voice=request.voice,
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=5050)
