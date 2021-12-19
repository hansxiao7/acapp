class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(
`
<div class="ac-game-playground"></div>
`
        );
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    create_uuid(){
        let res = '';
        for (let i = 0; i < 8; i ++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }

        return res;
    }


    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function(){
            outer.resize();
        });

        if (this.root.AcWingOS){
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`);
            });
        }
    }


    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.gamemap) this.gamemap.resize();
    }

    show(mode) {
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.gamemap = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;


        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 'white', 0.15, "me", this.root.settings.username, this.root.settings.photo));


        if (mode === "single mode"){
            for (let i = 0; i < 5; i ++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode"){
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

    }

    hide() {
        while (this.players && this.players.length > 0){
            this.players[0].destroy();
        }

        if (this.gamemap) {
            this.gamemap.destroy();
            this.gamemap = null;
        }

        if (this.notice_board){
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board){
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }

    random_color(){
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00'];
        return colors[Math.floor(Math.random() * colors.length)];

    }
}
