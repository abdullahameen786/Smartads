from flask import Flask, jsonify
from routes.products import product_route
from routes.auth import auth_route      # <-- NEW
from routes.logo_poster import logo_poster_route
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from Vercel frontend
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://smartads-fyp.vercel.app",
    "https://smartads-rm6tpisvy-abdullahs-projects-a8d1852f.vercel.app",
    "https://*.vercel.app"
], supports_credentials=True)

# Root route
@app.route("/")
def index():
    return jsonify({
        "message": "SmartAds API",
        "version": "1.0",
        "endpoints": {
            "auth": "/api/signup",
            "products": "/api/*",
            "generate": "/api/generate-design",
            "designs": "/api/designs"
        }
    })

# Register routes
app.register_blueprint(product_route, url_prefix="/api")
app.register_blueprint(auth_route, url_prefix="/api")   # <-- NEW
app.register_blueprint(logo_poster_route, url_prefix="/api")

if __name__ == "__main__":
    import os
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)
