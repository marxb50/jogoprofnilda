import http.server
import socketserver
import os
import sys

PORT = 8775
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SafeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def log_message(self, format, *args):
        try:
            sys.stderr.write("%s - - [%s] %s\n" %
                             (self.address_string(),
                              self.log_date_time_string(),
                              format % args))
        except Exception:
            pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), SafeHandler) as httpd:
            print(f"Servidor Game Nilda ativo na porta {PORT}")
            httpd.serve_forever()
    except Exception as e:
        print("Erro no servidor:", e)

if __name__ == '__main__':
    run_server()
