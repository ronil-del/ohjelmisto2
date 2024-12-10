import mysql.connector

class skeleton:
    def __init__(self):
        try:
            self.conn = mysql.connector.connect(
                host='127.0.0.1',
                port=3306,
                database='demogame',
                user='root',
                password='salasana',
                autocommit=True
            )
        except mysql.connector.Error as e:
            # Loggaa tai tulosta virheviesti
            print(f"Virhe tietokantayhteyden muodostamisessa: {e}")
            self.conn = None  # Jos yhteys epäonnistuu, aseta None

    def get_conn(self):
        if self.conn and self.conn.is_connected():
            return self.conn
        else:
            raise Exception("Tietokantayhteyttä ei ole tai se on suljettu.")

