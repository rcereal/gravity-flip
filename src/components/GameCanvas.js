"use client";

import { useEffect, useRef } from "react";

const GameCanvas = () => {
  const canvasRef = useRef(null);

  // ESTADO DO JOGO (usando useRef para performance no loop)
  const gameRef = useRef({
    state: "START", // Pode ser: START, PLAYING, GAME_OVER
    score: 0,
    gravity: 0.6,
    speed: 5,
  });

  // ESTADO DO PLAYER
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

    // Ajusta o canvas para o tamanho da tela
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Função para reiniciar o jogo
    const resetGame = () => {
      playerRef.current.y = canvas.height / 2;
      playerRef.current.dy = 0;
      gameRef.current.score = 0;
      gameRef.current.state = "PLAYING";
    };

    // --- O GAME LOOP (Roda 60x por segundo) ---
    const render = () => {
      const { state } = gameRef.current;
      const player = playerRef.current;

      // 1. Limpar a tela
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Fundo
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state === "START") {
        // TELA DE MENU
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GRAVITY FLIP", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText(
          "Pressione Espaço ou Toque para Jogar",
          canvas.width / 2,
          canvas.height / 2 + 20,
        );
      } else if (state === "PLAYING") {
        // LÓGICA DO JOGO

        // Aplicar Gravidade
        player.dy += gameRef.current.gravity;
        player.y += player.dy;

        // Colisão com Chão e Teto (Simples)
        if (player.y + player.height > canvas.height) {
          player.y = canvas.height - player.height;
          player.dy = 0;
          player.onGround = true;
        } else if (player.y < 0) {
          player.y = 0;
          player.dy = 0;
          player.onGround = true;
        }

        // Desenhar Player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Score (Falso por enquanto)
        gameRef.current.score++;
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(
          `Score: ${Math.floor(gameRef.current.score / 10)}`,
          20,
          40,
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // --- CONTROLES ---
    const handleInput = (e) => {
      if (e.code === "Space") e.preventDefault(); // Não rolar a tela

      const { state } = gameRef.current;

      if (state === "START") {
        resetGame();
      } else if (state === "PLAYING") {
        // INVERTER GRAVIDADE!
        gameRef.current.gravity *= -1;
      }
    };

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") handleInput(e);
    });
    window.addEventListener("touchstart", handleInput);
    window.addEventListener("mousedown", handleInput);

    // Iniciar
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
