class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.gamemap.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;
        this.damage = damage;
    }

    start(){
    }

    update(){
        if (this.move_length < this.eps){
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);

        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;
        
        for (let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if (player === this.player) continue;
            let dist = player.get_dist(this.x, this.y, player.x, player.y);
            let r = player.radius;

            if (dist <= r + this.radius){
                let angle = Math.atan2(player.y - this.y, player.x - this.x);
                this.destroy();
                player.is_attack(angle, this.damage);
                return false;
            }

        }

        this.render();

    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
