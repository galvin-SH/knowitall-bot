"""
TTS + RVC Server
A lightweight FastAPI server that provides text-to-speech with RVC voice conversion.

Usage:
    python -m uvicorn server:app --host 127.0.0.1 --port 5050

    Or directly:
    python server.py

Environment Variables:
    VOICE_CONFIG_PATH - Path to voice_config.json (default: ./voice_config.json)
    MODELS_DIR - Path to models directory (default: ./models)
    OUTPUT_DIR - Path to output directory (default: ./output)
    RVC_DEVICE - PyTorch device for RVC inference (default: cuda:0)
    TTS_HOST - Server host address (default: 127.0.0.1)
    TTS_PORT - Server port (default: 5050)
"""

import json
import logging
import os
import warnings
from contextlib import asynccontextmanager
from pathlib import Path

# Suppress third-party warnings and configure their loggers before importing them
warnings.filterwarnings("ignore", message="pkg_resources is deprecated")
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=FutureWarning)  # torch.nn.utils.weight_norm

# Silence noisy third-party loggers
for noisy_logger in ["fairseq", "tts_with_rvc", "numba", "httpx"]:
    logging.getLogger(noisy_logger).setLevel(logging.WARNING)

from fastapi import FastAPI, HTTPException  # noqa: E402
from pydantic import BaseModel  # noqa: E402
from tts_with_rvc import TTS_RVC  # noqa: E402

# Use uvicorn's logger for consistent formatting
logger = logging.getLogger("uvicorn.error")

# Configuration (can be overridden via environment variables)
SERVER_DIR = Path(__file__).parent
MODELS_DIR = Path(os.environ.get("MODELS_DIR", SERVER_DIR / "models"))
OUTPUT_DIR = Path(os.environ.get("OUTPUT_DIR", SERVER_DIR / "output"))
OUTPUT_FILE = OUTPUT_DIR / "tts_rvc_output.wav"
VOICE_CONFIG_PATH = Path(
    os.environ.get("VOICE_CONFIG_PATH", SERVER_DIR / "voice_config.json")
)
RVC_DEVICE = os.environ.get("RVC_DEVICE", "cuda:0")
TTS_HOST = os.environ.get("TTS_HOST", "127.0.0.1")
TTS_PORT = int(os.environ.get("TTS_PORT", "5050"))

# Ensure output directory exists
OUTPUT_DIR.mkdir(exist_ok=True)


def load_voice_config() -> dict:
    """Load voice configuration from JSON file and resolve paths."""
    config_path = VOICE_CONFIG_PATH
    example_path = SERVER_DIR / "voice_config.example.json"

    # Fall back to example config if main config doesn't exist
    if not config_path.exists():
        if example_path.exists():
            logger.warning(
                "Voice config not found at %s, using example config. "
                "Mount your config for production use.",
                config_path,
            )
            config_path = example_path
        else:
            raise FileNotFoundError(
                f"Voice config file not found: {VOICE_CONFIG_PATH}\n"
                f"Copy the example config and customize it:\n"
                f"  cp {example_path} {VOICE_CONFIG_PATH}"
            )

    with open(config_path, "r", encoding="utf-8") as f:
        raw_config = json.load(f)

    # Convert relative file names to full paths
    voice_config = {}
    for voice_name, config in raw_config.get("voices", {}).items():
        voice_config[voice_name] = {
            # Required files
            "pth_path": MODELS_DIR / config["pth_file"],
            "index_path": MODELS_DIR / config["index_file"],
            # Edge TTS settings
            "edge_voice": config["edge_voice"],
            "tts_rate": config.get("tts_rate", 0),
            # RVC pitch and voice matching
            "pitch": config.get("pitch", 0),
            "index_rate": config.get("index_rate", 0.75),
            # Audio quality parameters
            "filter_radius": config.get("filter_radius", 3),
            "protect": config.get("protect", 0.33),
            "rms_mix_rate": config.get("rms_mix_rate", 0.5),
            "resample_sr": config.get("resample_sr", 0),
            # Pitch extraction method: rmvpe, crepe, fcpe, pm, harvest, dio
            "f0_method": config.get("f0_method", "rmvpe"),
            # Precision: False = full precision (higher quality), True = half (faster)
            "is_half": config.get("is_half", True),
            # Post-processing (not passed to RVC, but kept for potential future use)
            "clean_audio": config.get("clean_audio", True),
            "clean_strength": config.get("clean_strength", 0.5),
        }

    return voice_config


# Load voice configurations from external file
VOICE_CONFIG = load_voice_config()

# Pre-loaded models (lazy loading)
models: dict[str, TTS_RVC] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("TTS+RVC Server starting...")
    logger.info("Voice config: %s", VOICE_CONFIG_PATH)
    logger.info("Models directory: %s", MODELS_DIR)
    logger.info("Output directory: %s", OUTPUT_DIR)

    if not MODELS_DIR.exists():
        logger.warning("Models directory does not exist!")
    else:
        model_files = list(MODELS_DIR.glob("*.pth"))
        logger.info("Found %d model files: %s", len(model_files), [f.name for f in model_files])

    logger.info("Server ready!")
    yield
    # Shutdown (cleanup if needed)
    logger.info("TTS+RVC Server shutting down...")


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

        logger.info("Loading model: %s on %s (f0_method=%s)...",
                    voice, RVC_DEVICE, config["f0_method"])
        models[voice] = TTS_RVC(
            model_path=str(config["pth_path"]),
            index_path=str(config["index_path"]),
            device=RVC_DEVICE,
            f0_method=config["f0_method"],
        )
        logger.info("Model loaded: %s", voice)

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
    """Root endpoint with service info."""
    return {
        "status": "ok",
        "service": "TTS+RVC Server",
        "available_voices": list(VOICE_CONFIG.keys()),
    }


@app.get("/health")
async def health():
    """Health check endpoint for Docker/Kubernetes."""
    return {"status": "healthy"}


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
            # Edge TTS settings
            tts_rate=config["tts_rate"],
            # RVC voice conversion settings
            pitch=config["pitch"],
            index_rate=config["index_rate"],
            filter_radius=config["filter_radius"],
            protect=config["protect"],
            rms_mix_rate=config["rms_mix_rate"],
            resample_sr=config["resample_sr"],
            is_half=config["is_half"],
            # Output
            output_filename=str(OUTPUT_FILE),
        )

        return TTSResponse(
            audio_path=generated_path,
            voice=request.voice,
        )

    except FileNotFoundError as e:
        logger.error("File not found: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error("TTS generation failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=TTS_HOST, port=TTS_PORT)
