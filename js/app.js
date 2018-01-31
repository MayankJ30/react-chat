import ReactDOM from 'react-dom';
import React from 'react';


class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {inputs: {}, keys: {}};
    this.state['username'] = this.props.value.name;
    this.onClick = this.onClick.bind( this);
    this.onKeyPress = this.onKeyPress.bind( this);
    this.onChange = this.onChange.bind( this);
    this.callCallback = this.callCallback.bind( this);


    socket.on('chat message', (data) =>{
      console.log(data);
      var msg = data['value'];
      var room = data['room'][data['user']];
      this.setState((prevs, props) => {
        if(room in prevs){
            prevs[room].push(msg);
        }
        else {
            //console.log(room)
            prevs[room]= [];
            prevs[room].push(msg);
            //console.log(prevs[room])
        }
        return prevs;
      });
      var obj = {m_data: this.state, s_data: this.props.value}
      Cookies.set(this.state['username'], JSON.stringify(obj));

      $("div[id='"+ data['room'][data['user']] + "']").fadeIn()
      document.getElementById("chat-box").scrollTop =  document.getElementById("chat-box").scrollHeight;
      //  $('div.chat-widget').animate({ scrollTop: $(document).height() }, "slow");
    });

    if(Cookies.get(this.state['username'])) {
      var cookie = JSON.parse(Cookies.get(this.state['username']));
      console.log(cookie )

      if(cookie.m_data['username'] == this.state['username']) {
        var room_key_list = Object.keys(cookie.m_data).filter(function(x) { return (x !== 'username' && x != 'inputs' && x!= 'keys'); })
        for (var index in room_key_list ) {
          console.log(this.props.value.rooms)
          var room_key = room_key_list[index]
          var user = ""
          for(var t_user in cookie.s_data.room) {
            console.log("try:" + t_user )
            console.log(room_key)
            if(cookie.s_data.room[t_user] == room_key)
              {console.log("Match: " + user)
                user = t_user;
              break;
            }
          }
          console.log(user)
          if( this.props.value.rooms.hasOwnProperty(user) )
              this.state[room_key] = cookie.m_data[room_key];
        }
      }
    }

  }

callCallback(data) {
  this.props.callback(data)
}

componentDidMount() {
  if( document.getElementById("chat-box"))
      document.getElementById("chat-box").scrollTop =  document.getElementById("chat-box").scrollHeight;
}

  onClick(item, event) {
    console.log(item)
    $("div[id='"+ item + "']").fadeOut()
  }

  onKeyPress(event) {
    event.preventDefault();
    var index = event.target.id
    console.log("Key")
    console.log(this.state.inputs[index])
    console.log(this.state.keys[index])
    var msg = this.state.inputs[index]
    var key = this.state.keys[index]
    var data = {}
    data['user'] = "";
    for (var user in this.props.value.room) {
      console.log(key)
      if(this.props.value.room[user] == key)   {
        data['user'] = user;
        break;
      }
    }
    data['room'] = {}
    data['room'][data['user']] = key
    data['value'] = this.state['username'] + ': ' + msg
    data['name'] = this.state['username']

    socket.emit('join-chat', data)
    window.setTimeout(() => {
      socket.emit('chat message', data);
    }, 200);

  }

onChange(event) {
  const target = event.target;
  const value = target.value;
  const name = target.name;

  this.setState((prevs) => {
    prevs.inputs[name] = value;
    prevs.keys[name] = target.id
    return prevs;
  });
}

//ref={(input) => {this.input[key] = input; this.key[key] = key}}

  render() {
    return(
        <div className="container bootstrap snippet">
          <div className="row">
        { Object.keys(this.state).filter(function(x) { return (x !== 'username' && x != 'inputs' && x!= 'keys'); }).map((key, ind) => {

          return (
                <div className="col-md-4" id= {key} key={key} >
                  <div className="portlet portlet-orange">
                    <div className="portlet-heading">
                      <div className="portlet-title">
                        <button type="button" className="close" aria-label="Close"  onClick={() => {this.onClick(key)}}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                    <div id="chat" className="panel-collapse collapse in">
                      <div>
                        <div id= "chat-box" className="portlet-body chat-widget" style={{overflow: 'auto' ,width: 'auto', height: 300 + 'px'}}>
                          {this.state[key].map(function(msg, index){
                                return (
                                <div className="row" key={index}>
                                <div className="col-lg-12">
                                  <div className="media">

                                      <div className="media-body">
                                          <h4 className="media-heading"> {msg.substring(0,msg.indexOf(':'))}
                                          </h4>
                                          <p>{msg.substring(msg.indexOf(':')+1)}</p>
                                      </div>
                                  </div>
                                </div>
                                <hr/>
                                </div> )})}
                        </div>
                      </div>
                      <div className="portlet-footer">
                        <form id={ind} onSubmit={this.onKeyPress}>
                            <div className="form-group text">
                                <input type="text" className="form-control text" placeholder="Enter message..."  id={key} name= {ind} value={this.state['inputs'][ind]} onChange={this.onChange}></input>
                                <input hidden type="submit" value="Submit" />
                            </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
    )})}
      </div>
    </div>
  )
  }
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '', name: '' , user: '' , room: {}, registered : false,  rooms: {}};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cookieupdate = this.cookieupdate.bind(this);
    socket.on('room-update' , (data) => {
    //  if (!Object.keys(this.state.rooms).includes(data['name'])) {
        this.state.rooms[data['name']] = data['id'] ;

     // }

    });
    socket.emit('new-user');
    socket.on('get-room', () => {
      if(Object.keys(this.state.rooms).length != 0) {
        socket.emit('join', this.state)

      }
    })
    socket.on('leave-chat', (data) => {
      console.log("Leave")
      this.setState((prevs) => {
        for (var key in prevs.rooms) {
          if(prevs.rooms[key] == data['id']) {
            delete prevs.rooms[key]
            break;
          }
        }
        return prevs;

      })
    })
    socket.on('are-you' ,(data) => {
      if(this.state.name == data.user) {
        socket.emit('join-room', data.to_join);
        this.setState((prevs) =>
          {prevs.room[data.m_from] = data.to_join
          return prevs;})
      }
    })


    console.log(io);
  }

  cookieupdate(data) {
    console.log("Cookie-Update")
    this.setState((prevs) => {
      prevs.rooms[prevs.name] = data.rooms[prevs.name]
      for (var name in data.room) {
        console.log(name)
        console.log(data.room)
        console.log(prevs.room)
        prevs.room[name] = data.room[name]

      }
      //prev.room = data.room
      return prevs;
    }, () => {
      socket.emit('join', this.state)
    })
  }

  handleChange(event) {
    if(event.target.name == "msg")
      this.setState({value: event.target.value});
    else if(event.target.name == "name")
      this.setState({name: event.target.value});
    else
      this.setState({user: event.target.value});
  }


  handleSubmit(event) {
    event.preventDefault();
    if(this.state.registered == false) {
      if(this.state.value == "" && this.state.name != "" && this.state.user == "") {
        this.setState((prevs) => {
          //prevs.room = prevs.name;
          prevs.rooms[prevs.name]  = socket.id;
          prevs.registered = true;
          return prevs;
        }, () => {
          console.log(this.state);
          if(Cookies.get(this.state.name)) {
            var cookie = JSON.parse(Cookies.get(this.state.name));
            this.cookieupdate(cookie.s_data);
          }
          else socket.emit('join', this.state);

        });

      }
      else {
        alert("Resubmit")
      }
    }
    else if(this.state.user != "" && this.state.value != "" ) {

      alert('a msg was submitted in room ' + this.state.room);
      console.log(this.state.value);
      this.setState((prevs) => {
        prevs.value = prevs.name + ": " + prevs.value;
        if(!(prevs.user in prevs.room)) {
            prevs.room[prevs.user] = Math.floor(Math.random()*1000) ;
        }

        return prevs;
      }, () => {

        socket.emit('join-chat', this.state)
        window.setTimeout(() => {
          socket.emit('chat message', this.state);
          this.setState({value: ''})
        }, 200);


      })
    }
    /*else if (this.state.name != ""){

      alert('a msg was submitted without room: ' + this.state.value);

       this.setState((prevs) => {
         prevs.room = prevs.name;
         prevs.rooms.push(prevs.name);
         return prevs;
       }, () => {
         console.log(this.state);
         socket.emit('join', this.state);
         socket.emit('chat message', this.state);
       });
    }
    */
    else {
      alert("Resubmit");

    }
  }

  render() {
    return (
      <div>
      <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
      <form className='form-inline' onSubmit={this.handleSubmit}>
        <div className="form-group">
        <label>
          Message:
        </label>
        <input type="text" className="form-control" name = "msg" value={this.state.value} onChange={this.handleChange} placeholder="Type Message" />
        </div>
        <div className='form-group right-group'>

        <input type="text" className="form-control" name = "name" value={this.state.name} onChange={this.handleChange} readOnly = {this.state.registered} placeholder="Type Name"/>
        <label>
        User:
        </label>
        <select value = {this.state.user} onChange = {this.handleChange} id="target" className="form-control" disabled = {this.state.registered == false &&  true} >

          {Object.keys(this.state.rooms).filter((x) => {if(this.state.registered == true && x == this.state.name) {return false;} return true;}).map(function(room, key) {
            return <option value={room} key = {key}> {room} </option>;
          })}
          <option hidden disabled> </option>
        </select>
        <button type="submit" className = 'btn btn-default' value="Submit" >
         {this.state.registered == true &&
            <div>  Start/Continue Conversation! </div>
          }
         {this.state.registered == false &&
              <div> Register your Name </div>
          }
        </button>
        </div>
      </form>
      </div>
      </div>
      </nav>

        <div>
        <h1> Chat Server </h1>
        <hr/>
        {this.state.registered == true &&
          <Messages value = {this.state} callback = {this.cookieupdate} />
        }
        </div>
      </div>
    );
  }
}



ReactDOM.render(<div><NameForm/></div>, document.getElementById('reactEntry2'))
