from flask import Blueprint, request, jsonify
from db import db
import cloudinary
import cloudinary.uploader
import json
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

product_route = Blueprint("product_route", __name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

@product_route.route("/add-product", methods=["POST"])
def add_product():
    data = request.form
    files = request.files.getlist("images")

    # Upload Images to Cloudinary
    cloud_urls = []
    for file in files:
        try:
            upload_result = cloudinary.uploader.upload(file)
            cloud_urls.append(upload_result["secure_url"])
        except Exception as e:
            print("Cloudinary upload error:", e)

    # Parse adTypes correctly
    ad_types_raw = data.get("adTypes")
    try:
        ad_types = json.loads(ad_types_raw)
    except:
        ad_types = []

    # Save product to MongoDB
    product = {
        "name": data.get("name"),
        "description": data.get("description"),
        "price": data.get("price"),
        "adTypes": ad_types,
        "captionType": data.get("captionType"),  # with_caption or without_caption
        "referenceImages": cloud_urls            # ⭐ Cloudinary URLs saved here
    }

    # Required field validation
    if not product["name"] or not product["description"] or not product["price"]:
        return jsonify({"error": "Please fill all required fields"}), 400

    db.products.insert_one(product)

    return jsonify({"message": "Product saved successfully"})

@product_route.route("/upload-images", methods=["POST"])
def upload_images():
    """Upload reference images to Cloudinary and return URLs"""
    files = request.files.getlist("images")
    
    if not files:
        return jsonify({"error": "No images provided"}), 400
    
    cloud_urls = []
    for file in files:
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder="smartads/references",
                resource_type="image"
            )
            cloud_urls.append(upload_result["secure_url"])
        except Exception as e:
            print("Cloudinary upload error:", e)
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500
    
    return jsonify({"urls": cloud_urls, "count": len(cloud_urls)}), 200

