import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import MatterAttractors from 'matter-attractors';

const MatterSimulation = () => {
  const canvasRef = useRef(null);
  const matterRef = useRef(null);

  useEffect(() => {
    // Use the attractors plugin
    Matter.use(MatterAttractors);

    function runMatter() {
      // module aliases
      var Engine = Matter.Engine,
        Events = Matter.Events,
        Runner = Matter.Runner,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Mouse = Matter.Mouse,
        Common = Matter.Common,
        Bodies = Matter.Bodies;

      // create engine
      var engine = Engine.create();

      // Disable gravity
      engine.world.gravity.y = 0;
      engine.world.gravity.x = 0;
      engine.world.gravity.scale = 0.1;

      // create renderer
      var render = Render.create({
        canvas: canvasRef.current,
        engine: engine,
        options: {
          showVelocity: false,
          width: window.innerWidth,
          height: window.innerHeight,
          wireframes: false,
          background: "transparent",
        },
      });

      // create runner
      var runner = Runner.create();

      // create demo scene
      var world = engine.world;
      world.gravity.scale = 0;

      // create a body with an attractor
      var attractiveBody = Bodies.circle(
        render.options.width / 2,
        render.options.height / 2,
        Math.max(window.innerWidth / 25, window.innerHeight / 25) / 2,
        {
          render: {
            fillStyle: `#000`,
            strokeStyle: `#000`,
            lineWidth: 0,
          },
          isStatic: true,
          plugin: {
            attractors: [
              function (bodyA, bodyB) {
                return {
                  x: (bodyA.position.x - bodyB.position.x) * 1e-6,
                  y: (bodyA.position.y - bodyB.position.y) * 1e-6,
                };
              },
            ],
          },
        }
      );

      World.add(world, attractiveBody);

      // add some bodies that will be attracted
      for (var i = 0; i < 60; i += 1) {
        let x = Common.random(0, render.options.width);
        let y = Common.random(0, render.options.height);
        let s = Common.random() > 0.6 ? Common.random(10, 80) : Common.random(4, 60);
        let polygonNumber = Common.random(3, 6);
        
        // Polygon body
        var body = Bodies.polygon(x, y, polygonNumber, s, {
          mass: s / 20,
          friction: 0,
          frictionAir: 0.02,
          angle: Math.round(Math.random() * 360),
          render: {
            fillStyle: "#222222",
            strokeStyle: `#000000`,
            lineWidth: 2,
          },
        });
        World.add(world, body);

        let r = Common.random(0, 1);
        
        // Small circle
        var smallCircle = Bodies.circle(x, y, Common.random(2, 8), {
          mass: 0.1,
          friction: 0,
          frictionAir: 0.01,
          render: {
            fillStyle: r > 0.3 ? `#27292d` : `#444444`,
            strokeStyle: `#000000`,
            lineWidth: 2,
          },
        });
        World.add(world, smallCircle);

        // Medium circle
        var mediumCircle = Bodies.circle(x, y, Common.random(2, 20), {
          mass: 6,
          friction: 0,
          frictionAir: 0,
          render: {
            fillStyle: r > 0.3 ? `#334443` : `#222222`,
            strokeStyle: `#111111`,
            lineWidth: 4,
          },
        });
        World.add(world, mediumCircle);

        // Large circle
        var largeCircle = Bodies.circle(x, y, Common.random(2, 30), {
          mass: 0.2,
          friction: 0.6,
          frictionAir: 0.8,
          render: {
            fillStyle: `#191919`,
            strokeStyle: `#111111`,
            lineWidth: 3,
          },
        });
        World.add(world, largeCircle);
      }

      // add mouse control
      var mouse = Mouse.create(render.canvas);

      Events.on(engine, "afterUpdate", function () {
        if (!mouse.position.x) return;
        // smoothly move the attractor body towards the mouse
        Body.translate(attractiveBody, {
          x: (mouse.position.x - attractiveBody.position.x) * 0.12,
          y: (mouse.position.y - attractiveBody.position.y) * 0.12,
        });
      });

      // run the renderer and engine
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);

      // return a reference to stop/play later if needed
      return { engine, runner, render };
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
          args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    matterRef.current = runMatter();

    const handleResize = debounce(() => {
      if (matterRef.current && matterRef.current.render) {
        matterRef.current.render.canvas.width = window.innerWidth;
        matterRef.current.render.canvas.height = window.innerHeight;
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (matterRef.current) {
        Matter.Render.stop(matterRef.current.render);
        Matter.Runner.stop(matterRef.current.runner);
      }
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default MatterSimulation;