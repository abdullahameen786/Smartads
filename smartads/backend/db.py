from pymongo import MongoClient

MONGO_URI = "mongodb+srv://abdullahamin2k22_db_user:s5Sf2hcSknl6Vhgg@cluster0.wdjexxf.mongodb.net/SmartAds?retryWrites=true&w=majority&tls=true&appName=Cluster0"

try:
    client = MongoClient(MONGO_URI)
    db = client["SmartAds"]   # <-- THIS IS THE db VARIABLE YOU IMPORT
    print("MongoDB Connected Successfully")
except Exception as e:
    print("MongoDB Connection Error:", e)
