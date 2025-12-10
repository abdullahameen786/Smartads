from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import re

# DB and third-party SDKs
from db import db

import cloudinary
import cloudinary.uploader

import google.generativeai as genai


logo_poster_route = Blueprint("logo_poster_route", __name__)


def _require_env(var_name: str):
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Missing environment variable: {var_name}")
    return value


def configure_third_party_clients():
    # Gemini
    api_key = _require_env("GEMINI_API_KEY")
    genai.configure(api_key=api_key)

    # Cloudinary
    cloudinary.config(
        cloud_name=_require_env("CLOUD_NAME"),
        api_key=_require_env("CLOUD_API_KEY"),
        api_secret=_require_env("CLOUD_API_SECRET"),
        secure=True,
    )


def build_svg_prompt(payload: dict) -> str:
    kind = payload.get("type", "logo")  # 'logo' or 'poster'
    brand = payload.get("brandName", "SmartAds")
    tagline = payload.get("tagline", "")
    colors = payload.get("colors")  # list or comma-separated
    style = payload.get("style", "modern, minimal")
    description = payload.get("description", "")
    size = payload.get("size", "1024x1024")

    if isinstance(colors, list):
        color_text = ", ".join(colors)
    else:
        color_text = colors or "#0ea5e9, #111827, #ffffff"

    w, h = (size.split("x") + ["1024", "1024"])[:2]

    system_rules = (
        "You are an expert brand designer."
        " Generate a single valid standalone SVG."
        " The response MUST contain only the <svg> markup with no explanations, no backticks, and no prose."
    )

    instructions = f"""
Create a {kind} as SVG for brand "{brand}".
Tagline: "{tagline}".
Style: {style}. Palette: {color_text}.
Extra details: {description}

SVG requirements:
- Width {w}px, height {h}px, viewBox="0 0 {w} {h}".
- Use vector shapes (paths, rects, circles), simple gradients allowed.
- Embed any text as <text> with safe web fonts (e.g., sans-serif). No external URLs.
- Ensure high contrast and readability.
- No scripts, no external images, no base64 images, no filters requiring external resources.
- Output ONLY the SVG markup.
"""

    return system_rules + "\n\n" + instructions


def extract_svg(text: str) -> str:
    if not text:
        return ""
    # Remove markdown fences if any
    text = re.sub(r"^```(?:svg)?|```$", "", text.strip(), flags=re.MULTILINE)
    # Find the first <svg ...> ... </svg>
    m = re.search(r"<svg[\s\S]*?</svg>", text, flags=re.IGNORECASE)
    return m.group(0).strip() if m else ""


@logo_poster_route.route("/generate-design", methods=["POST"])
def generate_design():
    try:
        data = request.get_json(silent=True) or {}
        if not data.get("type"):
            return jsonify({"error": "field 'type' is required ('logo' or 'poster')"}), 400

        configure_third_party_clients()

        prompt = build_svg_prompt(data)
        model = genai.GenerativeModel("gemini-2.5-flash")
        resp = model.generate_content(prompt)

        # Extract SVG with better error handling
        svg_text = ""
        try:
            if hasattr(resp, "text") and resp.text:
                svg_text = resp.text
            elif hasattr(resp, "candidates") and resp.candidates:
                svg_text = resp.candidates[0].content.parts[0].text
        except Exception as e:
            return jsonify({"error": "Failed to extract AI response", "details": str(e)}), 502

        svg = extract_svg(svg_text)
        if not svg or not svg.lower().startswith("<svg"):
            return jsonify({"error": "AI did not return valid SVG. Please refine inputs and try again."}), 502

        # Ensure uploads dir
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        # Save SVG temporarily
        base_name = f"{data.get('type','logo')}_{data.get('brandName','smartads')}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        file_name = secure_filename(base_name) + ".svg"
        file_path = os.path.join(uploads_dir, file_name)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(svg)

        # Upload to Cloudinary
        upload_res = cloudinary.uploader.upload(
            file_path,
            folder="smartads/generated",
            resource_type="image",
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )

        cloud_url = upload_res.get("secure_url")
        public_id = upload_res.get("public_id")

        # Save record in MongoDB - LogoPoster table
        doc = {
            "type": data.get("type"),
            "brandName": data.get("brandName"),
            "tagline": data.get("tagline"),
            "colors": data.get("colors"),
            "style": data.get("style"),
            "description": data.get("description"),
            "size": data.get("size"),
            "prompt": prompt,
            "cloudinaryUrl": cloud_url,
            "publicId": public_id,
            "fileName": file_name,
            "createdAt": datetime.utcnow(),
        }

        result = db["LogoPoster"].insert_one(doc)

        # Also save to Products table
        product_doc = {
            "name": data.get("brandName"),
            "description": data.get("tagline") or data.get("description"),
            "price": data.get("price"),
            "adTypes": [data.get("type")],  # Single type for this generation
            "captionType": data.get("captionType"),
            "referenceImages": data.get("referenceImages", []),
            "generatedDesigns": [{
                "type": data.get("type"),
                "cloudinaryUrl": cloud_url,
                "publicId": public_id,
                "fileName": file_name,
                "createdAt": datetime.utcnow(),
            }],
            "createdAt": datetime.utcnow(),
        }
        
        # Insert into Products collection
        db["products"].insert_one(product_doc)

        return jsonify({
            "id": str(result.inserted_id),
            "url": cloud_url,
            "publicId": public_id,
            "fileName": file_name,
        }), 201

    except RuntimeError as cfg_err:
        return jsonify({"error": str(cfg_err)}), 500
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": "Generation failed", "details": str(e)}), 500


@logo_poster_route.route("/designs", methods=["GET"])
def list_designs():
    try:
        items = []
        for doc in db["LogoPoster"].find().sort("createdAt", -1).limit(50):
            doc["_id"] = str(doc["_id"])  # jsonify-able
            items.append(doc)
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
