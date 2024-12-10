import json
from datatalo import skeleton
from flask import Flask, request, jsonify
import mysql.connector
import logging
import re
from flask_cors import CORS


logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
db = skeleton()
conn = db.get_conn()
cors = CORS(app)


@app.route('/rekister', methods=['POST'])
def register_user():
    conn = None  # Alusta conn oletuksena None
    cursor = None
    try:
        data = request.get_json()

        user_name = data.get('kayttajatunnus')
        if not user_name:
            return jsonify({"error": "Nimi on pakollinen!"}), 400

        if not re.match("^[a-zA-Z0-9äöåÄÖÅ ]+$", user_name):
            return jsonify({"error": "Nimi sisältää kiellettyjä merkkejä!"}), 400

        raha = 0
        kokemus = 0
        tehdyt_keikat = 0
        bensa = 0

        # Yhdistä tietokantaan
        db = skeleton()
        conn = db.get_conn()
        cursor = conn.cursor()

        query = """
        INSERT INTO pelaaja (nimi, raha, kokemus, tehdyt_keikat, bensa)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (user_name, raha, kokemus, tehdyt_keikat, bensa)
        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": f"Pelaaja {user_name} rekisteröity onnistuneesti!"}), 201

    except mysql.connector.IntegrityError:
        return jsonify({"error": "Käyttäjän nimi on jo käytössä!"}), 400
    except Exception as e:
        logging.error(f"Virhe: {str(e)}")
        return jsonify({"error": "Palvelimella tapahtui virhe."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

@app.route('/airports_by_country', methods=['GET'])
def airports_by_country():
    sql = '''SELECT longitude_deg, latitude_deg FROM airport ORDER BY RAND() LIMIT 1'''
    cursor = db.get_conn().cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchone()
    if result:
        return jsonify({'latitude_deg': result['latitude_deg'], 'longitude_deg': result['longitude_deg']})
    else:
        return jsonify({"error": "No airports found!"}), 404

@app.route('/tallenna', methods=['POST'])
def tallenna_score():
    try:
        data = request.get_json()

        score = data.get('score')

        if score is None:
            return jsonify({"error": "Score on pakollinen!"}), 400

        # Yhdistä tietokantaan
        db = skeleton()
        conn = db.get_conn()
        cursor = conn.cursor()

        # Lisää uusi score-arvo tietokantaan
        insert_query = """
        INSERT INTO pelaaja (score)
        VALUES (%s)
        """
        cursor.execute(insert_query, (score,))

        conn.commit()
        conn.close()
        return jsonify({"message": f"Score '{score}' tallennettu onnistuneesti!"}), 200

    except Exception as e:
        return jsonify({"error": f"Virhe tallennuksessa: {str(e)}"}), 500

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    sql = "SELECT nimi, score FROM pelaaja ORDER BY score DESC LIMIT 10"

    db = skeleton()
    conn = db.get_conn()
    cursor = conn.cursor(dictionary=True)  # Käytä dictionary-moodia

    try:
        cursor.execute(sql)
        results = cursor.fetchall()

        if results:
            return jsonify(results)  # Palautetaan JSON-lista
        else:
            return jsonify({"error": "No data found!"}), 404

    except mysql.connector.Error as e:
        return jsonify({'error': f'MySQL error: {e}'}), 500

    finally:
        cursor.close()
        if conn.is_connected():
            conn.close()

@app.route('/listanPituus', methods=['GET'])
def get_player_count():

    # Yhdistä tietokantaan
    db = skeleton()
    conn = db.get_conn()
    cursor = conn.cursor()

    try:
        # Suorita SQL SELECT COUNT(*) -kysely
        cursor.execute("SELECT COUNT(*) FROM pelaaja")
        result = cursor.fetchone()

        player_count = result[0]  # Saadaan ensimmäinen tulos, joka on pelaajien määrä

        conn.close()
        return jsonify({"pelaajien_lukumaara": player_count}), 200

    except Exception as e:
        return jsonify({"error": f"Virhe kyselyssä: {str(e)}"}), 500


if __name__ == '__main__':
    print(f"Running Flask app on 127.0.0.1:3000")
    app.run(use_reloader=True, host='127.0.0.1', port=3000)