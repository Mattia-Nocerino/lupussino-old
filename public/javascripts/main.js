var socket = io()


Vue.component('room', {
    props: ['name', 'players'],
    template: '<option :value="name">' + 
                '<span players_online>' +
                    '<span class="room_status"></span> {{players}}' +
                '</span>' +
              '</option>'
})

var vm = new Vue({
    el: '#app',
    data: {
        room_list: [],
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
            if(vm.$data.room.name!='' && vm.$data.player.name!=''){
                vm.$data.errors.missing_login_data = false;
                socket.emit('enter', vm.$data, function(data){
                    vm.$data.errors.player_name_already_in_use = data.errors.player_name_already_in_use;
                    vm.$data.player = data.player;
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

socket.on('room_list', function(data) {
    vm.$data.room_list = data.room_list;
});

//     vm.$data.role = message.role;
//     vm.$data.detail = message.detail;
// })

// socket.on('role', function(message) {
//     console.log('Ti è stato assegnato il ruolo: ' + message)

//     vm.$data.role = message.role;
//     vm.$data.detail = message.detail;
// })