class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, character, username, photo){
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.ctx = this.playground.gamemap.ctx;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.eps = 0.01;

        this.move_length = 0;

        this.cur_skill = null;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.spent_time = 0;
        this.count_down = 3000;
        this.shoot = false;


        if (this.character !== 'robot') {
            this.img = new Image();
            this.img.src = this.photo;

        }


    }

    start(){
        if (this.character === 'me'){
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }

    }

    add_listening_events(){
        let outer = this;
        this.playground.gamemap.$canvas.on("contextmenu", function(){return false;});

        this.playground.gamemap.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3){
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            } else if (e.which === 1){
                if (outer.cur_skill === 'fireball'){
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) {
                outer.cur_skill = 'fireball';
                return false;
            }
        });
    }

    is_attack(angle, damage){
        // 粒子效果
        for (let i = 0; i < 10 + Math.random() * 20; i ++){
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;

            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps){
            this.destroy();
            return false;
        }

        // 眩晕效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;


    }

    shoot_fireball(tx, ty){
        if (this.shoot){
            return false;
        }

        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = 'orange';
        let speed = 0.5;
        let move_length = 1.0;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.shoot = true;
    }

    get_dist(x1, y1, x2, y2){
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);

    }
    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);

    }

    update(){
        if (this.shoot){
            this.count_down -= this.timedelta;
            if (this.count_down <= 0){
                this.shoot = false;
                this.count_down = 3000;
            }
        }
        this.spent_time += this.timedelta;

        this.update_move();

        this.render();
    }

    update_move() {
        // 更新玩家移动
        if (this.character === 'robot' && Math.random() < (1 / 180.0) && this.spent_time > 5000){
            let index = Math.floor(Math.random() * this.playground.players.length);
            let player = this.playground.players[index];
            this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {

            if (this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === 'robot'){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }            
        
    }

    render(){
        let scale = this.playground.scale;

        if (this.character !== 'robot'){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        } else {

            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

}
