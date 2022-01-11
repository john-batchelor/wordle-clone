var hints = [];

var tile = {
    props: ["letter"],
    template: '<div :class="\'tile \' + letter.result">{{this.letter.letter}}</div>',
    mounted: function(){
        //debugger;
    }
};

var tileRow = {
    template: '<div class="row"><tile v-for="a in attempt" v-bind:letter="a"></tile></div>',
    components: {
        "tile": tile
    },
    props: {
        attempt: Array
    },
    mounted: function(){
        //debugger;
    }
};

var Gameboard = {
    props: {
        attempts: Array
    },
    template: '<div id="game"><tile-row v-for="attempt in attempts" v-bind:attempt="attempt"></tile-row></div>',
    components: {
        "tile-row": tileRow
    },
    mounted: function(){
        //debugger;
    }
};

var key = {
    props: {
        character: String
    },
    methods: {
        keyPress: function(){
            console.log(this.character);
            this.press();
        },
        press: function(){
            this.$emit("press", this.character);
        }
    },
    template: '<div class="key" @click="keyPress">{{character}}</div>'
};

var keyboard = {
    data: function(){
        return {
            keys:   [   ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], 
                        ["a", "s", "d", "f", "g", "h", "j", "k", "l"], 
                        ["z", "x","c", "v", "b", "n", "m"]
                    ]
        };
    },
    mounted: function(){

        var self = this;
        $("body").on("keypress", function(e){

            var key =  String.fromCharCode(e.which);

            if(new RegExp(/^[a-z]$/i).test(key))
            {
                self.onKeyClick(key);
            }
           
        });
        
        $('body').keyup(function(e)
        {
            if(e.keyCode == 8)
                self.backspace();

            if(e.keyCode == 13)
                self.enter();
        });


    },
    components: {
        "key-char": key
    },
    methods: {
        onKeyClick: function(value){
            this.$emit("keypress", value);
        },
        enter: function()
        {
            this.$emit("enter");
        },
        backspace: function(){
            this.$emit("backspace");
        }
    },
    template:   '<div id="keyboard">\
                    <div v-for="line in keys">\
                        <key-char v-for="char in line" v-bind:character="char" v-on:press="onKeyClick"></key-char>\
                    </div>\
                    <key-char v-bind:character="\'back\'" v-on:click.native="backspace"></key-char>\
                    <key-char v-bind:character="\'enter\'" v-on:click.native="enter"></key-char>\
                </div>'

};

var Message = {
    props: {
        win: Boolean
    },
    template:   '<div class="message">\
                    <div v-if="win">\
                        Congratulations, check back tomorrow for another challenge!\
                    </div>\
                    <div v-else>\
                        Hard lines, try again tomorrow.\
                    </div>\
                </div>'
};

new Vue({
    el: "#app",
    components: {
        "game": Gameboard,
        "keyboard": keyboard,
        "message": Message
    },
    data: function(){
        return {
            attempts: [
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}],
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}],
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}],
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}],
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}],
                [{letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}, {letter: "", result: ""}]
            ],
            currentAttempt: 0,
            currentChar: 0,
            win: false,
            enabled: true
        }
    },
    methods: {
        add: function(value)
        {
            if(this.win)
                return;

            if(this.gameover)
                return;
            
            if(this.currentChar == 5)
            {
                return;
            }
            
            this.$set(this.attempts[this.currentAttempt], this.currentChar, {letter: value, result: ""});

            this.currentChar++;
        },
        back: function(){
            

            if(this.currentChar == 0)
                return;

            this.currentChar--;

            this.$set(this.attempts[this.currentAttempt], this.currentChar, {letter: "", result: ""});
        },
        enterClicked: function() {
            
            var attempt = this.attempts[this.currentAttempt];

            var word = "";

            for(var i in attempt)
            {
                var a = attempt[i].letter;

                if(a == "")
                {
                    console.log("Invalid character");
                    return;
                }

                word += a;
            }

            this.currentAttempt++;
            this.currentChar = 0;

            var self = this;

            $.ajax({
                url: "/api/check?word=" + word,
                success: function(data){
                    

                    if(data.correct == false)
                    {
                        
                        var current = self.attempts[self.currentAttempt-1];

                        $.each(current, function(index, item){
                            if(data.results[item.letter] != null){
                                var copy = item;

                                var result = data.results[item.letter];

                                copy.result = result;

                                self.$set(self.attempts[self.currentAttempt-1], index, copy);
                            }
                        });
                        
                    }
                    else
                    {
                        var current = self.attempts[self.currentAttempt-1];

                        $.each(current, function(index, item){
                            
                                var copy = item;

                                copy.result = "green";

                                self.$set(self.attempts[self.currentAttempt-1], index, copy);
                            
                        });

                        self.win = true;
                        self.onWin();
                    }
                },
                error: function(err){
                    console.log(err);
                }
            })
        },
        onGameOver: function(){
            localStorage.setItem("wordle-clone", JSON.stringify({
                gameover: true,
                date: new Date()
            }));

            this.enabled = false;
        },
        onWin: function(){
            localStorage.setItem("wordle-clone", JSON.stringify({
                win: true,
                date: new Date()
            }));

            this.enabled = false;
        }
    },
    computed: {
        gameover: function(){

            if(this.win)
            {
                this.onWin();
                return true;
            }

            if(this.currentAttempt > 5)
            {
                this.onGameOver();
                return true;
            }

            if(this.currentAttempt >= 5 && this.currentChar > 4 && this.win == false)
            {
                return true;
            }
            
            return false;
        }
    },
    mounted: function(){
        console.log(this.attempts);

        var json = localStorage.getItem("wordle-clone");

        if(json != null)
        {
            var data = JSON.parse(json);

            var date = data.date;

            var yesterday = moment(data.date);
            var now = moment();

            if((data.win == true || data.gameover == true) && now.diff(yesterday) > 0)
            {
                this.enabled = false;
                this.win = data.win;
            }
                
        }   

    },
    template:   '<div>\
                    <div v-if="enabled">\
                        <game v-bind:attempts="attempts"></game>\
                        <keyboard v-on:keypress="add" v-on:backspace="back" v-on:enter="enterClicked"></keyboard>\
                    </div>\
                    <div v-else>\
                        <message v-bind:win="win"></message>\
                    </div>\
                </div>'
});


