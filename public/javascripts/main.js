var socket = io()


Vue.component('room', {
    props: ['name', 'players'],
    template: '<option :value="name">' + 
                '<span> {{players}} online</span>' +
              '</option>'
})

Vue.component('player', {
    props: ['name', 'status', 'owner', 'crown', 'myself'],
    template: '<div class="player" v-bind:class="[(myself) ? \'myself\' : \'\']">' + 
                    '<span class="status fas fa-circle" v-bind:class="[(status) ? \'online\' : \'offline\']"></span>' +
                    '{{name}}' + 
                    '<span @click="kick(name)" class="kick fas fa-times-circle" v-show="owner && !myself"></span>' + 
                    '<span class="crown fas fa-crown" v-show="crown"></span>' + 
              '</div>',
    methods: {
        kick: function(name){
            socket.emit('kick', vm.$data.room.name, name);
        }
    }
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
        game_started: false,
        player_list_open: true,
        card_face_up: true
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
            vm.$data.game_started = false;
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

    if (data.room.player_list.find(x => x.name == vm.$data.player.name) != undefined){
        vm.$data.player = data.room.player_list.find(x => x.name == vm.$data.player.name);
    } else {
        //giocatore kickato!
        vm.$data.player.is_online = false
        vm.$data.role = 'In attesa che la partita inizi'
        vm.$data.detail = ''
    }
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