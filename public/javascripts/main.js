var socket = io();

var vm = new Vue({
    el: '#app',
    data: {
        room: '',
        player: '',
        enter_error: false
    },
    methods: {
        enter: function(){
            if(room.value!='' || player.value!=''){
                socket.emit('enter', vm.$data, function(error){
                    if (error){
                        vm.$data.enter_error = true;
                    } else {
                        vm.$data.enter_error = false;
                    }
                });
            }else{
                alert('Inserisci un nome per la stanza e/o un nickname')
            }
        }
    }
})