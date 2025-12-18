import http.server
import socketserver
import urllib.parse
import sqlite3
import json

PORT = 8000
DB_NAME = "canchas.db"

def iniciar_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Tabla Usuarios: Agregamos columna 'rol'
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            email TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            password TEXT NOT NULL,
            rol TEXT DEFAULT 'cliente' 
        )
    ''')
    
    # Tabla Reservas: Agregamos columna 'estado'
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            email TEXT,
            cancha_id TEXT,
            fecha TEXT,
            hora TEXT,
            estado TEXT DEFAULT 'pendiente'
        )
    ''')
    
    # --- CREAR ADMIN POR DEFECTO SI NO EXISTE ---
    cursor.execute("SELECT * FROM usuarios WHERE email='admin@canchamaster.com'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO usuarios VALUES (?, ?, ?, ?)", 
                       ('admin@canchamaster.com', 'Super Admin', 'admin123', 'admin'))
        print("👑 Usuario Admin creado: admin@canchamaster.com / admin123")
        
    conn.commit()
    conn.close()

class MiManejador(http.server.SimpleHTTPRequestHandler):
    
    # --- MANEJO DE PETICIONES GET (Ver páginas o PEDIR DATOS JSON) ---
    def do_GET(self):
        # 1. API: Obtener lista de Reservas (Solo para admin/empleado)
        if self.path == '/api/reservas':
            self.enviar_json("SELECT * FROM reservas ORDER BY id DESC")
            
        # 2. API: Obtener lista de Empleados (Solo para admin)
        elif self.path == '/api/empleados':
            self.enviar_json("SELECT email, nombre, rol FROM usuarios WHERE rol='empleado'")
            
        # 3. Archivos Normales (HTML, CSS, JS)
        else:
            super().do_GET()

    # --- MANEJO DE PETICIONES POST (Enviar formularios o acciones) ---
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        data = self.rfile.read(length).decode('utf-8')
        
        # Si los datos vienen como JSON (fetch de JS) o Formulario
        if self.headers.get('Content-Type') == 'application/json':
            params = json.loads(data)
        else:
            # Formulario normal parseado
            parsed = urllib.parse.parse_qs(data)
            params = {k: v[0] for k, v in parsed.items()}

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        try:
            # A. LOGIN (Redirecciona según ROL)
            if self.path == '/api/login':
                email = params.get('email')
                password = params.get('password')
                cursor.execute("SELECT rol FROM usuarios WHERE email=? AND password=?", (email, password))
                resultado = cursor.fetchone() # <--- Aquí guardamos en 'resultado'
                
                # CORRECCIÓN: Antes decía "if result:", cámbialo a "if resultado:"
                if resultado: 
                    rol = resultado[0]
                    if rol == 'admin': self.redireccionar('/admin.html')
                    elif rol == 'empleado': self.redireccionar('/empleado.html')
                    else: self.redireccionar('/index.html') # Cliente
                else:
                    self.redireccionar('/login.html?error=credenciales')

            # B. REGISTRO (Cliente normal)
            elif self.path == '/api/registro':
                try:
                    cursor.execute("INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, 'cliente')", 
                                   (params['email'], params['nombre'], params['password']))
                    conn.commit()
                    self.redireccionar('/login.html?registrado=exito')
                except:
                    self.redireccionar('/registro.html?error=existe')

            # C. ADMIN: AGREGAR EMPLEADO
            elif self.path == '/api/admin/add_empleado':
                try:
                    cursor.execute("INSERT INTO usuarios VALUES (?, ?, ?, 'empleado')", 
                                   (params['email'], params['nombre'], params['password']))
                    conn.commit()
                    self.redireccionar('/admin.html?msg=empleado_creado')
                except:
                    self.redireccionar('/admin.html?error=error')

            # D. ADMIN: ELIMINAR EMPLEADO (Recibe JSON)
            elif self.path == '/api/admin/del_empleado':
                cursor.execute("DELETE FROM usuarios WHERE email=?", (params['email'],))
                conn.commit()
                self.responder_json({'status': 'ok'})

            # E. EMPLEADO: CONFIRMAR RESERVA (Recibe JSON)
            elif self.path == '/api/reservas/confirmar':
                cursor.execute("UPDATE reservas SET estado='confirmada' WHERE id=?", (params['id'],))
                conn.commit()
                self.responder_json({'status': 'ok'})

            # F. CLIENTE: CREAR RESERVA
            elif self.path == '/api/reservar':
                cursor.execute("INSERT INTO reservas (nombre, email, cancha_id, fecha, hora) VALUES (?, ?, ?, ?, ?)",
                               (params['nombre'], params['email'], params['cancha_id'], params['fecha'], params['hora']))
                conn.commit()
                self.redireccionar('/index.html?reserva=exito')

        except Exception as e:
            print(f"Error: {e}")
        finally:
            conn.close()

    # --- FUNCIONES AUXILIARES ---
    def redireccionar(self, ruta):
        self.send_response(303)
        self.send_header('Location', ruta)
        self.end_headers()

    def enviar_json(self, query):
        """Ejecuta una consulta SQL y devuelve JSON al navegador"""
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row # Para acceder por nombre de columna
        cursor = conn.cursor()
        cursor.execute(query)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        self.responder_json(rows)

    def responder_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

if __name__ == "__main__":
    iniciar_db()
    print(f"🚀 Servidor Admin listo en http://localhost:{PORT}")
    try:
        http.server.HTTPServer(("", PORT), MiManejador).serve_forever()
    except KeyboardInterrupt: pass