
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# ==========================
# MySQL Connection
# ==========================

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="YOUR_MYSQL_PASSWORD",
    database="vendorbridge"
)

cursor = db.cursor(dictionary=True)

# ==========================
# Home Route
# ==========================

@app.route("/")
def home():
    return jsonify({
        "message": "VendorBridge Backend Running"
    })

# ==========================
# Signup API
# ==========================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    first_name = data["first_name"]
    last_name = data["last_name"]
    email = data["email"]
    phone = data["phone"]
    password = data["password"]
    role = data["role"]

    # Check if email already exists
    cursor.execute(
        "SELECT * FROM sign_up WHERE email=%s",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:

        return jsonify({
            "success": False,
            "message": "Email already registered."
        })

    sql = """
    INSERT INTO sign_up
    (first_name,last_name,email,phone,password,role)
    VALUES(%s,%s,%s,%s,%s,%s)
    """

    values = (
        first_name,
        last_name,
        email,
        phone,
        password,
        role
    )

    cursor.execute(sql, values)

    db.commit()

    return jsonify({
        "success": True,
        "message": "Account Created Successfully"
    })

# ==========================
# Login API
# ==========================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data["email"]
    password = data["password"]

    sql = """
    SELECT *
    FROM sign_up
    WHERE email=%s
    AND password=%s
    """

    cursor.execute(sql, (email, password))

    user = cursor.fetchone()

    if user:

        return jsonify({
            "success": True,
            "user": user
        })

    return jsonify({
        "success": False,
        "message": "Invalid Email or Password"
    })

# ==========================
# Get All Users
# ==========================

@app.route("/users", methods=["GET"])
def users():

    cursor.execute("SELECT * FROM sign_up")

    users = cursor.fetchall()

    return jsonify(users)

# ==========================
# Delete User
# ==========================

@app.route("/delete/<int:id>", methods=["DELETE"])
def delete(id):

    cursor.execute(
        "DELETE FROM sign_up WHERE id=%s",
        (id,)
    )

    db.commit()

    return jsonify({
        "success": True,
        "message": "User Deleted"
    })

# ==========================
# Update User
# ==========================

@app.route("/update/<int:id>", methods=["PUT"])
def update(id):

    data = request.get_json()

    sql = """
    UPDATE sign_up
    SET
    first_name=%s,
    last_name=%s,
    email=%s,
    phone=%s,
    role=%s
    WHERE id=%s
    """

    values = (
        data["first_name"],
        data["last_name"],
        data["email"],
        data["phone"],
        data["role"],
        id
    )

    cursor.execute(sql, values)

    db.commit()

    return jsonify({
        "success": True,
        "message": "User Updated"
    })

# ==========================
# Start Server
# ==========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
