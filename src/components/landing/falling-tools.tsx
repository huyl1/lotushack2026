"use client";

import { useRef, useState, useEffect } from "react";
import Matter from "matter-js";

interface Tool {
  name: string;
  role: string;
  logo: string;
  url: string;
}

export function FallingTools({ tools }: { tools: Tool[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Trigger on scroll into view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !containerRef.current || !textRef.current || !canvasContainerRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0.6;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: { width, height, background: "transparent", wireframes: false },
    });

    const boundaryOpts = { isStatic: true, render: { fillStyle: "transparent" } };
    const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOpts);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOpts);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOpts);

    const cards = textRef.current.querySelectorAll<HTMLElement>("[data-tool]");
    const cardBodies = [...cards].map((elem) => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: "transparent" },
        restitution: 0.4,
        frictionAir: 0.02,
        friction: 0.3,
        chamfer: { radius: 10 },
      });

      Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 0 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);

      return { elem, body };
    });

    cardBodies.forEach(({ elem }) => {
      elem.style.position = "absolute";
    });

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.8, render: { visible: false } },
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, mouseConstraint, ...cardBodies.map((cb) => cb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    let animId: number;
    const update = () => {
      cardBodies.forEach(({ body, elem }) => {
        elem.style.left = `${body.position.x}px`;
        elem.style.top = `${body.position.y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      animId = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(animId);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [started]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        width: "100%",
        height: 280,
        borderRadius: 0,
        background: "transparent",
      }}
    >
      {/* Initial positioned cards (before physics kicks in) */}
      <div ref={textRef} className="flex items-center justify-center flex-wrap" style={{ gap: 12, padding: 24, height: "100%" }}>
        {tools.map((t) => {
          const shortNames = ["Exa", "Trae"];
          const displayName = shortNames.includes(t.name) ? `${t.name} AI` : t.name;
          return (
            <div
              key={t.name}
              data-tool={t.name}
              className="flex items-center select-none"
              style={{
                gap: 12,
                padding: "10px 24px 10px 10px",
                background: "var(--color-bg-wash)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: 100,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logo} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)", pointerEvents: "none", whiteSpace: "nowrap" }}>{displayName}</span>
            </div>
          );
        })}
      </div>

      {/* Matter.js canvas */}
      <div className="absolute top-0 left-0 z-0" ref={canvasContainerRef} />
    </div>
  );
}
