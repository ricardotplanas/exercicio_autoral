// Definindo a cena principal do jogo usando a biblioteca Phaser
class FlappyShark extends Phaser.Scene {

    // Construtor da cena
    constructor() {
        super({
            key: 'FlappyShark',
            // Adiciona a física do jogo
             physics: {
               arcade: {
                debug: false,
                gravity: { y: 10 }
               } 
            } 
               });
    }

    // Inicialização de variáveis e configurações da cena
    init() {
        // 1) FUNDO
        this.bg = {
            x_start: 0,
            x: 0,
            y: 50,
            x_end: -800,
            obj: null
        };

        // 2) COLUNA

        this.cols = {
            speed: 200, // velocidade com que as algas passam
            space: 150, // vão entre as colunas por onde o tubarão tem que passar
            x: 500, // posição inicial à direita do canvas
            min_x: 400,
            max_x: 800,
            y: -500, // posição inicial acima do canvas
            min_y: -500,
            max_y: -200,
            height: 600, // altura da imagem da alga
            width: 50,
            col1_obj: null,
            col2_obj: null
        };

        // 3) JOGADOR
        this.player = {
            width: 128,
            height: 128,
            obj: null
        };

        // 4) CONTROLES DA RODADA
        this.gameControls = {
            over: false,
            current_col_scored: false,
            score: 0,
            restart: null
        };
    }


    // Pré-carregamento de recursos
    preload() {
        this.load.image('mar', 'assets/img/fundomar.jpg');
        this.load.spritesheet('tubarao', 'assets/img/SpritesheetShark.png', { frameWidth: this.player.width, frameHeight: this.player.height });
        this.load.image('alga1', 'assets/img/alga2.png');
        this.load.image('alga2', 'assets/img/alga.png');
        this.load.image('gameOver', 'assets/img/gameOver.png');
        this.load.image('restartBt', 'assets/img/restartBt.png');
        this.load.image('peixeComum', 'assets/img/peixe_comum.png');
        this.load.image('peixeDourado', 'assets/img/peixe_dourado.png');
    }

    // Criação de elementos e configurações iniciais da cena
    create() {
        // 1)Adiciona o placar ao jogo
        var placar = 0

        // 2) Adiciona a imagem de fundo
        this.bg.obj = this.add.image(this.bg.x, this.bg.y, 'mar').setOrigin(0, 0);

        // 3) Adiciona imagens das colunas
        this.cols.col1_obj = this.add.image(this.cols.x, this.cols.y, 'alga1').setOrigin(0, 0);
        this.cols.col2_obj = this.add.image(this.cols.x, this.cols.y + this.cols.height + this.cols.space, 'alga2').setOrigin(0, 0);
        this.physics.add.existing(this.cols.col1_obj);
        this.physics.add.existing(this.cols.col2_obj);
        this.cols.col1_obj.body.allowGravity = false;
        this.cols.col2_obj.body.allowGravity = false;
        this.cols.col1_obj.body.setVelocityX(-this.cols.speed);
        this.cols.col2_obj.body.setVelocityX(-this.cols.speed);

        // 4) Adiciona jogador e suas propriedades físicas
        this.player.obj = this.physics.add.sprite(170, 130, 'tubarao').setScale(.8);
        this.player.obj.body.setSize(50, 80, true);
        this.player.obj.setCollideWorldBounds(true);

        // 5) Adiciona animação da imagem do jogador
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('tubarao', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // 6) Adiciona o peixe dourado
        var pos_peixe_dourado_x = Phaser.Math.RND.between(100, 350);
        var pos_peixe_dourado_y = Phaser.Math.RND.between(100, 500);
        var peixe_dourado = this.physics.add.staticImage(pos_peixe_dourado_x, pos_peixe_dourado_y, 'peixeDourado');

        // 7) Adiciona o peixe normal
        var pos_peixe_comum_x = Phaser.Math.RND.between(100, 350);
        var pos_peixe_comum_y = Phaser.Math.RND.between(100, 500);
        var peixe_comum = this.physics.add.staticImage(pos_peixe_comum_x, pos_peixe_comum_y, 'peixeComum');

        // 8) Adiciona a interação do tubarão com o peixe dourado
        this.physics.add.collider(peixe_dourado, this.player.obj, function(){
            // o placar ficava contando quando o tubarão estava passando no lugar do primeiro peixe, tive que usar o disableBody para fazer funcionar
            peixe_dourado.disableBody(true,true) 
            var y = Phaser.Math.RND.between(100, 500);
            peixe_dourado.enableBody(true, 310, y, true, true)
            placar += 5
            // incluí um timeout de meio segundo para o peixe aparece 
            setTimeout(function () {
                peixe_dourado.setVisible(true);
            }, 500);    
            console.log(placar) // Não consegui incrementar esse placar dentro do jogo, mas deixei no console.
        })

        // 9) Adiciona a interação do tubarãoo com o peixe comum
        this.physics.add.collider(peixe_comum, this.player.obj, function(){
            peixe_comum.disableBody(true,true)
            var y = Phaser.Math.RND.between(100, 500);
            peixe_comum.enableBody(true, 310, y, true, true)
            placar += 1
            setTimeout(function () {
                peixe_comum.setVisible(true);
            }, 500);
            console.log(placar) // Não consegui incrementar esse placar dentro do jogo, mas deixei no console.
        })

        // 10) Adiciona a animação do movimento do jogador
        this.player.obj.anims.play('fly');

        // 11) Adiciona os cursores que movimentarão o jogador
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;

        // 12) Adiciona os monitores de colisão
        this.physics.add.overlap(this.player.obj, this.cols.col1_obj, this.hitCol, null, this);
        this.physics.add.overlap(this.player.obj, this.cols.col2_obj, this.hitCol, null, this);

       
        // 13) Mostra a quantidade de vezes que o tubarão passa pelas algas
        this.scoreText = this.add.text(15, 15, this.game.name + ': 0', { fontSize: '20px', fill: '#000' });
        this.gameControls.restartBt = this.add.image(this.game.config.width / 2 - 50, this.game.config.height / 4 * 3,
            'restartBt').setScale(.2).setOrigin(0, 0).setInteractive().setVisible(false);

        // 14) Adiciona evento de clique no botão de "reiniciar"
        this.gameControls.restartBt.on('pointerdown', function () {
            // Controla se o jogo acabou e se a tecla que o botão de reiniciar foi acionado
            if (this.gameControls.over) {
                this.gameControls.over = false;
                this.gameControls.score = 0;
                this.cols.x = -this.cols.width - 1;
                this.scene.restart();
            }
        }, this);
    }

    // Atualização lógica do jogo a cada frame
    update() {
        // Controla se o jogo acabou e paraliza a cena (interrompendo a execução de "update")
        if (this.gameControls.over) {
            return;
        }

        // Atualiza a posição da imagem de fundo
        this.bg.x--;
        if (this.bg.x < this.bg.x_end) {
            this.bg.x = this.bg.x_start;
        }
        this.bg.obj.x = this.bg.x;

        // Atualiza posição das algas
        this.cols.x = this.cols.col1_obj.x;
        if (this.cols.x < -this.cols.width) {
            this.cols.x = Phaser.Math.FloatBetween(this.cols.min_x, this.cols.max_x); // sorteia o intervalo antes das próximas colunas
            this.cols.col1_obj.x = this.cols.x;
            this.cols.col2_obj.x = this.cols.x;

            this.cols.y = Phaser.Math.FloatBetween(this.cols.min_y, this.cols.max_y); // sorteia a posição vertical
            this.cols.col1_obj.y = this.cols.y;
            this.cols.col2_obj.y = this.cols.y + this.cols.height + this.cols.space;

            this.gameControls.current_col_scored = false;
        }

        // Inclui controle de movimentação do tubarão
        if (this.cursors.left.isDown)
            this.player.obj.setX(this.player.obj.x - 5);
        else if (this.cursors.right.isDown)
            this.player.obj.setX(this.player.obj.x + 5);
        else if (this.cursors.up.isDown || this.cursors.space.isDown || this.pointer.isDown)
            this.player.obj.setY(this.player.obj.y - this.game.config.physics.arcade.gravity.y);
        else if (this.cursors.down.isDown)
            this.player.obj.setY(this.player.obj.y + this.game.config.physics.arcade.gravity.y);

        // Verifica se o jogador passou pelas colunas
        if (!this.gameControls.current_col_scored) {
            if (this.player.obj.x - this.player.width / 2 > this.cols.x + this.cols.width) {
                this.gameControls.score++;
                this.gameControls.current_col_scored = true;
                this.scoreText.setText(this.game.name + ': ' + this.gameControls.score);
            }
        }
    }

    // Função chamada quando o jogador colide com uma alga
    hitCol(player_obj, col_obj) {
        this.physics.pause();
        this.player.obj.anims.stop('fly');
        this.player.obj.setTint(0xff0000);
        this.gameControls.over = true;
        this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameOver').setScale(.5);
        this.gameControls.restartBt.visible = true;
        
        
    }
}