class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class='ac-game-menu'>
    <div class='ac-game-menu-field'>
        <div class='ac-game-menu-field-item ac-game-menu-field-item-single-mode'>
            单人模式
        </div>
        <div class='ac-game-menu-field-item ac-game-menu-field-item-multi-mode'>
            多人模式
        </div>
        <div class='ac-game-menu-field-item ac-game-menu-field-item-settings'>
            退出
        </div>
    </div>
</div>
            `);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }


}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_valled_start = false; //是否执行过start
        this.timedelta = 0; //当前帧距离上一帧的时间间隔

    }

    start() {
    }
    

    update() {
    }

    
    on_destroy() {

    }


    destroy() {
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++){
            if (AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }

        }
    }

}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    
    for (let i=0; i< AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

    }

    start(){
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.gamemap.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start(){
    }

    update(){
        if (this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
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
        this.is_me = is_me;
        this.eps = 0.1;

        this.move_length = 0;

        this.cur_skill = null;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.spent_time = 0;
        this.count_down = 3000;
        this.shoot = false;


        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;



        }


    }

    start(){
        if (this.is_me){
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }

    }

    add_listening_events(){
        let outer = this;
        this.playground.gamemap.$canvas.on("contextmenu", function(){return false;});

        this.playground.gamemap.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3){
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1){
                if (outer.cur_skill === 'fireball'){
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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
        if (this.radius < 10){
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
        let radius = this.playground.height*0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = 'orange';
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1.0;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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

        if (!this.is_me && Math.random() < (1 / 180.0) && this.spent_time > 5000){
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
                if (!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }            
        this.render();
    }

    render(){
        if (this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        } else {

            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

}
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
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(
`
<div class="ac-game-playground"></div>
`
        );

        this.start();

    }

    start() {
        this.hide();
    }

    show() {
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.gamemap = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, 'white', this.height * 0.15, true));

        for (let i = 0; i < 5; i ++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.random_color(), this.height * 0.15, false));
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
class Settings {
    constructor(root){
        this.root = root;
        this.platform = 'WEB';
        if (this.root.AcWingOS) this.platform = 'ACAPP';

        console.log(this.platform);
        
        this.$settings = $(`
<div class='ac-game-settings'>
    <div class='ac-game-settings-login'>
        <div class='ac-game-settings-title'>
            登录
        </div>
        <div class='ac-game-settings-username'>
            <div class='ac-game-settings-item'>
                <input type='text' placeholder='用户名' />
            </div>
        </div>
        <div class='ac-game-settings-password'>
            <div class='ac-game-settings-item'>
                <input type='password' placeholder='密码' />
            </div>
        </div>
        <div class='ac-game-settings-submit'>
            <div class='ac-game-settings-item'>
                <button>登录</button>
            </div>
        </div>
        <div class='ac-game-settings-error-message'>
        </div>
        <div class='ac-game-settings-option'>
            注册
        </div>
        <br>
        <div class='ac-game-settings-acwing'>
            <img width='30' src='https://app440.acapp.acwing.com.cn/static/image/settings/acwing_logo.png'/ >
            <br>
            <br>
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>

    <div class='ac-game-settings-register'>
        <div class='ac-game-settings-title'>
            注册
        </div>
        <div class='ac-game-settings-username'>
            <div class='ac-game-settings-item'>
                <input type='text' placeholder='用户名' />
            </div>
        </div>
        <div class='ac-game-settings-password ac-game-settings-password-first'>
            <div class='ac-game-settings-item'>
                <input type='password' placeholder='密码' />
            </div>
        </div>
        <div class='ac-game-settings-password ac-game-settings-password-second'>
            <div class='ac-game-settings-item'>
                <input type='password' placeholder='确认密码' />
            </div>
        </div>
        
        <div class='ac-game-settings-submit'>
            <div class='ac-game-settings-item'>
                <button>注册</button>
            </div>
        </div>
        <div class='ac-game-settings-error-message'>
        </div>
        <div class='ac-game-settings-option'>
            登录
        </div>
        <br>
        <div class='ac-game-settings-acwing'>
            <img width='30' src='https://app440.acapp.acwing.com.cn/static/image/settings/acwing_logo.png'/ >
            <br>
            <br>
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>

    </div>
</div>
        `);

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img');


        this.root.$ac_game.append(this.$settings);
        this.start();

    }

    start(){
        // 获取用户信息
        if (this.platform === 'ACAPP'){
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events(){
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(this.acwing_login);
    }
    
    acwing_login(){
        $.ajax({
            url: 'https://app440.acapp.acwing.com.cn/settings/acwing/web/apply_code/',
            type: 'GET',
            success: function(resp){
                if (resp.result === 'success'){
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });

        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });

        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote(){
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        let outer = this;

        $.ajax({
            url: "https://app440.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password
            },
            success: function(resp){
                if (resp.result === 'success'){
                    // 刷新当前页面
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }

    register_on_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();
            
        $.ajax({
            url: 'https://app440.acapp.acwing.com.cn/settings/register/',
            type: 'GET',
            data:{
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success: function(resp){
                if (resp.result === 'success'){
                    location.reload();
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }

        })
    }

    logout_on_remote(){
        if (this.platform === 'ACAPP') return false;

        let outer = this;

        $.ajax({
            url: 'https://app440.acapp.acwing.com.cn/settings/logout/',
            type: 'GET',
            success: function(resp){
                location.reload();
            }
        })
    }

    
    register() {
        // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }

    login() {
        // 打开登录页面
        this.$register.hide();
        this.$login.show();
    }


    getinfo_web(){
        let outer = this;

        $.ajax({
            url: "https://app440.acapp.acwing.com.cn/settings/getinfo/",
            type : "GET",
            data: {
                platform: outer.platform, 
            },
            success: function(resp) {
                if (resp.result === 'success'){
                    outer.hide();
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }
    
    acapp_login(appid, redirect_uri, scope, state){
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            if (resp.result === 'success'){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp(){
        let outer = this;

        console.log('acapp getinfo');

        $.ajax({
            url: 'https://app440.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/',
            type: 'GET',
            success: function(resp){
                if (resp.result === 'success'){
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        })
    }

    hide() {
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }

}
export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        
        this.AcWingOS = AcWingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }

}
