var socket = io()


Vue.component('room', {
    props: ['name', 'players'],
    template: '<option :value="name">' + 
                '<span> {{players}} online</span>' +
              '</option>'
})

Vue.component('player', {
    props: ['name', 'score', 'status', 'owner', 'crown', 'myself'],
    template: '<div class="player" v-bind:class="[(myself) ? \'myself\' : \'\']">' + 
                    '<span class="status fas fa-circle" v-bind:class="[(status) ? \'online\' : \'offline\']"></span>' +
                    '{{name}} - {{score}}' + 
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
var password = getCookie('password');

var vm = new Vue({
    el: '#app',
    data: {
        room_list: [],
        player: {
            id: '',
            name: name,
            password: password,
            is_owner: false,
            is_online: false,
            has_voted: false,
            player_voted: '',
            score: 0,
            role: {
                name: 'In attesa che la partita inizi',
                detail: ''
            }
        },
        room: {
            name: '',
            player_list: [],
            mitomane_riconosce_assassini: false,
            testimoni_si_riconoscono: false,
            configurazioni: [],
            game_started: false,
            vote_ended: false
        },
        errors: {
            player_name_already_in_use: false,
            missing_login_data: false,
            wrong_password: false
        },
        player_list_open: true,
        card_face_up: true,
        setting_window_open: false,
        mitomane_riconosce_assassini: false,
        testimoni_si_riconoscono: false,
        role_animation: false
    },
    computed: {
        player_number: function () {
            // `this` points to the vm instance
            return this.room.player_list.filter(x => x.is_online).length;
        },
        vote_text: function () {
            if (this.player.has_voted){
                return "Annulla voto";
            } else {
                return "Conferma voto";
            }
        }
    },
    methods: {
        room_enter: function(){
            if(vm.$data.room.name!='' && vm.$data.player.name!=''){
                vm.$data.errors.missing_login_data = false;
                socket.emit('room_enter', vm.$data, function(data){
                    setCookie('name', vm.$data.player.name, 14);
                    setCookie('password', vm.$data.player.password, 14);
                    vm.$data.errors.player_name_already_in_use = data.errors.player_name_already_in_use;
                    vm.$data.errors.wrong_password = data.errors.wrong_password;
                    vm.$data.player = data.player;
                });
            }else{
                vm.$data.errors.missing_login_data = true;
            }
        },
        game: function(){
            if (!vm.$data.room.vote_ended && vm.$data.room.game_started){
                if (!confirm("È ancora in corso una partita. Sicuro di volerne iniziare un'altra?")){
                    return;
                }
            }
            socket.emit('game', vm.$data);
        },
        vote: function(){
            if (vm.$data.player.player_voted == "") {
                alert("Seleziona un giocatore valido prima di effettuare una votazione");
            } else {
                vm.$data.player.has_voted = !vm.$data.player.has_voted;
            }
            //TODO LATO SERVER VOTAZIONE PIU' CALCOLO
        },
        update_settings: function(){
            socket.emit('update_settings', vm.$data);
            vm.$data.setting_window_open = false;
        },
        open_settings: function(){
            if (vm.$data.setting_window_open == false){ //stai aprendo
                vm.$data.mitomane_riconosce_assassini = vm.$data.room.mitomane_riconosce_assassini;
                vm.$data.testimoni_si_riconoscono = vm.$data.room.testimoni_si_riconoscono;

                vm.$data.setting_window_open = true;
            } else if (vm.$data.mitomane_riconosce_assassini != vm.$data.room.mitomane_riconosce_assassini || vm.$data.testimoni_si_riconoscono != vm.$data.room.testimoni_si_riconoscono) {//chiudi con impostazioni cambiate
                if (confirm("Chiudere senza salvare?")) {
                    vm.$data.room.mitomane_riconosce_assassini = vm.$data.mitomane_riconosce_assassini;
                    vm.$data.room.testimoni_si_riconoscono = vm.$data.testimoni_si_riconoscono;
                    vm.$data.setting_window_open = false;
                }
            } else { //chiudi normalmente
                vm.$data.setting_window_open = false;
            }
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
        vm.$data.player.role.name = 'In attesa che la partita inizi'
        vm.$data.player.role.detail = ''
    }
});

socket.on('role', function(message) {
    vm.$data.role_animation = !vm.$data.role_animation;
    vm.$data.player = message;
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