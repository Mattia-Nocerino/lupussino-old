var socket = io()


Vue.component('room', {
    props: ['name', 'players'],
    template: '<option :value="name">' + 
                '<span> {{players}} online</span>' +
              '</option>'
})

Vue.component('player', {
    props: ['name', 'vote_ended', 'role', 'voted', 'voted_role', 'score', 'increment', 'bonus', 'status', 'owner', 'crown', 'myself'],
    template: '<div class="player" v-bind:class="[(myself) ? \'myself\' : \'\']">' + 
                    '<span class="status fas fa-circle" v-bind:class="[(status) ? \'online\' : \'offline\']"></span>' +
                    '<span class="player-score">{{(score<0?"":"+")}}{{score}}</span>' + 
                    '<span class="bonus" v-show="bonus>0 && vote_ended">{{(bonus<0?"":"+")}}{{bonus}}</span>' +
                    '<span class="increment" v-show="vote_ended">{{(increment<0?"":"+")}}{{increment}}</span>' +
                    '<span class="player-name-container"><span class="player-name" v-bind:class="[(vote_ended) ? role : \'\']">{{name}}</span></span>' + 
                    '<span class="vote-cnt" v-show="role!=\'Assassino\' && role!=\'Mitomane\' && (vote_ended && role != \'In attesa che la partita inizi\')">'+
                        '<span class="fas fa-hand-point-right"></span>' +
                        '<span class="player-name-container"><span class="player-name">{{voted}}</span></span>' +
                    '</span>' +
                    //'<span @click="kick(name)" class="kick fas fa-times-circle" v-show="owner && !myself"></span>' + 
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
            key: 0,
            name: name,
            password: password,
            is_owner: false,
            is_online: false,
            has_voted: false,
            player_voted: '',
            player_cheated: '',
            cheat_available: true,
            score: 0,
            increment: 0,
            bonus: 0,
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
        player_in_gioco: function () {
            // `this` points to the vm instance
            return this.room.player_list.filter(x => x.role.detail!="").length;
        },
        vote_text: function () {
            if (this.player.has_voted){
                return "Annulla voto";
            } else {
                return "Conferma voto";
            }
        },
        scoreboard: function () {
            return this.room.player_list.sort(function (a, b) {
                return b.score - a.score;
            });
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
                socket.emit('vote', vm.$data);
            }
            //TODO LATO SERVER VOTAZIONE PIU' CALCOLO
        },
        cheat: function(){
            vm.$data.player.cheat_available = false;
            socket.emit('update_cheat', vm.$data);
            alert(vm.$data.player.player_cheated + " è: " + vm.$data.room.player_list.filter(x => x.name==vm.$data.player.player_cheated)[0].role.name);
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

socket.on('room_list', function(data) {
    vm.$data.room_list = data.room_list;
});

socket.on('room_update', function(data) {
    vm.$data.room = data.room;
    // vm.$data.room.player_list = [];
    // vm.$data.room.player_list = data.room.player_list;
    // vm.$data.room.name = data.room.name;
    // vm.$data.room.mitomane_riconosce_assassini = data.room.mitomane_riconosce_assassini;
    // vm.$data.room.testimoni_si_riconoscono = data.room.testimoni_si_riconoscono;
    // vm.$data.room.configurazioni = data.room.configurazioni;
    // vm.$data.room.game_started = data.room.game_started;
    // vm.$data.room.vote_ended = data.room.vote_ended;

    old_vote = vm.$data.player.player_voted;
    //console.log(vm.$data.player.is_online " - " );
    vm.$data.player = vm.$data.room.player_list.filter(x => x.name == vm.$data.player.name)[0];

    if (vm.$data.room.game_started) {
        vm.$data.player.player_voted = old_vote;
    }

    // if (data.room.player_list.find(x => x.name == vm.$data.player.name) != undefined){
    //     vm.$data.player = data.room.player_list.find(x => x.name == vm.$data.player.name);
    //     vm.$data.player.player_voted = old_vote;
    // } else {
    //     //giocatore kickato!
    //     vm.$data.player.is_online = false
    //     vm.$data.player.role.name = 'In attesa che la partita inizi'
    //     vm.$data.player.role.detail = ''
    // }
});

socket.on('role', function(message) {
    vm.$data.role_animation = !vm.$data.role_animation;
    vm.$data.player = message;
});

socket.on('reveal_roles', function() {
    alert_string1 = "<div clas='swal-title'><b>Partita conclusa!</b></div>";
    alert_string2 = "";
    alert_string3 = "";
    vm.$data.room.player_list.filter(x => x.role.detail!='').forEach(p => {
        if(p.name == vm.$data.player.name){
            alert_string2 += "<div class='your-vote'>Tu eri: " + p.role.name + " e hai votato: " + p.player_voted + '<br></div>';
        } else {
            alert_string3 += "<div class='else-vote'>" + p.name + " era: " + p.role.name + " e ha votato: " + p.player_voted + "</div>";
        }
    });


    var alert_cnt_html = document.createElement("alert-cnt-html");
    alert_cnt_html.innerHTML = alert_string1 + alert_string2 + alert_string3

    // swal({
    //     content: {
    //         element: alert_cnt_html,
    //     },
    // });
    //alert(alert_string+alert_string1+alert_string2);
})

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