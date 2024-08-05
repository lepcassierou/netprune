import configparser
# import routes
import flask
import handler.handler as handler

config = configparser.ConfigParser()
config.read("config.ini")

app = flask.Flask(__name__)
request_handler = handler.Handler()

def make_response(result, code=200, file=False):
    response = flask.make_response(result, code)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.add('Content-Type', 'application/json')
    return response


@app.route('/')
def hello_world():
    return 'Hello, World!'


#########################################
# Instance                              #
#########################################
@app.route('/instance/deletion/<id>')
def instance_deletion_route(id):
    return make_response(request_handler.instance_deletion({'instance_id': id}))



#########################################
# Scenario                              #
#########################################
@app.route('/scenario/initialisation/<id>')
def scenario_init_route(id):
    return make_response(request_handler.scenario_init({'scenario_id': id}))


@app.route('/scenario/inheritance/<id1>/<id2>')
def scenario_inheritance_route(id1, id2):
    return make_response(request_handler.scenario_inheritance({'ref_scenario_id': id1, 'new_scenario_id':id2}))


@app.route('/scenario/deletion/<instanceid>/<scenarioid>')
def scenario_deletion_route(instanceid, scenarioid):
    return make_response(request_handler.scenario_deletion({'instance_id': instanceid, 'scenario_id': scenarioid}))


@app.route('/scenario/redoTesting/<scenarioId>')
def scenario_redo_testing(scenarioId):
    return make_response({
            "statusCode": 500,
            "body": False,
        })

if __name__ == '__main__':
    app.run(host=config['flask']['host'],
        port=int(config['flask']['port']),
        debug=config['flask']['debug'],
        threaded = True
    )
