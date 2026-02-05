"use client";

import { useEffect, useRef } from "react";

const GameCanvas = () => {
  const canvasRef = useRef(null);

  const gameRef = useRef({
    state: "START",
    score: 0,
    gravity: 0.6,
    speed: 6,
    obstacles: [],
    nextObstacleTime: 0,
  });

  const playerRef = useRef({
    x: 100,
    y: 200,
    width: 30,
    height: 30,
    dy: 0,
    color: "#00ffcc",
    onGround: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const getBoundaries = () => ({
      top: 50,
      bottom: canvas.height - 50,
    });

    const resetGame = () => {
      playerRef.current.y = canvas.height / 2;
      playerRef.current.dy = 0;
      gameRef.current.score = 0;
      gameRef.current.speed = 6;
      gameRef.current.state = "PLAYING";
      gameRef.current.obstacles = [];
      gameRef.current.nextObstacleTime = 0;
    };

    const spawnObstacle = () => {
      const { width } = canvas;
      const { top, bottom } = getBoundaries();
      const type = Math.random() > 0.5 ? "floor" : "ceiling";

      const obstacle = {
        x: width,
        y: type === "floor" ? bottom - 50 : top,
        width: 30,
        height: 50,
        type: type,
        passed: false,
      };

      gameRef.current.obstacles.push(obstacle);
    };

    const checkCollision = (player, obstacle) => {
      const hitBoxX = player.x + 5;
      const hitBoxY = player.y + 5;
      const hitBoxW = player.width - 10;
      const hitBoxH = player.height - 10;

      return (
        hitBoxX < obstacle.x + obstacle.width &&
        hitBoxX + hitBoxW > obstacle.x &&
        hitBoxY < obstacle.y + obstacle.height &&
        hitBoxY + hitBoxH > obstacle.y
      );
    };

    // --- FUNÇÃO DE DESENHO (VERSÃO FINAL: ESPINHOS) ---
    const drawScene = (boundaries) => {
      // 1. Linhas do Chão e Teto
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      // Teto
      ctx.beginPath();
      ctx.moveTo(0, boundaries.top);
      ctx.lineTo(canvas.width, boundaries.top);
      ctx.stroke();

      // Chão
      ctx.beginPath();
      ctx.moveTo(0, boundaries.bottom);
      ctx.lineTo(canvas.width, boundaries.bottom);
      ctx.stroke();

      // 2. Obstáculos (Espinhos)
      if (gameRef.current.obstacles.length > 0) {
        gameRef.current.obstacles.forEach((obs) => {
          ctx.fillStyle = "#ff4d4d"; // Vermelho Perigo
          ctx.beginPath(); // Começa o desenho do triângulo

          if (obs.type === "floor") {
            // Espinho de Chão (Aponta pra cima)
            // Base Esquerda
            ctx.moveTo(obs.x, obs.y + obs.height);
            // Ponta (Topo)
            ctx.lineTo(obs.x + obs.width / 2, obs.y);
            // Base Direita
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          } else {
            // Espinho de Teto (Aponta pra baixo)
            // Base Esquerda
            ctx.moveTo(obs.x, obs.y);
            // Ponta (Baixo)
            ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
            // Base Direita
            ctx.lineTo(obs.x + obs.width, obs.y);
          }

          ctx.closePath(); // Fecha a forma geometricamente
          ctx.fill(); // Preenche de vermelho
        });
      }
    };

    const render = () => {
      const game = gameRef.current;
      const player = playerRef.current;
      const boundaries = getBoundaries();

      // Limpa tudo
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fundo Preto
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (game.state === "START") {
        drawScene(boundaries);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillText("GRAVITY FLIP", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "16px Arial";
        ctx.fillText(
          "Espaço ou Clique para começar",
          canvas.width / 2,
          canvas.height / 2 + 20,
        );
      } else if (game.state === "PLAYING") {
        player.dy += game.gravity;
        player.y += player.dy;

        if (player.y + player.height > boundaries.bottom) {
          player.y = boundaries.bottom - player.height;
          player.dy = 0;
        } else if (player.y < boundaries.top) {
          player.y = boundaries.top;
          player.dy = 0;
        }

        game.nextObstacleTime--;
        if (game.nextObstacleTime <= 0) {
          spawnObstacle();
          game.nextObstacleTime = Math.random() * 60 + 60;
        }

        game.obstacles.forEach((obs, index) => {
          obs.x -= game.speed;

          if (checkCollision(player, obs)) {
            game.state = "GAME_OVER";
          }
          if (obs.x + obs.width < 0) {
            game.obstacles.splice(index, 1);
          }
        });

        drawScene(boundaries);

        // Player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Score
        game.score++;
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${Math.floor(game.score / 10)}`, 20, 40);
      } else if (game.state === "GAME_OVER") {
        drawScene(boundaries);

        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(
          "Clique para tentar de novo",
          canvas.width / 2,
          canvas.height / 2 + 50,
        );
        ctx.fillText(
          `Score Final: ${Math.floor(game.score / 10)}`,
          canvas.width / 2,
          canvas.height / 2 + 80,
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleInput = (e) => {
      if (e.code === "Space") e.preventDefault();
      const { state } = gameRef.current;

      if (state === "START" || state === "GAME_OVER") {
        resetGame();
      } else if (state === "PLAYING") {
        gameRef.current.gravity *= -1;
      }
    };

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") handleInput(e);
    });
    window.addEventListener("touchstart", handleInput);
    window.addEventListener("mousedown", handleInput);

    render();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("keydown", handleInput);
      window.removeEventListener("touchstart", handleInput);
      window.removeEventListener("mousedown", handleInput);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

export default GameCanvas;
