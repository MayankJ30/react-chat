import sys
from flask import Flask, render_template, request, make_response, session
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
socketio = SocketIO(app, manage_session=False, ping_timeout = 9, ping_interval = 3)

@app.route('/')
def hello():
    #print("Flask works!")
    resp = make_response(render_template('index.html'))
    return resp

@socketio.on('connect' )
def test_connect():
    id = request.sid
    print("Connected: %s" % (id))
    sys.stdout.flush()

@socketio.on('disconnect')
def test_disconnect():
    id = request.sid
    emit('leave-chat' , {'id': id}, broadcast=True)
    print('Client disconnected %s' % (id))
    sys.stdout.flush()





    emit('my response', {'data': 'Connected'})



@socketio.on('chat message')
def handle_message(data):
    #send( data['message'], room = data['room'])
    room = data['room'][data['user']]
    print(data)
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
    user = data['name']
    #join_room(room)
    print("user: " + user)
    #session[room]= []
    sys.stdout.flush()
    emit('room-update', {'name' : user, 'id': request.sid}, broadcast=True);
    #send('entered the room.', room=room)


@socketio.on('join-chat')
def on_join_chat(data):
    print(data)
    sys.stdout.flush()
    room = (data['room'][data['user']])
    join_room(room)

    emit('are-you', {'m_from': data['name'] , 'user': data['user'] , 'to_join' :room} , broadcast=True)

@socketio.on('join-room')
def on_join_room(data):
    print(data)
    print('-------------------------------------------------')
    sys.stdout.flush();
    join_room(data);




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
