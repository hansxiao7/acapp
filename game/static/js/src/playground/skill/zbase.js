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
        this.eps = 0.01;
        this.damage = damage;
    }

    start(){
    }

    update(){
        if (this.move_length < this.eps){
            this.destroy();
            return false;
        }

        this.update_move();

        if (this.player.character !== 'enemy')
        {
            this.update_attack();
        }
        this.render();

    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);

        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;
    }


    update_attack(){
        for (let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if (player === this.player) continue;
            let dist = player.get_dist(this.x, this.y, player.x, player.y);
            let r = player.radius;

            if (dist <= r + this.radius){
                let angle = Math.atan2(player.y - this.y, player.x - this.x);
                if (this.playground.mode === 'multi mode'){
                    this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
                }

                this.destroy();
                player.is_attack(angle, this.damage);
                return false;
            };
        };
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


    on_destroy(){
        let fireballs = this.player.fireballs;
        for (let i = 0; i< fireballs.length; i++){
            if (fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
