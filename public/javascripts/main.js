var socket = io()

var vm = new Vue({
    el: '#app',
    data: {
        player: {
            id: '',
            name: '',
            is_owner: false,
            is_online: true,
            role: ''
        },
        room: {
            name: '',
            player_list: []
        },
        login_error = false
    },
    methods: {
        enter: function(){
            if(room.value!='' || player.value!=''){
                socket.emit('enter', vm.$data, function(error){
                    if (error){
                        vm.$data.enter_error = true
                        vm.$data.in_room = false
                    } else {
                        vm.$data.enter_error = false
                        vm.$data.in_room = true
                        vm.$data.is_owner = message.is_owner
                    }
                });
            }else{
                alert('Inserisci un nome per la stanza e/o un nickname')
            }
        }
        // game: function(){
        //     socket.emit('game', vm.$data);
        // }
    }
})

socket.on('connect', function() {
    vm.$data.player.id = socket.id;
});

socket.on('welcome', function(message) {
    console.log(message);
});

//     vm.$data.role = message.role;
//     vm.$data.detail = message.detail;
// })

// socket.on('role', function(message) {
//     console.log('Ti è stato assegnato il ruolo: ' + message)

//     vm.$data.role = message.role;
//     vm.$data.detail = message.detail;
// })