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

    start() {
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
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

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 'white', 0.15, "me", this.root.settings.username, this.root.settings.photo));


        if (mode === "single mode"){
            for (let i = 0; i < 5; i ++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

    }

    hide() {
        this.$playground.hide();
    }

    random_color(){
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00'];
        return colors[Math.floor(Math.random() * colors.length)];

    }
}
