import sqlite3

def init_db():
    conn = sqlite3.connect('clinic.db')
    cur = conn.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS doctors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, spec TEXT, contact TEXT)')
    cur.execute('CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, contact TEXT, date TEXT, doc_id INTEGER)')
    cur.execute('CREATE TABLE IF NOT EXISTS billing (id INTEGER PRIMARY KEY AUTOINCREMENT, p_name TEXT, d_id INTEGER, contact TEXT, amount REAL)')
    conn.commit()
    conn.close()

def handle_request(path, method, data=None):
    conn = sqlite3.connect('clinic.db')
    cur = conn.cursor()
    res = []

    if "/api/doctors" in path:
        if method == 'GET':
            cur.execute("SELECT * FROM doctors")
            res = cur.fetchall()
        elif method == 'POST':
            if data.get('action') == 'delete':
                cur.execute("DELETE FROM doctors WHERE id=?", (data['id'],))
            else:
                cur.execute("INSERT INTO doctors (name, spec, contact) VALUES (?,?,?)", (data['name'], data['spec'], data['contact']))
    
    elif "/api/patients" in path:
        if method == 'GET':
            cur.execute("SELECT * FROM patients")
            res = cur.fetchall()
        elif method == 'POST':
            if data.get('action') == 'delete':
                cur.execute("DELETE FROM patients WHERE id=?", (data['id'],))
            else:
                cur.execute("INSERT INTO patients (name, contact, date, doc_id) VALUES (?,?,?,?)", (data['name'], data['contact'], data['date'], data['doc_id']))

    elif "/api/billing" in path:
        if method == 'GET':
            cur.execute("SELECT * FROM billing")
            res = cur.fetchall()
        elif method == 'POST':
            if data.get('action') == 'delete':
                cur.execute("DELETE FROM billing WHERE id=?", (data['id'],))
            else:
                cur.execute("INSERT INTO billing (p_name, d_id, contact, amount) VALUES (?,?,?,?)", (data['p_name'], data['d_id'], data['contact'], data['amount']))

    conn.commit()
    conn.close()
    return res