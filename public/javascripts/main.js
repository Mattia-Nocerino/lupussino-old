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
                socket.emit('enter', room.value, player.value)
            }else{
                alert('Inserisci un nome per la stanza e/o un nickname')
            }
        }
    }
})