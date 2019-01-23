var socket = io();

var vm = new Vue({
    el: '#app',
    data: {
        room: '',
        player: '',
        is_owner: false,
        in_room: false,
        enter_error: false
    },
    methods: {
        enter: function(){
            if(room.value!='' || player.value!=''){
                socket.emit('enter', vm.$data, function(error, message){
                    if (error){
                        vm.$data.enter_error = true;
                        vm.$data.in_room = false;
                    } else {
                        vm.$data.enter_error = false;
                        vm.$data.in_room = true;
                        vm.$data.is_owner = message.is_owner;
                    }
                });
            }else{
                alert('Inserisci un nome per la stanza e/o un nickname')
            }
        },
        game: function(){
            socket.emit('game', vm.$data, function(error, message){

            });
        }
    }
})