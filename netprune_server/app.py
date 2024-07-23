import configparser
import routes

config = configparser.ConfigParser()
config.read("config.ini")

if __name__ == '__main__':
    routes.app.run(host=config['flask']['host'],
        port=int(config['flask']['port']),
        debug=config['flask']['debug'],
        threaded = True
    )
