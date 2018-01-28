import sys
from flask import Flask, render_template, request, make_response, session
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
socketio = SocketIO(app, manage_session=False)

@app.route('/')
def hello():
    #print("Flask works!")
    resp = make_response(render_template('index.html'))
    return resp




@socketio.on('chat message')
def handle_message(data):
    #send( data['message'], room = data['room'])
    room = data['room']
    #print('received message: ' + data['value'])
    #print('room: ' + data['room'])
    #msgs = session[room]
    #msgs.append(data['value'])
    #print(msgs)
    sys.stdout.flush()
    #session[room] = msgs

    emit('chat message', data, room=room)


@socketio.on('join')
def on_join(data):
    #username = data['username']
    room = data['room']
    join_room(room)
    print("room: " + room)
    #session[room]= []
    sys.stdout.flush()
    emit('room-update', room, broadcast=True);
    #send('entered the room.', room=room)

@socketio.on('leave')
def on_leave(data):
    #username = data['username']
    room = data['room']
    leave_room(room)
    send(' left the room.', room=room)


@socketio.on('new-user')
def on_new():
    emit('get-room', skip_sid = request.sid , broadcast=True)
    print("New user")
    print(request.cookies)
    '''for room in session:
        emit('join', room)
        for msg in room:
            data['value'] = msg
            data['room'] = room
            emit('chat message', data)'''
    sys.stdout.flush()


if __name__ == '__main__':
    socketio.run(app)
