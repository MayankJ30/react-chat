import ReactDOM from 'react-dom';
import React from 'react';
import Hello from './Hello';

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state['username'] = this.props.value;
    socket.on('chat message', (data) =>{
      //console.log(data['value']);
      var msg = data['value'];
      var room = data['room'];
      this.setState((prevs, props) => {
        if(room in prevs){
            prevs[room].push(msg);
            Cookies.set('name', JSON.stringify(prevs));
            return prevs;
        }
        else {
            //console.log(room)
            prevs[room]= [];
            prevs[room].push(msg);
            //console.log(prevs[room])
            Cookies.set('name', JSON.stringify(prevs));
            return prevs;
        }
      });
    });
    if(Cookies.get('name')) {
      var cookie = JSON.parse(Cookies.get('name'));
      if(cookie['username'] == this.state['username']) {
        for (var room in cookie) {
              this.state[room] = cookie[room];
        }
      }
    }

  }
  render() {
    return(
        <div className="container bootstrap snippet">
          <div className="row">
        { Object.keys(this.state).filter(function(x) { return x !== 'username'; }).map((key) => {

          return (
                <div className="col-md-4">
                  <div className="portlet portlet-default">
                    <div className="portlet-heading">
                      <div className="portlet-title">
                        <h4><i className="fa fa-circle text-green"></i> {key}</h4>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                    <div id="chat" className="panel-collapse collapse in">
                      <div>
                        <div className="portlet-body chat-widget" style={{overflow: 'auto' ,width: 'auto', height: 300 + 'px'}}>
                          {this.state[key].map(function(msg, index){
                                return (
                                <div className="row">
                                <div className="col-lg-12">
                                  <div className="media">
                                      <a className="pull-left" href="#">
                                          <img className="media-object img-circle" src="https://lorempixel.com/30/30/people/1/" alt=""/>
                                      </a>
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
    this.state = {value: '', name: '' , room: '', registered : false,  rooms: []};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    socket.on('room-update' , (room) => {
      if (!this.state.rooms.includes(room)) {
        this.state.rooms.push(room);
      }
    });
    socket.emit('new-user');
    socket.on('get-room', () => {
      if(this.state.room != '') {
        socket.emit('join', this.state)

      }
    })

    console.log(io);
  }

  handleChange(event) {
    if(event.target.name == "msg")
      this.setState({value: event.target.value});
    else if(event.target.name == "name")
      this.setState({name: event.target.value});
    else
      this.setState({room: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    if(this.state.registered == false) {
      if(this.state.value == "" && this.state.name != "" && this.state.room == "") {
        this.setState((prevs) => {
          prevs.room = prevs.name;
          prevs.rooms.push(prevs.name);
          prevs.registered = true;
          return prevs;
        }, () => {
          console.log(this.state);
          socket.emit('join', this.state);
        });

      }
      else {
        alert("Resubmit")
      }
    }
    else if(this.state.room != "" && this.state.value != "" ) {

      alert('a msg was submitted in room ' + this.state.room);
      console.log(this.state.value);
      this.setState((prevs) => {
        prevs.value = prevs.name + ": " + prevs.value;
        return prevs;
      }, () => {
        socket.emit('join', this.state);
        socket.emit('chat message', this.state);
        this.setState({value: ""});

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
      <form onSubmit={this.handleSubmit}>
        <label>
          Message:
          <input type="text" name = "msg" value={this.state.value} onChange={this.handleChange} />
        </label>
        <label>
          Name:
          <input type="text" name = "name" value={this.state.name} onChange={this.handleChange} readOnly = {this.state.registered} />
        </label>
        <label>
        Room:
        <select value = {this.state.room} onChange = {this.handleChange}>
          <option></option>
          {this.state.rooms.map(function(room, key) {
            return <option value={room} key = {key}> {room} </option>;
          })}
        </select>
        </label>
        <input type="submit" value="Submit" />
      </form>
      {this.state.registered == true &&
        <div>
        <h1> Chats </h1>
        <Messages value = {this.state.name} />
        </div>
      }
      </div>
    );
  }
}



ReactDOM.render(<div><NameForm/></div>, document.getElementById('reactEntry2'))
