var socket = io()

var vm = new Vue({
    el: '#app',
    data: {
        player: {
            id: '',
            name: '',
            is_owner: false,
            is_online: false,
            role: ''
        },
        room: {
            name: '',
            player_list: []
        },
        errors: {
            player_name_already_in_use: false,
            missing_login_data: false
        }
    },
    methods: {
        enter: function(){
            if(room.name!='' && player.name!=''){
                vm.$data.errors.missing_login_data = false;
                socket.emit('enter', vm.$data, function(data){
                    vm.$data.errors.player_name_already_in_use = data.error.player_name_already_in_use;
                });
            }else{
                vm.$data.errors.missing_login_data = true;
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