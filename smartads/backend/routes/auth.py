from flask import Blueprint, request, jsonify
from db import db
import bcrypt
from datetime import datetime

auth_route = Blueprint("auth_route", __name__)

@auth_route.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()

        full_name = data.get("fullName")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")
        role = data.get("role", "User")  # Default to "User" if not provided

        # Validate Required Fields
        if not full_name or not email or not password or not confirm_password:
            return jsonify({"success": False, "error": "All fields are required"}), 400

        # Validate email format
        if "@" not in email or "." not in email:
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        # Check password match
        if password != confirm_password:
            return jsonify({"success": False, "error": "Passwords do not match"}), 400

        # Check password strength
        if len(password) < 6:
            return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

        # Check if user already exists
        existing_user = db.users.find_one({"email": email.lower()})
        if existing_user:
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Create user document with username to satisfy unique index
        user = {
            "fullName": full_name,
            "email": email.lower(),
            "username": email.lower(),  # Use email as username to satisfy the unique index
            "password": hashed_pw.decode("utf-8"),
            "role": role,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        # Save to MongoDB
        result = db.users.insert_one(user)

        return jsonify({
            "success": True,
            "message": "Account created successfully!",
            "userId": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/add-subuser", methods=["POST"])
def add_subuser():
    try:
        data = request.get_json()

        head_user_id = data.get("headUserId")
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        allowed_features = data.get("allowedFeatures", [])
        
        # Debug logging
        print(f"DEBUG: Received head_user_id: {head_user_id}")
        print(f"DEBUG: Type of head_user_id: {type(head_user_id)}")

        # Validate Required Fields
        if not head_user_id or not name or not email or not password:
            return jsonify({"success": False, "error": "All fields are required"}), 400

        # Validate email format
        if "@" not in email or "." not in email:
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        # Check password strength
        if len(password) < 6:
            return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

        # Validate at least one feature is assigned
        if not allowed_features or len(allowed_features) == 0:
            return jsonify({"success": False, "error": "At least one feature must be assigned"}), 400

        # Verify head user exists - try multiple methods
        from bson.objectid import ObjectId
        head_user = None
        
        # Try ObjectId format first
        try:
            if ObjectId.is_valid(head_user_id):
                print(f"DEBUG: head_user_id is valid ObjectId format")
                head_user = db.users.find_one({"_id": ObjectId(head_user_id)})
                print(f"DEBUG: Found user by ObjectId: {head_user is not None}")
        except Exception as e:
            print(f"DEBUG: Error converting to ObjectId: {e}")
        
        # If not found, try as string ID
        if not head_user:
            print(f"DEBUG: Trying to find user with string ID")
            head_user = db.users.find_one({"_id": head_user_id})
            print(f"DEBUG: Found user by string: {head_user is not None}")
        
        # If still not found, let's check what users exist
        if not head_user:
            print(f"DEBUG: Checking all users in database...")
            all_users = list(db.users.find({}, {"_id": 1, "email": 1, "fullName": 1}))
            print(f"DEBUG: Total users in DB: {len(all_users)}")
            for u in all_users:
                print(f"DEBUG: User - _id: {u['_id']} (type: {type(u['_id'])}), email: {u.get('email')}")
            return jsonify({"success": False, "error": "Invalid head user"}), 404

        # Check if sub-user email already exists
        existing_subuser = db.subusers.find_one({"email": email.lower()})
        if existing_subuser:
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Also check in main users table
        existing_user = db.users.find_one({"email": email.lower()})
        if existing_user:
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Create sub-user document
        subuser = {
            "name": name,
            "email": email.lower(),
            "password": hashed_pw.decode("utf-8"),
            "headUserId": head_user_id,
            "headUserEmail": head_user["email"],
            "headUserName": head_user["fullName"],
            "allowedFeatures": allowed_features,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        # Save to MongoDB subusers collection
        result = db.subusers.insert_one(subuser)

        return jsonify({
            "success": True,
            "message": "Sub-user added successfully!",
            "subUserId": str(result.inserted_id),
            "subUser": {
                "id": str(result.inserted_id),
                "name": name,
                "email": email.lower(),
                "allowedFeatures": allowed_features,
                "createdAt": subuser["createdAt"].isoformat()
            }
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/get-subusers/<head_user_id>", methods=["GET"])
def get_subusers(head_user_id):
    try:
        # Find all sub-users for this head user
        subusers = list(db.subusers.find({"headUserId": head_user_id, "isActive": True}))
        
        # Format response
        subusers_list = []
        for subuser in subusers:
            subusers_list.append({
                "id": str(subuser["_id"]),
                "name": subuser["name"],
                "email": subuser["email"],
                "allowedFeatures": subuser["allowedFeatures"],
                "createdAt": subuser["createdAt"].isoformat()
            })

        return jsonify({
            "success": True,
            "subUsers": subusers_list,
            "count": len(subusers_list)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/update-subuser/<subuser_id>", methods=["PUT"])
def update_subuser(subuser_id):
    try:
        data = request.get_json()
        
        from bson.objectid import ObjectId
        
        # Find existing sub-user
        try:
            subuser = db.subusers.find_one({"_id": ObjectId(subuser_id)})
        except:
            subuser = db.subusers.find_one({"_id": subuser_id})
            
        if not subuser:
            return jsonify({"success": False, "error": "Sub-user not found"}), 404

        # Prepare update data
        update_data = {"updatedAt": datetime.utcnow()}
        
        if data.get("name"):
            update_data["name"] = data["name"]
        
        if data.get("email"):
            if "@" not in data["email"] or "." not in data["email"]:
                return jsonify({"success": False, "error": "Invalid email format"}), 400
            update_data["email"] = data["email"].lower()
        
        if data.get("password"):
            if len(data["password"]) < 6:
                return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400
            hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
            update_data["password"] = hashed_pw.decode("utf-8")
        
        if "allowedFeatures" in data:
            if not data["allowedFeatures"] or len(data["allowedFeatures"]) == 0:
                return jsonify({"success": False, "error": "At least one feature must be assigned"}), 400
            update_data["allowedFeatures"] = data["allowedFeatures"]

        # Update in MongoDB
        try:
            db.subusers.update_one(
                {"_id": ObjectId(subuser_id)},
                {"$set": update_data}
            )
        except:
            db.subusers.update_one(
                {"_id": subuser_id},
                {"$set": update_data}
            )

        return jsonify({
            "success": True,
            "message": "Sub-user updated successfully!"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/delete-subuser/<subuser_id>", methods=["DELETE"])
def delete_subuser(subuser_id):
    try:
        from bson.objectid import ObjectId
        
        # Soft delete - mark as inactive
        try:
            result = db.subusers.update_one(
                {"_id": ObjectId(subuser_id)},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
        except:
            result = db.subusers.update_one(
                {"_id": subuser_id},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )

        if result.modified_count == 0:
            return jsonify({"success": False, "error": "Sub-user not found"}), 404

        return jsonify({
            "success": True,
            "message": "Sub-user deleted successfully!"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        # Validate Required Fields
        if not email or not password:
            return jsonify({"success": False, "error": "Email and password are required"}), 400

        # Find user in database
        user = db.users.find_one({"email": email.lower()})

        if not user:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        # Verify password
        password_match = bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8"))

        if not password_match:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        # Update last login time
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"lastLogin": datetime.utcnow()}}
        )

        # Return success with user info (excluding password)
        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": {
                "id": str(user["_id"]),
                "fullName": user["fullName"],
                "email": user["email"],
                "role": user.get("role", "User")
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_route.route("/google-signup", methods=["POST"])
def google_signup():
    try:
        data = request.get_json()
        
        email = data.get("email")
        name = data.get("name")
        google_id = data.get("googleId")
        
        if not email or not name:
            return jsonify({"success": False, "error": "Email and name are required"}), 400
        
        # Check if user already exists
        existing_user = db.users.find_one({"email": email.lower()})
        
        if existing_user:
            # User exists, return as login
            return jsonify({
                "success": True,
                "message": "Login successful!",
                "user": {
                    "id": str(existing_user["_id"]),
                    "fullName": existing_user["fullName"],
                    "email": existing_user["email"],
                    "role": existing_user.get("role", "User")
                }
            }), 200
        
        # Create new user without password (Google OAuth)
        user = {
            "fullName": name,
            "email": email.lower(),
            "username": email.lower(),
            "password": None,  # No password for Google OAuth users
            "googleId": google_id,
            "authProvider": "google",
            "role": "User",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = db.users.insert_one(user)
        
        return jsonify({
            "success": True,
            "message": "Account created successfully!",
            "user": {
                "id": str(result.inserted_id),
                "fullName": name,
                "email": email.lower(),
                "role": "User"
            }
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
