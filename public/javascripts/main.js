var socket = io()


Vue.component('room', {
    props: ['name', 'players'],
    template: '<option :value="name">' + 
                '<span> {{players}} online</span>' +
              '</option>'
})

Vue.component('player', {
    props: ['name', 'status'],
    template: '<div class="player">' + 
                    '<span class="kick fas fa-times-circle"></span>' + 
                    '<span class="status fas fa-user-circle" v-bind:class="[(status) ? \'online\' : \'offline\']"></span>' +
                        '{{name}}' + 
              '</div>'
})

var name = getCookie('name');

var vm = new Vue({
    el: '#app',
    data: {
        room_list: [],
        player: {
            id: '',
            name: '', //name
            is_owner: false,
            is_online: false//,
            // role: {
            //     name: 'In attesa che la partita inizi'
            // }
        },
        room: {
            name: '',
            player_list: []
        },
        errors: {
            player_name_already_in_use: false,
            missing_login_data: false,
            invalid_player_number: false
        },
        role: 'In attesa che la partita inizi',
        detail: '',
    },
    methods: {
        room_enter: function(){
            if(vm.$data.room.name!='' && vm.$data.player.name!=''){
                vm.$data.errors.missing_login_data = false;
                socket.emit('room_enter', vm.$data, function(data){
                    setCookie('name', vm.$data.player.name, 14);
                    vm.$data.errors.player_name_already_in_use = data.errors.player_name_already_in_use;
                    vm.$data.player = data.player;
                });
            }else{
                vm.$data.errors.missing_login_data = true;
            }
        },
        game: function(){
            socket.emit('game', vm.$data);
        }
    }
})

socket.on('connect', function() {
    vm.$data.player.id = socket.id;

    if (vm.$data.room.name!='' && vm.$data.player.name!=''){
        socket.emit('room_enter', vm.$data, function(data){
            vm.$data.errors.player_name_already_in_use = data.errors.player_name_already_in_use;
            vm.$data.player = data.player;
        });
    }
});

socket.on('welcome', function(message) {
    console.log(message);
});

socket.on('room_list', function(data) {
    vm.$data.room_list = data.room_list;
});

socket.on('room_update', function(data) {
    vm.$data.room = data.room;
    vm.$data.player = data.room.player_list.find(x => x.name == vm.$data.player.name);
});

//     vm.$data.role = message.role;
//     vm.$data.detail = message.detail;
// })

socket.on('role', function(message) {
    vm.$data.role = message.role;
    vm.$data.detail = message.detail;
});

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return '';
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}