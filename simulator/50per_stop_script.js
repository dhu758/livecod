(function() {
    let clicked_btn = false; // 버튼 중복 클릭 방지

    const recoverTime = 8; // 감염 후 완치까지 걸리는 시간(초)
    const totalCount = 200; // 전체 사람 수
    const stop_ratio = 0.5; // 멈춰있는 비율
    const stopCount = totalCount * stop_ratio; // 멈춘 사람 수
    const moveCount = totalCount - stopCount; // 움직이는 사람 수
    const speed = 1; // 움직이는 속도
    const radius = 5; //반지름

    const healthy_color = '#b3bccb';
    const sick_color = '#dd002f';
    const recovered_color = 'blue';

    let healthyCount = 0; //건강한 사람 수
    let sickCount = 0; //감염자 수
    let recoveredCount = 0; //완치자 수

    const healthyBar = document.querySelector('.healthy .bar');
    const sickBar = document.querySelector('.sick .bar');
    const recoveredBar = document.querySelector('.recovered .bar');

    const healthyLabelCount = document.querySelector('.healthy .count');
    const sickLabelCount = document.querySelector('.sick .count');
    const recoveredLabelCount = document.querySelector('.recovered .count');

    const simulationBtn_50 = document.querySelector('.simulation-btn-50');

    const canvasContainer = document.querySelector('.canvas-container');

    const canvas = document.querySelector('.canvas');
    const context = canvas.getContext('2d');
    // 그래프 그릴 캔버스
    const canvas2 = document.querySelector('.graph-canvas');
    const context2 = canvas2.getContext('2d');

    const circleAngle = Math.PI * 2;

    let move_balls = []; //움직이는 공들
    let stop_balls = []; //멈춰있는 공들
    let all_balls = []; //전체 공들

    let rafId;
    let stop;

    class Ball {
        constructor(info) {
            this.x = info.x;
            this.y = info.y;
            this.nextX = this.x;
            this.nextY = this.y;
            this.angle = info.angle;
            this.color = info.color;
            this.draw();
        }

        infected() {
            const self = this;
            this.color = '#dd002f';
            setTimeout(function() {
                self.recover();
            }, recoverTime * 1000);
        }

        recover() {
            this.color = '#1f71ff';
        }

        draw() {
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, radius, 0, circleAngle, false);
            context.closePath();
            context.fill();
        }
    }

    function toRadian(d) {
        return d * Math.PI / 180;
    }

    function toDegree(r) {
        return r * 180 / Math.PI;
    }

    function hitTest(ball1, ball2) {
        let value;
        const dx = ball1.nextX - ball2.nextX;
        const dy = ball1.nextY - ball2.nextY;
        const dist = dx * dx + dy * dy;
        if (dist <= radius * 2 * (radius * 2)) {
            value = true;
        }
        return value;
    }

    function checkCollision() {
        let ball;
        let testBall;

        for (let i = 0; i < all_balls.length; i++) {
            ball = all_balls[i];
            for (let j = i + 1; j < all_balls.length; j++) {
                testBall=all_balls[j];
                if (hitTest(ball, testBall)) {
                    if (ball.color === '#dd002f' && testBall.color === '#b3bccb') {
                        testBall.infected();
                    }
                    if (testBall.color === '#dd002f' && ball.color === '#b3bccb') {
                        ball.infected();
                    }
                    const angle1 = ball.angle;
                    const angle2 = testBall.angle;
                    ball.angle = angle2;
                    testBall.angle = angle1;
                }
            }
        }
    }

    function checkCount() {
        let ball;
        let healthyCount = 0;
        let sickCount = 0;
        let recoveredCount = 0;

        for (let i = 0; i < totalCount; i++) {
            ball = all_balls[i];
            switch (ball.color) {
                case '#b3bccb':
                    healthyCount++;
                    break;
                case '#dd002f':
                    sickCount++;
                    break;
                case '#1f71ff':
                    recoveredCount++;
                    break;
            }
        }

        healthyLabelCount.innerHTML = healthyCount;
        sickLabelCount.innerHTML = sickCount;
        recoveredLabelCount.innerHTML = recoveredCount;

        healthyBar.style.width = `${healthyCount / totalCount * 100}%`;
  			sickBar.style.width = `${sickCount / totalCount * 100}%`;
  			recoveredBar.style.width = `${recoveredCount / totalCount * 100}%`;

        drawGraph(recoveredCount, healthyCount, sickCount);

        if (sickCount === 0) {
            stop = true;
        }
    }

    let graphX = 0;
    function drawGraph(recoveredCount, healthyCount, sickCount) {
        let recoveredHeight = recoveredCount / totalCount * canvas2.height;
        let healthyHeight = healthyCount / totalCount * canvas2.height;
        let sickHeight = sickCount / totalCount * canvas2.height;

        context2.fillStyle = '#1f71ff'; //완치
        context2.fillRect(graphX, 0, 1, recoveredHeight);
        context2.fillStyle = '#b3bccb'; //건강
        context2.fillRect(graphX, recoveredHeight, 1, healthyHeight);
        context2.fillStyle = '#dd002f'; //감염
        context2.fillRect(graphX, recoveredHeight + healthyHeight, 1, sickHeight);
        graphX++;
    }

    function stop_canLocate(ball) {
        let value = true;
        for (let i = 0; i < stop_balls.length; i++) {
            if (hitTest(ball, stop_balls[i])) {
                value = false;
            }
        }
        return value;
    }

    function move_canLocate(ball) {
        let value = true;
        for (let i = 0; i < move_balls.length; i++) {
            if (hitTest(ball, move_balls[i])) {
                value = false;
            }
        }
        return value;
    }

    function init() {

      if (simul_click == false) {
          cancelAnimationFrame(rafId);
          canvasContainer.classList.add('stop');
          simul_click == true;
      }
      simul_click == false;


        all_balls = [];
        stop_balls = [];
        move_balls = [];

        stop = false;
        canvasContainer.classList.remove('stop');
        context2.clearRect(0, 0, canvas2.width, canvas2.height);
        graphX = 0;

        let stop_ball;
        let move_ball;
        // stop_balls[] 만들기
        for (let i = 0; i < stopCount; i++) {
            let stop_positionOK = false;
            while (!stop_positionOK) {
                stop_ball = new Ball({
                    x: radius * 2 + Math.floor(Math.random() * (canvas.width - radius * 3)),
                    y: radius * 2 + Math.floor(Math.random() * (canvas.height - radius * 3)),
                    angle: Math.round(Math.random() * 360),
                    color: '#b3bccb'
                });
                stop_positionOK = stop_canLocate(stop_ball);
            }
            stop_balls.push(stop_ball);
            all_balls.push(stop_ball);
        }
        // move_balls[] 만들기
        for (let i = 0; i < moveCount; i++) {
            let move_positionOK = false;
            while (!move_positionOK) {
                move_ball = new Ball({
                    x: radius * 2 + Math.floor(Math.random() * (canvas.width - radius * 3)),
                    y: radius * 2 + Math.floor(Math.random() * (canvas.height - radius * 3)),
                    angle: Math.round(Math.random() * 360),
                    color: '#b3bccb'
                });
                move_positionOK = move_canLocate(move_ball);
            }
            move_balls.push(move_ball);
            all_balls.push(move_ball);
        }
        all_balls[Math.floor(Math.random() * totalCount)].infected();

        loop();
    }

    function loop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        let move_ball;
        let stop_ball;
        for (let i = 0; i < moveCount; i++) {
            move_ball = move_balls[i];

            if (move_ball.x > canvas.width - radius || move_ball.x < radius) {
                move_ball.angle = 180 - move_ball.angle;
            } else if (move_ball.y > canvas.height - radius || move_ball.y < radius) {
                move_ball.angle = 360 - move_ball.angle;
            }

            move_ball.x += Math.cos(toRadian(move_ball.angle)) * speed;
            move_ball.y += Math.sin(toRadian(move_ball.angle)) * speed;
            move_balls[i].draw();

            move_ball.nextX = move_ball.x + Math.cos(toRadian(move_ball.angle)) * speed;
            move_ball.nextY = move_ball.y + Math.sin(toRadian(move_ball.angle)) * speed;
        }
        for(let j=0; j<stopCount; j++) {
            stop_ball = stop_balls[j];
            stop_balls[j].draw();
        }

        checkCollision();
        checkCount();

        rafId = requestAnimationFrame(loop);

        if (stop) {
            cancelAnimationFrame(rafId);
            canvasContainer.classList.add('stop');
            clicked_btn = false;
        }
    }

    function chk_btn_click(){
        if(clicked_btn == true){
            return;
        }
        else{
            clicked_btn = true;
            init();
        }
    }

    simulationBtn_50.addEventListener('click', chk_btn_click);
})();
