class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(
`
<div class="ac-game-playground"></div>
`
        );
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.gamemap = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, 'white', this.height * 0.15, true));

        for (let i = 0; i < 5; i ++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.random_color(), this.height * 0.15, false));
        }

        this.start();

    }

    start() {
        // this.hide();
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }

    random_color(){
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00'];
        return colors[Math.floor(Math.random() * colors.length)];

    }
}
