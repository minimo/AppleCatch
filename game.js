/*

	applecatch.js
	2011/05/04

*/

window.focus();
window.addEventListener('mousedown', () => {
    window.focus();
    console.log("window.focus");
})
enchant();

window.onload = function() {
	var game = new Game( 320, 320 );
	game.fps = 30;
	game.preload( 'chara1.gif', 'icon0.gif', 'effect.gif', 'map2.gif', 'font.png' );
	game.onload = function () {
		//ステージ準備
        stage = new CanvasGroup();
		game.rootScene.addChild( stage );
		game.rootScene.backgroundColor = "#ccccff";

		//背景
		var blocks = [
        	[ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
		];
		var map = new Map( 16, 16 );
		map.image = game.assets['map2.gif'];
		map.loadData( blocks );
		map.y = 70;
		stage.addChild( map );
		stage.under = 245;

/*
		//パッド準備
		var pad = new APad();
		pad.x = 0;
		pad.y = 220;
		game.rootScene.addChild( pad );
*/

		//スコア表示
		var gameLevel = 1;	//難易度
		var level = 1;		//表示上のレベル
		var level2 = 1;		//累積レベル
		var score = 0;
		var scoreLabel = new Label( "LEVEL:" + level + " SCORE:" + score );
		game.rootScene.addChild( scoreLabel );
		scoreLabel.x = 5;
		scoreLabel.y = 5;
		scoreLabel.color = "#000000";
		scoreLabel.font = "bold";

		var debugLabel = new Label( " " );
		game.rootScene.addChild( debugLabel );
		debugLabel.color = "#000000";
		debugLabel.font = "bold";
		debugLabel.x = 160;
		debugLabel.y = 5;

		//ライフ表示
		var maxLife = 5;
		var life = 3;
		var dropLife = false;
		var lifeDisp = Array( maxLife );
		for( i = 0; i < maxLife; i++ ){
			lifeDisp[i] = new Sprite( 16, 16 );
			lifeDisp[i].image = game.assets['icon0.gif'];
			lifeDisp[i].frame = 10;
			lifeDisp[i].x = i * 16 + 5;
			lifeDisp[i].y = 16;
			if( life - 1 < i )lifeDisp[i].visible = false;
			game.rootScene.addChild( lifeDisp[i] );
		}

		//プレイヤキャラクタ
		var player = new Sprite( 32, 32 );
		player.image = game.assets['chara1.gif'];
		player.x = 160;
		player.y = stage.under - 32;
		player.yPrev = player.y;
		player.vx = 0;	//速度
		player.ax = 0;	//加速度
		player.jump = false;
		player.F = 0;
		player.penalty = 0;	//強制停止フレーム数
		player.muteki = 0;	//無敵中フレーム数
		player.bonus = 0;	//得点倍フレーム数
		player.combo = 0;	//コンボ数

		player.addEventListener( 'enterframe', function (){
			//キー操作
			if( this.penalty == 0 ){
				//ジャンプ
				if( game.input.up && !this.jump ){
					this.jump = true;
					this.yPrev = this.y;
					this.F = 10;
				}
				if( game.input.left ){
					this.ax = -3;
					this.direction = -1;
					this.scaleX = -1;
				}else if( game.input.right ){
					this.ax = 3;
					this.direction = 1;
					this.scaleX = 1;
				}else{
					this.ax = 0;
				}
				if( this.muteki > 0 ){
					this.muteki -= 1;
					if( this.muteki % 2 == 0 )
						this.visible = true;
					else
						this.visible = false;
				}
				if( game.frame % 3 == 0 ){
					if( this.vx == 0 ){
						this.frame = 0;
					}else{
						this.frame++;
						this.frame %= 3;
					}
				}
				if( this.bonus > 0 )this.bonus--;
			}else{
				this.vx = 0;
				this.ax = 0;
				this.penalty -= 1;
				if( this.penalty == 0 ){
					this.frame = 0;
				}else{
					this.frame = 3;
				}
			}

			//並行移動処理
			this.vx += this.ax;
			if( this.vx > 8 )this.vx = 8;
			if( this.vx < -8 )this.vx = -8;

			var px = this.vx;
			if( px > 4 )px = 4;
			if( px < -4 )px = -4;
			this.x += px;
			if( this.vx > 0 )this.vx -= 1;
			if( this.vx < 0 )this.vx += 1;

			//ジャンプ処理
			if( this.jump ){
				var yTemp = this.y;
				this.y -= ( this.yPrev - this.y ) + this.F;
				this.F = -1;
				this.yPrev = yTemp;
				if( this.y > stage.under - 32 ) {
					this.jump = false;
					this.y = stage.under - 32;
				}
			}

			//画面端チェック
			if( this.x < 0 ){
				this.x = 0;
				this.vx = 0;
			}
			var rightEnd = game.width - this.width;
			if( this.x > rightEnd ){
				this.x = rightEnd;
				this.vx = 0;
			}
		});
        stage.addChild(player);

		//当たり判定
		var hittest = function( target ){
			if( player.within( target, 20 ) ){
				if( player.penalty == 0 ){
					//爆弾
					if( target.name == "bomb" && player.muteki == 0 ){
						player.penalty = 15;	//ペナルティフレーム数
						player.muteki = game.fps * 3;
						stage.removeChild( target );
						lifeDisp[life - 1].visible = false;
						life--;
					}
					//熊
					if( target.name == "bear" && player.muteki == 0 ){
						player.penalty = 15;	//ペナルティフレーム数
						player.muteki = game.fps * 3;
						lifeDisp[life - 1].visible = false;
						life--;
					}
					//星
					if( target.name == "star" ){
						player.muteki = game.fps * 10;
						player.bonus = game.fps * 10;
					}
					//得点アイテム
					if( target.point > 0 ){
						var text = "" + target.point;
						//ボーナスタイム中
						if( player.bonus > 0 ){
							target.point *= 2;
							text = text + "*2"
						}
						//ライフ取った
						if( target.name == "life" ){
							if( life < maxLife ){
								life++;
								lifeDisp[life - 1].visible = true;
								text = "1UP!";
							}
						}
						stage.removeChild( target );

						//コンボ処理
						player.combo++;
//						debugLabel.text = "combo:"+player.combo;
						if( player.combo == 5 || player.combo % 10 == 0 ){
							score +=  player.combo * 10;
							var cb1 = new MutableText( player.x, player.y - 32, 300, player.combo + "COMBO!" );
							cb1.count = 20;
							cb1.addEventListener( 'enterframe', function() {
								this.y -= 1;
								this.count--;
								this.opacity -= 0.05;
								if( this.count == 0 )stage.removeChild( this );
							});
							var cb2 = new MutableText( player.x, player.y - 16, 160,  "+" + player.combo * 10 + "pts" );
							cb2.count = 20;
							cb2.addEventListener( 'enterframe', function() {
								this.y -= 1;
								this.count--;
								this.opacity -= 0.05;
								if( this.count == 0 )stage.removeChild( this );
							});
							stage.addChild( cb1 );
							stage.addChild( cb2 );
						}else{
							//取得ポイント表示
							var pt = new Text( target.x, player.y - 8, text );
							pt.count = 10;
							pt.addEventListener( 'enterframe', function() {
								this.y--;
								this.count--;
								this.opacity -= 0.1;
								if( this.count == 0 )stage.removeChild( this );
							});
							stage.addChild( pt );
						}
					}

					score += target.point;
					if( score < 0 )score = 0;
					if( score >= level2 * 500 ){
						gameLevel++;
						level++;
						level2++;
						if( level2 % 4 == 0 )dropLife = true;
						if( level > 10 ){
							level = 10;
						}
						if( gameLevel == 10 ){
							gameLevel = 1;	//一回難易度を落とす
						}
					}
					scoreLabel.text = "LEVEL:" + level + " SCORE:" + score;
				}
			}
		}

		//画面上部の熊
		var bear = new Sprite( 32, 32 );
		bear.image = game.assets['chara1.gif'];
		bear.x = 0;
		bear.y = 38;
		bear.frame = 4;
		bear.ax = 1;
		bear.speed = 4;
		bear.turned = true;
		bear.addEventListener( 'enterframe', function() {
			this.x += this.ax * this.speed;
			//１００分の１の確率でターン
			if( !this.turned && Math.floor( Math.random() * 100 ) == 1 ){
				this.ax *= -1;
				this.scaleX *= -1;
				bear.turned = true;
			}
			if( this.x < 0 ){
				this.x = -this.x;
				this.ax *= -1;
				this.scaleX *= -1;
				bear.turned = false;
			}
			var rightEnd = game.width - this.width;
			if( this.x > rightEnd ){
				this.x = rightEnd * 2 - this.x;
				this.ax *= -1;
				this.scaleX *= -1;
				bear.turned = false;
			}
			if( game.frame % ( 20 - Math.floor( gameLevel ) ) == 0 ){
				//アイテムを落とす
				fruit = new Sprite( 16, 16 );
				fruit.image = game.assets['icon0.gif'];

				fruit.x = this.x + 8;
				fruit.y = 16;
				fruit.vx = -this.ax;
				fruit.yPrev = fruit.y;
				fruit.F = 3;
				fruit.bound = 1;	//接地後のバウンド回数
				fruit.power = 5;	//バウンド係数
				fruit.dropped = false;

				fruit.name = "apple"
				fruit.frame = 15;
				fruit.point = 10;

				var dice = Math.floor( Math.random() * 20 );

				//バナナ
				if( dice == 1 || level > 4 && dice == 4 ){
					fruit.name = "banana"
					fruit.frame = 16;
					fruit.point = 20;
				}
				//ぶどう
				if( dice == 2 || level > 5 && dice == 5 ){
					fruit.name = "grape"
					fruit.frame = 17;
					fruit.point = 30;
				}
				//メロン
				if( dice == 3 || level > 6 && dice == 6 ){
					fruit.name = "melon"
					fruit.frame = 18;
					fruit.point = 50;
				}
				//爆弾
				if( dice > 20 - gameLevel ){
					fruit.name = "bomb"
					fruit.frame = 24;
					fruit.point = 0;
					fruit.bound = 0;
				}

				//１０００分の１でライフを落とす
				dice = Math.floor( Math.random() * 1000 );
				if( dice == 500 || dropLife ){
					fruit.name = "life"
					fruit.frame = 10;
					fruit.point = 50;
					fruit.bound = 3;
					fruit.power = 6;
					dropLife = false;
				}
				//１０００分の１でスターを落とす
				if( dice == 800 ){
					fruit.name = "star"
					fruit.frame = 30;
					fruit.point = 100;
					fruit.bound = 3;
					fruit.power = 10;
				}

				stage.addChild( fruit );
				fruit.addEventListener( 'enterframe', function(){
					hittest( this );

					var yTemp = this.y;
					var yTemp2 = ( this.yPrev - this.y ) + this.F;
					this.y -= yTemp2;
					this.F = -1;
					this.yPrev = yTemp;
					this.x += this.vx;

					//指定回数バウンドさせる
					if( this.y > stage.under - 16 && this.bound > 0  ){
						this.y = stage.under - 16;
						this.yPrev = this.y;
						this.F = this.power;
						this.power *= 0.7;
						this.bound--;
					}

					//取り逃し確定の為、コンボカウンタリセット
					if( this.point > 0 && this.y > stage.under + 16 && !this.dropped ){
						player.combo = 0;
						this.dropped = true;
//						debugLabel.text = "combo:"+player.combo;
					}
					//画面外に出た
					if( this.y > game.height ){
						stage.removeChild( this );
					}

					//爆弾爆発
					if( this.y > stage.under - 16 && this.name == "bomb" && this.bound == 0 ){
						this.y = stage.under - 16;
						var explode = new Sprite( 16, 16 );
						explode.image = game.assets['effect.gif'];
						explode.name = "bomb"
						explode.frame = 0;
						explode.point = 0;
						explode.x = this.x;
						explode.y = this.y;
						explode.count = 0;
						stage.addChild( explode );
						explode.addEventListener( 'enterframe', function(){
							explode.count++;
							hittest( this );
							if( explode.count % 2 == 0 )explode.frame++;
							if( explode.frame == 4 )stage.removeChild( this );
						});
						stage.removeChild( this );
					}
				});
			}
		});
		stage.addChild( bear );

		var firstBear = true;
		var numBear = 0;
		//ステージ進行
		stage.addEventListener( 'enterframe', function() {
			//ライフチェック
			if( life == 0 ){
				var msg = "SCORE：" + score;
				game.end( score, msg );
			}
			//スケボーくま
			var dice = Math.floor( Math.random() * 300 );
			if( game.frame > 100 && game.frame % (game.fps * 8 + 1) == 0 || gameLevel > 5 && dice == 50 && numBear < stageLevel ){
				numBear++;
				dir = Math.floor( Math.random() * 2 );	//0=左から 1=右から

				//出現予告
				var warn = new Sprite( 16, 16 );
				warn.image = game.assets['font.png'];
				warn.frame = 1;
				if( dir == 0 ){
					warn.x = 0;
				}else{
					warn.x = game.width - 24;
				}
				warn.y = stage.under - 24;
				warn.count = 0;
				warn.max = Math.floor( Math.random() * 30 ) + 30;
				if( level > 5 )warn.max = 10;
				warn.addEventListener( 'enterframe', function() {
					this.count++;
					if( this.count % 10 == 0 ){
						if( this.visible )this.visible = false;
						else this.visible = true;
					}
					if( this.count > this.max ){
						var bear2 = new Sprite( 32, 32 );
						bear2.image = game.assets['chara1.gif'];
						bear2.name = "bear"
						bear2.x = -32;
						bear2.y = stage.under - 32;
						bear2.frame = 4;
						bear2.point = 0;
						if( firstBear ){
							bear2.ax = 3;	//初回は遅く
							firstBear = false;
						}else{
							bear2.ax = 3 + Math.floor( Math.random() * level );
						}
						if( dir == 1 ){
							bear2.x = game.width + 32;
							bear2.ax *= -1;
							bear2.scaleX = -1;
						}
						bear2.addEventListener( 'enterframe', function() {
							this.x += this.ax;
							hittest( this );
							if( this.x < -32 || this.x > game.width + 32 ){
								stage.removeChild( this );
								numBear--;
							}
						});
						stage.addChild( bear2 );
						stage.removeChild( this );
					}
				});
				this.addChild( warn );
			}
		});

		//操作系
		var beforelocalY;
		game.rootScene.addEventListener('touchstart', function(e) {
			beforeLocalY = e.localY;
			game.input.left = false;
			game.input.right = false;
			if( e.localX < player.x )game.input.left = true;
			if( e.localX > player.x )game.input.right = true;
		});
		game.rootScene.addEventListener('touchmove', function(e) {
			game.input.left = false;
			game.input.right = false;
			if( e.localX < player.x )game.input.left = true;
			if( e.localX > player.x )game.input.right = true;
			var moveY = beforelocalY - e.localY;
			if( moveY > 8 )
				game.input.up = true;
			else
				game.input.up = false;
			beforelocalY = e.localY;
		});
		game.rootScene.addEventListener('touchend', function(e) {
			game.input.left = false;
			game.input.right = false;
			game.input.up = false;
		});
	};

	game.start();
};
