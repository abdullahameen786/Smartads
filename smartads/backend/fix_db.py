from db import db
from bson.objectid import ObjectId
import json

# Check the latest user
print("=== Latest User (Marwa) ===")
user = db.users.find_one({'_id': ObjectId('693919adc2058864abbca821')})
if user:
    print(json.dumps({
        'fullName': user.get('fullName'),
        'email': user.get('email'),
        'username': user.get('username'),
        'organizationName': user.get('organizationName'),
        'organizationEmail': user.get('organizationEmail'),
        'role': user.get('role')
    }, indent=2))
else:
    print("User not found")

# Check all users with organization info
print("\n=== All Users ===")
users = list(db.users.find({}))
for u in users:
    print(f"Email: {u.get('email')}, Org: {u.get('organizationName')}, OrgEmail: {u.get('organizationEmail')}")
