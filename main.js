var messages = [{from:'ragnar', message:'take the blue pill'}];

function generateName (  ) {
  var hackerNames = ['trinity', 'neo', 'morpheus', 'tank', 'bishop','oracle','switch', 'cypher', 'apoc', 'dozer'];
  var name = hackerNames[parseInt(Math.random()*10)];
  var number = parseInt(Math.random()*999);
  return name+number;
}

/* ajax methods*/
function save( user, message) {
  var req = {
    method: "POST",
    url: "https://webtask.it.auth0.com/api/run/wt-ijimenezgarzon-gmail_com-0/hackerchat.js",
    data: { 
      user: user,
      text: message
    }
  };
  
  return $.ajax(req)
  .done(function( msg ) {
    console.log( "Data Saved: " + JSON.stringify( msg ) );
  });
}

function load( timestamp) {
  var data = {};
  
  if(timestamp){
    data = {
      timestamp: parseInt(timestamp)
    }
  }
  
  var req = {
    method: "GET",
    url: "https://webtask.it.auth0.com/api/run/wt-ijimenezgarzon-gmail_com-0/hackerchat.js",
    data: data
  };
  
  return $.ajax(req);
}
/* end ajax methods*/

function initEvents() {
  var hackerName = generateName();
  $('.hacker-name').text(hackerName + " $");
  appState.user = hackerName;
  $('.input-message').keypress(function(e) {
      if(e.which == 13) {
          saveProcess();
      }
  });
  $('.send-button').click(function(evt){
    saveProcess();
  });
  $('.input-message').focus();
}

function saveProcess ( ) {
  var user = appState.user;
  var message = $('.input-message').val();
  if(message.length > 0){
    save( user, message );
    $('.input-message').val('');
    $('.input-message').focus();
  }
}

function buildMessage( user, timestamp, text ) {
    var title = $('<div />', {
      class:'message-title'
    }).text( timestamp + ' ' + user + ':' );

    var text = $('<div />', {
      class:'message-text'
    }).text( text );

    var detail = $('<div />', {
      class: 'message-detail-container'
    });  

    detail.append(title);
    detail.append(text);

    return detail;
  }

function loadMessages() {
  return load().then(function(messages){
    console.log(messages);
    appState.setMessages( messages );
    
    messages.forEach(function(message){
      var messageDiv = buildMessage(message.user || 'anonymus', message.timestamp, message.text);
      
      $('.messages-container').append(messageDiv);
    });
    
    appState.lastTimestamp = messages[ messages.length - 1 ].timestamp;
   });
}

function refreshInterval( ) {
  function action(){
    console.log('interval running: ' + appState.lastTimestamp);
    load(appState.lastTimestamp).then(function(messages){
    console.log(messages);
    appState.pushMessages( messages );
    
    messages.forEach(function(message){
      var messageDiv = buildMessage(message.user || 'anonymus', message.timestamp, message.text);
      $('.messages-container').append(messageDiv);
    });
    
      if(messages.length > 0){
        appState.lastTimestamp = messages[ messages.length - 1 ].timestamp;    
        scrollToBottom();
      }
      // only execute the action after the response is received
      setTimeout(action,333);
   })
  }
  var interval = setTimeout(action,333);
}

function scrollToBottom() {
  $(".messages-container").animate({ scrollTop: $('.messages-container').prop("scrollHeight")}, 1000);
}

$(document).ready(function(){
  initEvents();
  loadMessages().then(function(){
    refreshInterval();
    scrollToBottom();
  });
});

var appState = {
  messages: [],
  setMessages: function(messages){
    this.messages = messages;
  },
  pushMessages: function(messages){
    messages.forEach(function(m){
      this.messages.push(m);  
    });
  },
  lastTimestamp: 0 
}