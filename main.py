# import turtle
# 
# def draw_square():
#     for _ in range(4):
#         turtle.forward(100)
#         turtle.left(90)
# 
# def draw_grid():
#     for i in range(5):
#         for j in range(5):
#             draw_square()
#             turtle.forward(100)
#         turtle.backward(500)
#         turtle.right(90)
#         turtle.forward(100)
#         turtle.left(90)
# 
# # Main function
# def main():
#     turtle.speed(0)  # Set the speed to the fastest
#     turtle.penup()
#     turtle.goto(-250, 250)  # Start drawing from the top-left corner
#     turtle.pendown()
#     draw_grid()
#     turtle.done()  # Keep the window open
# 
# if __name__ == "__main__":
#     main()

from http.server import SimpleHTTPRequestHandler, HTTPServer

# Define the directory where files will be served from
# Replace '/path/to/directory' with the actual path to your directory
DIRECTORY = '.'

# Define the HTTP request handler class
class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    # Override the translate_path method to serve files from a specified directory
    def translate_path(self, path):
        # Get the default translated path from the superclass
        path = super().translate_path(path)
        # Replace the default directory with the specified directory
        return path.replace(self.directory, DIRECTORY)

# Define the function to run the server
def run():
    # Set server address ('', port_number) for localhost
    server_address = ('', 8000)
    # Create HTTP server instance with custom request handler
    httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
    # Print a message to indicate that server is running
    print('Starting server...')
    # Start the server
    httpd.serve_forever()

# Execute the run function when script is run
if __name__ == '__main__':
    run()
